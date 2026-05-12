import { useState } from "react";
import { MessageCircle, User, Clock, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStore, type ShareLink, type Address } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ChatView } from "@/components/site/ChatView";

export default function MessagesPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { links, addresses, messages } = useStore();
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Filter links that are of type "message" and have at least one message
  const chatLinks = links.filter(l => 
    l.type === "message" && 
    messages.some(m => m.linkId === l.id)
  );

  const filteredChats = chatLinks.filter(l => {
    const address = addresses.find(a => a.id === l.addressId);
    return address?.label.toLowerCase().includes(search.toLowerCase()) || 
           l.id.toLowerCase().includes(search.toLowerCase());
  });

  const getChatDetails = (link: ShareLink) => {
    const address = addresses.find(a => a.id === link.addressId);
    const lastMessage = [...messages].reverse().find(m => m.linkId === link.id);
    return { address, lastMessage };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-card rounded-3xl border border-border/60 overflow-hidden shadow-elegant">
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-border/60 flex flex-col ${selectedLinkId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border/60">
            <h1 className="font-display text-2xl font-semibold mb-4">{t("Messages", "Messages")}</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("Search chats...", "Rechercher...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl bg-muted/50 border-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">{t("No active chats found.", "Aucune conversation active.")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {filteredChats.map((link) => {
                  const { address, lastMessage } = getChatDetails(link);
                  const isActive = selectedLinkId === link.id;
                  
                  return (
                    <li key={link.id}>
                      <button
                        onClick={() => setSelectedLinkId(link.id)}
                        className={`w-full text-left p-4 flex gap-3 transition-colors ${
                          isActive ? "bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm truncate">{address?.label || t("Unknown", "Inconnu")}</p>
                            {lastMessage && (
                              <span className="text-[10px] text-muted-foreground tabular-nums">
                                {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMessage ? lastMessage.text : t("No messages yet", "Aucun message")}
                          </p>
                        </div>
                        {isActive && <div className="w-1 h-8 bg-primary rounded-full self-center" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Active Chat */}
        <div className={`flex-1 flex flex-col ${!selectedLinkId ? 'hidden md:flex' : 'flex'}`}>
          {selectedLinkId ? (
            <ChatView
              linkId={selectedLinkId}
              sender="user"
              userName={t("Delivery Agent", "Livreur")}
              onBack={() => setSelectedLinkId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-sm">{t("Select a conversation to start chatting", "Sélectionnez une conversation pour commencer")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
