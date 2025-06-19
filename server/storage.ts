import 'dotenv/config'

// luego tu código:
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { users, messages, type InsertUser, type User, type Message } from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(): Promise<Message[]>;
  createMessage(message: Omit<Message, "id" | "sentAt">): Promise<Message>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${insertUser.username}`
    }).returning();
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.sentAt);
  }

  async createMessage(message: Omit<Message, "id" | "sentAt">): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
