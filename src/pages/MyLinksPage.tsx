import { Link } from "react-router-dom";
import { useState } from "react";
import { Link2, Trash2, Copy, ExternalLink, Clock, MapPin, Lock, MessageCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, PLAN_LIMITS, type LinkType } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

function MyLinks() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();

  const limits = PLAN_LIMITS[store.user?.plan || "free"];
  const lastMonth = Date.now() - 30 * 24 * 3600 * 1000;
  
  const getUsage = (type: LinkType) => {
    const count = store.links.filter(l => l.type === type && l.createdAt > lastMonth).length;
    const limit = type === "anonymous" ? limits.anonymousLinks : type === "alias" ? limits.aliasLinks : Infinity;
    return { count, limit };
  };

  const anonymous = getUsage("anonymous");
  const alias = getUsage("alias");

  const isLimitReached = (anonymous.count >= anonymous.limit) || (alias.count >= alias.limit);

  const getAddress = (id: string) => store.addresses.find((a) => a.id === id);

  const copy = async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    toast.success(t("Link copied to clipboard", "Lien copié dans le presse-papier"));
  };

  const getLinkUrl = (link: any) => {
    if (link.type === "alias") return `pinpoint.app/@${link.alias}`;
    if (link.type === "message") return `pinpoint.app/m/${link.id}`;
    return `pinpoint.app/p/${link.id}`;
  };

  const getIcon = (type: LinkType) => {
    switch (type) {
      case "alias": return Link2;
      case "message": return MessageCircle;
      case "anonymous": return Lock;
      default: return Link2;
    }
  };

  const isExpired = (expiresAt?: number) => expiresAt && expiresAt < Date.now();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("My Links", "Mes Liens")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage the links you've shared with others.", "Gérez les liens que vous avez partagés avec d'autres.")}</p>
        </div>
        
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="px-4 py-2 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center gap-6">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t("Anonymous Links", "Liens Anonymes")}</p>
                <p className="text-xs font-bold tabular-nums">
                  {anonymous.count} / {anonymous.limit === Infinity ? "∞" : anonymous.limit}
                </p>
              </div>
              <div className="border-l border-border pl-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t("Alias Links", "Liens Alias")}</p>
                <p className="text-xs font-bold tabular-nums">
                  {alias.count} / {alias.limit === Infinity ? "∞" : alias.limit}
                </p>
              </div>
            </div>
            {isLimitReached && (
              <Button asChild size="sm" variant="ghost" className="rounded-full text-xs text-primary hover:bg-primary/5 h-8">
                <Link to="/app/pricing">{t("Upgrade", "Améliorer")} <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {store.links.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t("You haven't created any links yet.", "Vous n'avez pas encore créé de liens.")}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {store.links.map((link) => {
              const address = getAddress(link.addressId);
              const Icon = getIcon(link.type);
              const expired = isExpired(link.expiresAt);
              const url = getLinkUrl(link);

              return (
                <li key={link.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
                  <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${expired ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{url}</p>
                      {expired && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          {t("Expired", "Expiré")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {address?.label || t("Unknown Address", "Adresse inconnue")} 
                      <span className="mx-1 opacity-30">·</span>
                      <Clock className="w-3 h-3" />
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {link.type === "message" && (
                      <button
                        onClick={() => window.open(`/m/${link.id}`, '_blank')}
                        className="grid place-items-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-primary"
                        title={t("Open Chat", "Ouvrir le chat")}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => copy(`https://${url}`)}
                      className="grid place-items-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                      title={t("Copy", "Copier")}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => store.deleteLink(link.id)}
                      className="grid place-items-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive"
                      title={t("Delete", "Supprimer")}
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
      
      {!store.addresses.length && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-400">{t("No addresses found", "Aucune adresse trouvée")}</p>
            <p className="text-amber-700/80 dark:text-amber-500/80 mt-1">
              {t("You need to add an address before you can create sharing links.", "Vous devez ajouter une adresse avant de pouvoir créer des liens de partage.")}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 rounded-full border-amber-300 hover:bg-amber-100 text-amber-800">
              <Link2 className="w-4 h-4 mr-2" /> {t("Go to Onboarding", "Aller à l'Onboarding")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLinks;
