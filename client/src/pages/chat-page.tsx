import { useAuth } from "@/hooks/use-auth";
import { ChatWindow } from "@/components/chat/chat-window";
import { MessageInput } from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <span className="text-muted-foreground">
            Chatting as {user?.username}
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <ChatWindow />
        <MessageInput />
      </main>
    </div>
  );
}
