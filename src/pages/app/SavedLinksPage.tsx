import { useState } from "react";
import { RefreshCw, MapPin, Lock, Link2, MessageCircle, Plus, ExternalLink, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type LinkType } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

function detectType(url: string): LinkType {
  if (url.includes("/@")) return "alias";
  if (url.includes("/m/")) return "message";
  return "anonymous";
}

function Saved() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  // State for collapsible sections
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    alias: true,
    message: true,
    anonymous: true,
  });

  const handleToggleGroup = (type: LinkType) => {
    setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const refresh = async () => {
    setRefreshing(true);
    store.refreshSaved();
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
    toast.success(t("Saved Links refreshed", "Liens actualisés"));
  };

  const submit = () => {
    if (!url.trim()) return;
    store.addSaved({
      url: url.trim(),
      name: name.trim() || "Anonymous",
      type: detectType(url),
      status: "active",
    });
    setUrl(""); setName(""); setAdding(false);
    toast.success(t("Link saved", "Lien enregistré"));
  };

  const icon = (typ: LinkType) => typ === "alias" ? Link2 : typ === "message" ? MessageCircle : Lock;

  // Group links by type
  const groupedLinks = store.saved.reduce((acc, s) => {
    if (!acc[s.type]) {
      acc[s.type] = [];
    }
    acc[s.type].push(s);
    return acc;
  }, {} as { [key in LinkType]: typeof store.saved });

  const linkTypes: LinkType[] = ["alias", "message", "anonymous"]; // Define order

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("Saved Links", "Liens enregistrés")}</h1>
          <p className="text-muted-foreground mt-1">{t("Your address book, built automatically.", "Votre carnet d’adresses, créé automatiquement.")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} className="rounded-full" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> {t("Refresh", "Rafraîchir")}
          </Button>
          <Button onClick={() => setAdding((s) => !s)} className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
            <Plus className="w-4 h-4 mr-1.5" /> {t("Add link", "Ajouter")}
          </Button>
        </div>
      </header>

      {adding && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <Input placeholder={t("Paste a PinPoint link", "Collez un lien PinPoint")} value={url} onChange={(e) => setUrl(e.target.value)} className="h-11" />
          <Input placeholder={t("Sender name (optional)", "Nom de l’expéditeur (optionnel)")} value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setAdding(false)}>{t("Cancel", "Annuler")}</Button>
            <Button onClick={submit} className="rounded-full bg-foreground text-background">{t("Save", "Enregistrer")}</Button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {store.saved.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">{t("No saved links yet.", "Aucun lien enregistré.")}</div>
        ) : (
          linkTypes.map((type) => {
            const linksOfType = groupedLinks[type] || [];
            const isExpanded = expandedGroups[type];
            const Icon = icon(type);
            const groupTitle = type.charAt(0).toUpperCase() + type.slice(1);

            if (linksOfType.length === 0) return null; // Skip if no links of this type

            return (
              <div key={type} className="border-b border-border">
                <button
                  onClick={() => handleToggleGroup(type)}
                  className="w-full px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 bg-primary/10 text-primary`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="font-medium text-lg flex items-center gap-2">
                      {groupTitle}
                      <span className="text-muted-foreground text-sm font-normal">({linksOfType.length})</span>
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <ul className="divide-y divide-border">
                    {linksOfType.map((s) => {
                      const active = s.status === "active";
                      return (
                        <li key={s.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
                          <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${active ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate flex items-center gap-2">
                              {s.addressSnapshot?.label ?? s.url}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {s.name} · <span className="capitalize">{s.type}</span> · {timeAgo(s.receivedAt, lang)}
                              {s.disabledReason && <> · {s.disabledReason}</>}
                            </p>
                          </div>
                          <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                            active
                              ? "border-primary/30 text-primary bg-primary/10"
                              : "border-border text-muted-foreground bg-muted"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground/50"}`} />
                            {active ? t("Active", "Actif") : t("Disabled", "Désactivé")}
                          </span>
                          <div className="flex items-center gap-1">
                            {active && s.addressSnapshot && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${s.addressSnapshot.lat},${s.addressSnapshot.lng}`}
                                target="_blank" rel="noreferrer"
                                className="grid place-items-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                                title={t("Navigate", "Naviguer")}
                              >
                                <MapPin className="w-4 h-4" />
                              </a>
                            )}
                            <a
                              href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                              target="_blank" rel="noreferrer"
                              className="grid place-items-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                              title={t("Open", "Ouvrir")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => store.deleteSaved(s.id)}
                              className="grid place-items-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive"
                              title={t("Remove", "Retirer")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function timeAgo(ts: number, lang: string) {
  const sec = (Date.now() - ts) / 1000;
  if (sec < 60) return lang === "fr" ? "à l’instant" : "just now";
  const min = sec / 60;
  if (min < 60) return lang === "fr" ? `il y a ${Math.floor(min)} min` : `${Math.floor(min)}m ago`;
  const hr = min / 60;
  if (hr < 24) return lang === "fr" ? `il y a ${Math.floor(hr)} h` : `${Math.floor(hr)}h ago`;
  const d = hr / 24;
  if (d < 30) return lang === "fr" ? `il y a ${Math.floor(d)} j` : `${Math.floor(d)}d ago`;
  return new Date(ts).toLocaleDateString();
}
export default Saved;