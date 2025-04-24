import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeMessage } from "./openai";
import { insertMessageSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validation = insertMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const message = await storage.createMessage({
      ...validation.data,
      senderId: req.user!.id,
      aiAnalysis: null,
      sentiment: null
    });

    // Analyze message with AI
    const analysis = await analyzeMessage(message.content);
    message.aiAnalysis = analysis.analysis;
    message.sentiment = analysis.sentiment;

    res.status(201).json(message);
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  setupWebSocket(httpServer);

  return httpServer;
}