// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url")
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  aiAnalysis: text("ai_analysis"),
  sentiment: integer("sentiment")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  senderId: true
});

// server/storage.ts
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var PostgresSessionStore = connectPg(session);
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  async getUser(id) {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }
  async getUserByUsername(username) {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${insertUser.username}`
    }).returning();
    return user;
  }
  async getMessages() {
    return await db.select().from(messages).orderBy(messages.sentAt);
  }
  async createMessage(message) {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "development_secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function analyzeMessage(text2) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the message for social media management context. Provide a brief analysis and sentiment score (1-5). Return JSON: { 'analysis': string, 'sentiment': number }"
        },
        {
          role: "user",
          content: text2
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content);
    return {
      analysis: result.analysis,
      sentiment: Math.max(1, Math.min(5, Math.round(result.sentiment)))
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      analysis: "Failed to analyze message",
      sentiment: 3
    };
  }
}

// server/websocket.ts
import { Server } from "socket.io";
function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log("New Socket.IO connection");
    socket.on("chat", async (message) => {
      try {
        socket.broadcast.emit("chat", message);
        const storedMessage = await storage.createMessage({
          content: message.content,
          senderId: message.senderId,
          aiAnalysis: null,
          sentiment: null
        });
        const analysis = await analyzeMessage(message.content);
        storedMessage.aiAnalysis = analysis.analysis;
        storedMessage.sentiment = analysis.sentiment;
        socket.emit("analysis", {
          messageId: storedMessage.id,
          analysis
        });
      } catch (error) {
        console.error("Socket.IO error:", error);
        socket.emit("error", {
          message: "Error processing message"
        });
      }
    });
  });
  return io;
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages2 = await storage.getMessages();
    res.json(messages2);
  });
  app2.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validation = insertMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    const message = await storage.createMessage({
      ...validation.data,
      senderId: req.user.id,
      aiAnalysis: null,
      sentiment: null
    });
    const analysis = await analyzeMessage(message.content);
    message.aiAnalysis = analysis.analysis;
    message.sentiment = analysis.sentiment;
    res.status(201).json(message);
  });
  const httpServer = createServer(app2);
  setupWebSocket(httpServer);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// vite.config.ts
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = (void 0)({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = (void 0)();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await (void 0)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the frontend before starting the server.`
    );
  }
  app2.use(express.static(distPath));
  app2.get("*", (req, res) => {
    res.sendFile(path2.join(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
