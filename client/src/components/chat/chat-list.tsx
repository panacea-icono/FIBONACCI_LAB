import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@shared/schema";

interface ChatListProps {
  messages: Message[];
  currentUserId: number;
}

export default function ChatList({ messages, currentUserId }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] px-4">
      <div className="space-y-4 py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
