import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ChatList from "@/components/chat/chat-list";
import ChatInput from "@/components/chat/chat-input";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { connectWebSocket, sendMessage } from "@/lib/websocket";
import { UserCircle2 } from "lucide-react";

export default function ChatPage() {
  const { user, logoutMutation } = useAuth();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  useEffect(() => {
    const ws = connectWebSocket();

    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          // Actualizar mensajes cuando recibimos uno nuevo
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        }
      };
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      sendMessage(content, user!.id);
      const res = await apiRequest("POST", "/api/messages", {
        content,
        senderId: user!.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    }
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <UserCircle2 className="w-8 h-8 text-muted-foreground" />
          )}
          <span className="font-medium">{user?.username}</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          Logout
        </Button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <ChatList messages={messages} currentUserId={user!.id} />
        <ChatInput 
          onSend={(content) => sendMessageMutation.mutate(content)}
          disabled={sendMessageMutation.isPending}
        />
      </main>
    </div>
  );
}