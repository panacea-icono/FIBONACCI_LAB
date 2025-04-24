import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSend(content);
      setContent("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
    >
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="resize-none"
          rows={1}
          disabled={disabled}
        />
        <Button type="submit" size="icon" disabled={disabled || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
