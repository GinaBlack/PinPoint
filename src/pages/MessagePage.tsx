import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { MapPin, MessageCircle, Navigation, Info, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PinMap } from "@/components/site/PinMap";
import { ChatView } from "@/components/site/ChatView";
import { Navbar } from "@/components/site/Navbar";
import NotFound from "./NotFound";

export default function MessagePage() {
  const { linkId } = useParams();
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  const [showChat, setShowChat] = useState(false);

  // Find the link in store
  const link = store.links.find(l => l.id === linkId && l.type === "message");
  const address = link ? store.addresses.find(a => a.id === link.addressId) : null;

  if (!link || !address) return <NotFound />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-64px)]">
        {/* Left Side: Map and Info */}
        <div className={`flex-1 flex flex-col border-r border-border/60 ${showChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 relative">
            <PinMap value={{ lat: address.lat, lng: address.lng }} interactive={false} />
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border/60 shadow-elegant pointer-events-auto max-w-[280px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h2 className="font-display font-semibold text-lg truncate">{address.label}</h2>
                </div>
                {address.notes && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-xl">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <p className="line-clamp-3">{address.notes}</p>
                    </div>
                    {address.photos && address.photos.length > 0 && (
                      <div className="flex gap-2">
                        {address.photos.map((url, i) => (
                          <img key={i} src={url} alt={address.label} className="w-12 h-12 rounded-lg object-cover border border-border/50" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <Button asChild className="rounded-full shadow-pin pointer-events-auto">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`} target="_blank" rel="noreferrer">
                  <Navigation className="w-4 h-4 mr-2" />
                  {t("Navigate", "Naviguer")}
                </a>
              </Button>
            </div>
          </div>

          <div className="p-6 bg-card border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("Delivery Location", "Lieu de livraison")}</p>
                <p className="font-medium">{address.lat.toFixed(5)}, {address.lng.toFixed(5)}</p>
              </div>
            </div>
            
            <Button onClick={() => setShowChat(true)} className="md:hidden rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Chat with Customer", "Chat avec le client")}
            </Button>
          </div>
        </div>

        {/* Right Side: Chat */}
        <div className={`w-full md:w-[400px] border-l border-border/60 transition-all duration-300 ${showChat ? 'flex' : 'hidden md:flex'}`}>
          <ChatView 
            onBack={() => setShowChat(false)} 
            userName={t("Customer", "Client")} 
            linkId={link.id}
            sender="agent"
          />
        </div>
      </main>
    </div>
  );
}
