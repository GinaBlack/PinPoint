import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, MapPin, Plus, Share2, Trash2, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PinMap } from "@/components/site/PinMap";
import { toast } from "sonner";

export const Route = createFileRoute("/app/addresses")({
  component: Addresses,
});

function Addresses() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = store.addresses.find((a) => a.id === selectedId) ?? store.addresses[0];

  const copy = async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    toast.success(t("Copied", "Copié"));
  };

  if (store.addresses.length === 0) {
    return <Empty t={t} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("My addresses", "Mes adresses")}</h1>
          <p className="text-muted-foreground mt-1">{t("Switch between locations in seconds.", "Passez d’un lieu à l’autre en quelques secondes.")}</p>
        </div>
        <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
          <Link to="/onboarding"><Plus className="w-4 h-4 mr-1.5" /> {t("Add", "Ajouter")}</Link>
        </Button>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <ul className="space-y-2">
          {store.addresses.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => setSelectedId(a.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  selected?.id === a.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"
                }`}
              >
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{a.label}</p>
                  <p className="text-xs text-muted-foreground tabular-nums truncate">{a.lat.toFixed(4)}, {a.lng.toFixed(4)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <div className="space-y-5">
            <PinMap
              value={{ lat: selected.lat, lng: selected.lng }}
              onChange={(p) => store.updateAddress(selected.id, p)}
              height={360}
            />
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div>
                <label className="text-sm font-medium">{t("Label", "Étiquette")}</label>
                <Input
                  value={selected.label}
                  onChange={(e) => store.updateAddress(selected.id, { label: e.target.value })}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("Public alias", "Alias public")}</label>
                <div className="mt-1.5 flex items-center gap-1 rounded-lg border border-input bg-background px-3 h-11">
                  <span className="text-muted-foreground text-sm">pinpoint.app/@</span>
                  <input
                    value={selected.alias ?? ""}
                    onChange={(e) => store.updateAddress(selected.id, { alias: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })}
                    placeholder="ChezMarie"
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5"><Globe2 className="w-4 h-4" />{t("Public alias search", "Recherche publique")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("Let anyone find this address by its alias.", "Tout le monde peut trouver cette adresse par son alias.")}</p>
                </div>
                <Switch
                  checked={!!selected.isPublic}
                  onCheckedChange={(v) => store.updateAddress(selected.id, { isPublic: v })}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.alias && (
                  <Button variant="outline" className="rounded-full" onClick={() => copy(`https://pinpoint.app/@${selected.alias}`)}>
                    <Copy className="w-4 h-4 mr-1.5" /> {t("Copy alias link", "Copier le lien alias")}
                  </Button>
                )}
                <Button variant="outline" className="rounded-full" onClick={() => copy(`https://pinpoint.app/p/${selected.id}`)}>
                  <Share2 className="w-4 h-4 mr-1.5" /> {t("Copy share link", "Copier le lien")}
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full text-destructive hover:text-destructive ml-auto"
                  onClick={() => {
                    store.deleteAddress(selected.id);
                    setSelectedId(null);
                    toast.success(t("Deleted", "Supprimé"));
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> {t("Delete", "Supprimer")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ t }: { t: (a: string, b: string) => string }) {
  return (
    <div className="text-center py-20">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-pin"><MapPin /></div>
      <h2 className="mt-6 font-display text-2xl font-semibold">{t("No addresses yet", "Aucune adresse")}</h2>
      <p className="mt-2 text-muted-foreground">{t("Drop your first pin to get started.", "Posez votre première épingle pour commencer.")}</p>
      <Button asChild className="mt-6 rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
        <Link to="/onboarding"><Plus className="w-4 h-4 mr-1.5" /> {t("Add address", "Ajouter une adresse")}</Link>
      </Button>
    </div>
  );
}