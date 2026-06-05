import { useState, useEffect, useRef } from "react";
import { Send, User, MapPin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { useStore, type ChatMessage } from "@/lib/store";

interface ChatViewProps {
  onBack?: () => void;
  userName?: string;
  linkId: string;
  sender: "agent" | "user";
}

export function ChatView({ onBack, userName = "User", linkId, sender }: ChatViewProps) {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { messages, addMessage } = useStore();
  
  const chatMessages = messages.filter(m => m.linkId === linkId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage({
      linkId,
      sender,
      text: input,
    });
    
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border/60 flex items-center gap-3 bg-muted/30">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">{userName}</p>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{t("Online", "En ligne")}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">{t("No messages yet. Start the conversation!", "Aucun message pour l'instant. Commencez la conversation !")}</p>
            </div>
          )}
          {chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === sender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender === sender
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none border border-border/50"
                }`}
              >
                {m.text}
                <p className={`text-[10px] mt-1 opacity-70 ${m.sender === sender ? "text-right" : "text-left"}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t border-border/60 bg-muted/30 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("Type a message...", "Tapez un message...")}
          className="rounded-full bg-background border-border/60"
        />
        <Button type="submit" size="icon" className="rounded-full bg-primary text-primary-foreground shrink-0 shadow-md">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
