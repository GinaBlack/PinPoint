import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, MessageCircle, Navigation, Info, ChevronLeft, CheckCircle2, XCircle, Clock, ExternalLink, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, DeliveryStatus } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PinMap } from "@/components/site/PinMap";
import { ChatView } from "@/components/site/ChatView";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";
import NotFound from "../errors/NotFound";

export default function MessagePage() {
  const { linkId } = useParams();
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  const [showChat, setShowChat] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  
  // Delivery State
  const [deliveryId, setDeliveryId] = useState<string | null>(localStorage.getItem(`del_${linkId}`));
  const [status, setStatus] = useState<DeliveryStatus>("pending");

  // Find the link in store
  const link = store.links.find(l => l.id === linkId && l.type === "message");
  const address = link ? store.addresses.find(a => a.id === link.addressId) : null;

  const startTracking = async () => {
    if (!link || !address) return;
    try {
      const id = await store.startDelivery(link.id, address.userId);
      setDeliveryId(id);
      localStorage.setItem(`del_${linkId}`, id);
      setStatus("in_transit");
      toast.info(t("Delivery started", "Livraison commencée"));
      
      // Open external navigation
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`, "_blank");
    } catch (err) {
      toast.error("Failed to start delivery tracking");
    }
  };

  const completeDelivery = async (finalStatus: "delivered" | "failed") => {
    if (!deliveryId) return;
    
    // Get current location for accuracy verification
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      
      // Accuracy Check: Calculate distance to pin
      const dist = calculateDistance(lat, lng, address!.lat, address!.lng);
      if (finalStatus === "delivered" && dist > 0.1) { // 100 meters
        toast.warning(t("You are not at the pin location. Are you sure?", "Vous n'êtes pas au point de livraison. Êtes-vous sûr ?"));
      }

      await store.updateDeliveryStatus(deliveryId, finalStatus, { lat, lng });
      setStatus(finalStatus);
      toast.success(finalStatus === "delivered" ? t("Delivered!", "Livré !") : t("Delivery marked as failed", "Échec de livraison"));
    }, () => {
      // If GPS fails, still allow update but without coordinates
      store.updateDeliveryStatus(deliveryId, finalStatus);
      setStatus(finalStatus);
    });
  };

  // Haversine formula for distance in km
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  if (!link || !address) return <NotFound />;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Navigation Sidebar (Mobile: Bottom Sheet, Desktop: Sidebar) */}
        <div className={`flex-1 flex flex-col border-r border-border/60 ${showChat ? 'hidden md:flex' : 'flex'} overflow-hidden`}>
          
          <div className="flex-1 relative overflow-hidden">
            <PinMap value={{ lat: address.lat, lng: address.lng }} interactive={false} />
            
            {/* Top Overlay: Address Header */}
            <div className="absolute top-4 left-4 right-4 flex flex-col gap-4">
              <div className="bg-background/90 backdrop-blur-md p-4 rounded-3xl border border-border/60 shadow-elegant animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-pin">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display font-semibold text-lg truncate leading-tight">{address.label}</h2>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{t("Delivery Target", "Cible de livraison")}</p>
                    </div>
                  </div>
                  {status !== "pending" && (
                    <Badge className={`capitalize shadow-sm ${
                      status === "in_transit" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : 
                      status === "delivered" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                    }`}>
                      {status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>

                {address.notes && (
                  <div className="mt-4 flex gap-2.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <Info className="w-4 h-4 shrink-0 text-primary" />
                    <p className="italic">"{address.notes}"</p>
                  </div>
                )}

                {address.photos && address.photos.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {address.photos.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActivePhoto(p)}
                        className="w-12 h-12 rounded-xl border border-border overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img src={p} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Floating Controls */}
            <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-3">
              {status === "pending" ? (
                <div className="flex flex-col gap-2">
                  <Button onClick={startTracking} className="h-14 rounded-2xl shadow-pin bg-primary text-primary-foreground hover:opacity-95 text-base font-bold w-full">
                    <Navigation className="w-5 h-5 mr-2" />
                    {t("Start Delivery", "Commencer la livraison")}
                  </Button>
                </div>
              ) : status === "in_transit" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="secondary" className="h-12 rounded-2xl border-border/50 shadow-sm font-bold">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Google Maps
                      </a>
                    </Button>
                    <Button asChild variant="secondary" className="h-12 rounded-2xl border-border/50 shadow-sm font-bold">
                      <a href={`https://waze.com/ul?ll=${address.lat},${address.lng}&navigate=yes`} target="_blank" rel="noreferrer">
                        <Navigation className="w-4 h-4 mr-2" /> Waze
                      </a>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => completeDelivery("delivered")} className="h-14 rounded-2xl shadow-pin bg-green-600 hover:bg-green-700 text-white font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {t("Delivered", "C'est livré")}
                    </Button>
                    <Button onClick={() => completeDelivery("failed")} variant="destructive" className="h-14 rounded-2xl shadow-pin font-bold text-sm">
                      <XCircle className="w-5 h-5 mr-2" />
                      {t("Report Issue", "Signaler")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-background/90 backdrop-blur-md p-4 rounded-3xl border border-border/60 shadow-elegant text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {status === "delivered" ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                    <span className="text-xl font-display font-bold uppercase tracking-tight">
                      {status === "delivered" ? t("Mission Accomplished", "Mission Accomplie") : t("Delivery Failed", "Échec Livraison")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t("Status has been reported to the customer.", "Le statut a été signalé au client.")}</p>
                </div>
              )}

              <Button onClick={() => setShowChat(true)} className="md:hidden h-14 rounded-2xl bg-card border border-border/60 text-foreground hover:bg-muted font-bold shadow-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("Chat with Customer", "Chat avec le client")}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Chat (Always Visible) / Mobile Chat (Overlay) */}
        <div className={`w-full md:w-[450px] border-l border-border/60 transition-all duration-300 ${showChat ? 'fixed inset-0 z-50 md:relative' : 'hidden md:flex'}`}>
          <ChatView 
            onBack={() => setShowChat(false)} 
            userName={t("Customer", "Client")} 
            linkId={link.id}
            sender="agent"
          />
        </div>
      </main>

      {/* Photo Lightbox */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActivePhoto(null)}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
            onClick={() => setActivePhoto(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img 
            src={activePhoto} 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${className}`}>
      {children}
    </span>
  );
}
