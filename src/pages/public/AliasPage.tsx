import { NavLink} from "../../components/NavLink";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, MapPin, MessageCircle, Navigation, Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { findByAlias, useStore, type Address } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PinMap } from "@/components/site/PinMap";
import { toast } from "sonner";


function AliasPage() {
  const { alias } = useParams();
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const [addr, setAddr] = useState<Address | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const store = useStore();

  useEffect(() => {
    if (alias) {
      setLoading(true);
      findByAlias(alias).then((res) => {
        setAddr(res);
        setLoading(false);
        if (res) {
          store.recordEvent("click", res.id, res.userId);
        }
      });
    }
  }, [alias]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="text-muted-foreground">{t("Loading...", "Chargement...")}</p>
        </div>
      </div>
    );
  }

  if (addr === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="text-muted-foreground">{t("This address is not public, has been removed, or doesn’t exist.", "Cette adresse n’est pas publique, a été supprimée, ou n’existe pas.")}</p>
          <Button asChild variant="outline" className="rounded-full mt-6"><Link to="/search">{t("Try search", "Essayer la recherche")}</Link></Button>
        </div>
      </div>
    );
  }

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${addr.lat},${addr.lng}`;

  const save = () => {
    store.addSaved({
      url: `pin-point-zeta.vercel.app/@${addr.alias}`,
      name: addr.label,
      type: "alias",
      status: "active",
      addressSnapshot: { lat: addr.lat, lng: addr.lng, label: addr.label },
    });
    toast.success(t("Added to Saved Links", "Ajouté aux liens enregistrés"));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground shadow-pin"><MapPin className="w-5 h-5" /></span>
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight flex items-center gap-2">
              {addr.label}
              {addr.isBusiness && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full"><Building2 className="w-3 h-3" /> {t("Business", "Entreprise")}</span>
              )}
            </h1>
            <p className="text-sm text-primary">pin-point-zeta.vercel.app/@{addr.alias}</p>
          </div>
        </div>

        <PinMap value={{ lat: addr.lat, lng: addr.lng }} interactive={false} height={360} />

        {addr.notes && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium">{t("Note from owner", "Note du propriétaire")}</p>
            <p className="text-muted-foreground mt-1">{addr.notes}</p>
          </div>
        )}

        {addr.photos && addr.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {addr.photos.map((url, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-2xl border border-border overflow-hidden cursor-zoom-in group/photo"
                onClick={() => setLightboxPhoto(url)}
              >
                <img src={url} alt={addr.label} className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 h-12 px-5">
            <a href={navUrl} target="_blank" rel="noreferrer"><Navigation className="w-4 h-4 mr-1.5" /> {t("Navigate", "Naviguer")}</a>
          </Button>
          <Button variant="outline" className="rounded-full h-12 px-5" onClick={save}>
            <Bookmark className="w-4 h-4 mr-1.5" /> {t("Save link", "Enregistrer")}
          </Button>
          <Button variant="outline" className="rounded-full h-12 px-5">
            <MessageCircle className="w-4 h-4 mr-1.5" /> {t("Message", "Message")}
          </Button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setLightboxPhoto(null)}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
            onClick={() => setLightboxPhoto(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img 
            src={lightboxPhoto} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
export default AliasPage;