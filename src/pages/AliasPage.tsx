import { NavLink} from "../components/NavLink";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, MapPin, MessageCircle, Navigation, Bookmark } from "lucide-react";
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
  const store = useStore();

  useEffect(() => {
    setAddr(findByAlias(alias));
  }, [alias]);

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
      url: `pinpoint.app/@${addr.alias}`,
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
            <p className="text-sm text-primary">pinpoint.app/@{addr.alias}</p>
          </div>
        </div>

        <PinMap value={{ lat: addr.lat, lng: addr.lng }} interactive={false} height={360} />

        {addr.notes && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium">{t("Note from owner", "Note du propriétaire")}</p>
            <p className="text-muted-foreground mt-1">{addr.notes}</p>
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
    </div>
  );
}
export default AliasPage;