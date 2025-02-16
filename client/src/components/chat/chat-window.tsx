import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function ChatWindow() {
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4">
        {messages?.map((message) => (
          <Card key={message.id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-medium">{message.content}</p>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.createdAt), "HH:mm")}
                </span>
              </div>
              {message.aiAnalysis && (
                <div className="text-sm text-muted-foreground border-t pt-2 mt-2">
                  <p>AI Analysis:</p>
                  <pre className="text-xs mt-1">
                    {JSON.stringify(JSON.parse(message.aiAnalysis), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
