import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { storage } from "./storage";
import { analyzeMessage } from "./openai";
import type { Message } from "@shared/schema";

export function setupWebSocket(server: HTTPServer) {
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
        // Broadcast message to all connected clients
        socket.broadcast.emit("chat", message);

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
        socket.emit("analysis", {
          messageId: storedMessage.id,
          analysis: analysis
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