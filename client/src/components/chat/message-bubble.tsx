import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex flex-col max-w-[70%] space-y-2",
      isOwn ? "ml-auto items-end" : "items-start"
    )}>
      <Card className={cn(
        "px-4 py-2",
        isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <p>{message.content}</p>
      </Card>
      
      {message.aiAnalysis && (
        <Card className="px-3 py-1 text-xs bg-accent text-accent-foreground">
          <p>AI Analysis: {message.aiAnalysis}</p>
          <p>Sentiment: {"⭐".repeat(message.sentiment || 0)}</p>
        </Card>
      )}
      
      <span className="text-xs text-muted-foreground">
        {format(new Date(message.sentAt), "HH:mm")}
      </span>
    </div>
  );
}
