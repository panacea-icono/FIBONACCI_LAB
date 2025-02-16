import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeSentiment } from "./openai";
import { insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getMessages(req.user.id);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsedBody = insertMessageSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    const message = await storage.createMessage(parsedBody);
    
    // Analyze message sentiment
    try {
      const analysis = await analyzeSentiment(message.content);
      const updatedMessage = await storage.updateMessageAnalysis(
        message.id,
        JSON.stringify(analysis)
      );
      res.json(updatedMessage);
    } catch (error) {
      res.json(message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
