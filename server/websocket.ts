import { Server as HTTPServer } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { analyzeMessage } from "./openai";
import type { Message } from "@shared/schema";

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString()) as {
          type: string;
          content: string;
          senderId: number;
        };

        if (message.type === "chat") {
          // Broadcast message to all connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocketServer.OPEN) {
              client.send(JSON.stringify(message));
            }
          });

          // Store message in database
          const storedMessage = await storage.createMessage({
            content: message.content,
            senderId: message.senderId,
            aiAnalysis: null,
            sentiment: null
          });

          // Analyze message with AI
          const analysis = await analyzeMessage(message.content);

          // Update the stored message with AI analysis
          storedMessage.aiAnalysis = analysis.analysis;
          storedMessage.sentiment = analysis.sentiment;

          // Send analysis back to sender
          ws.send(JSON.stringify({
            type: "analysis",
            messageId: storedMessage.id,
            analysis: analysis
          }));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "Error processing message" 
        }));
      }
    });
  });

  return wss;
}