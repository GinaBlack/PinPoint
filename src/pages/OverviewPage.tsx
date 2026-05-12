import { motion } from "framer-motion";
import { MapPin, Bookmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import {NavLink} from "../components/NavLink"
import { PinMap } from "@/components/site/PinMap";


const OveviewPage = () => {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { addresses, links, saved } = useStore();

  const center = addresses[0]
  ? { lat: addresses[0].lat, lng: addresses[0].lng }
  : { lat: 4.0511, lng: 9.7679 };

  return (
   <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{t("Welcome", "Bienvenue")}</p>
          <h1 className="font-display text-4xl font-semibold mt-1">{t("Your addresses", "Vos adresses")}</h1>
        </div>
        <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
          <NavLink to="/app/addresses"><Plus className="w-4 h-4 mr-1.5" /> {t("Add new", "Ajouter")}</NavLink>
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Stat label={t("Saved addresses", "Adresses enregistrées")} value={addresses.length} />
        <Stat label={t("Active links", "Liens actifs")} value={links.length} />
        <Stat label={t("Received links", "Liens reçus")} value={saved.length} />
      </div>

      <div>
        <PinMap
          value={center}
          interactive={false}
          height={320}
          markers={addresses.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.label }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <NavLink to="/app/addresses" className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-all flex items-start gap-4">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground"><MapPin className="w-5 h-5" /></span>
          <div>
            <p className="font-display text-lg font-semibold">{t("Manage addresses", "Gérer les adresses")}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{t("Edit, delete, add aliases.", "Modifier, supprimer, ajouter des alias.")}</p>
          </div>
        </NavLink>
        <NavLink to="/app/saved" className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-all flex items-start gap-4">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/30 text-accent-foreground"><Bookmark className="w-5 h-5" /></span>
          <div>
            <p className="font-display text-lg font-semibold">{t("Saved Links", "Liens enregistrés")}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{t("Addresses people sent you.", "Adresses qu’on vous a envoyées.")}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default OveviewPage;
