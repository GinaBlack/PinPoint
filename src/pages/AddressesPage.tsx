import { Link } from "react-router-dom";
import { useState } from "react";
import { Copy, MapPin, Plus, Share2, Trash2, Globe2, Home, User, Building2, Link2, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStore, PLAN_LIMITS, type AddressType, type LinkType } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PinMap } from "@/components/site/PinMap";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function Addresses() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [newLinkType, setNewLinkType] = useState<LinkType>("alias");

  const addressLimit = PLAN_LIMITS[store.user?.plan || "basic"].addresses;
  const linkLimit = PLAN_LIMITS[store.user?.plan || "basic"].links;
  
  const isAddressLimitReached = store.addresses.length >= addressLimit;
  const isLinkLimitReached = store.links.length >= linkLimit;

  const selected = store.addresses.find((a) => a.id === selectedId) ?? store.addresses[0];

  const copy = async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    toast.success(t("Copied", "Copié"));
  };

  const handleGenerateLink = () => {
    if (!selected) return;
    
    const result = store.addLink({
      addressId: selected.id,
      type: newLinkType,
      alias: newLinkType === "alias" ? selected.alias : undefined,
      expiresAt: newLinkType === "anonymous" ? Date.now() + 24 * 3600 * 1000 : undefined,
    });

    if (result.success) {
      toast.success(t("Link generated successfully!", "Lien généré avec succès !"));
      setIsLinkDialogOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const getIcon = (type: AddressType) => {
    switch (type) {
      case "home": return Home;
      case "personal": return User;
      case "business": return Building2;
      default: return MapPin;
    }
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
        <div className="flex flex-col items-end gap-2">
          <Button 
            asChild={!isAddressLimitReached} 
            disabled={isAddressLimitReached}
            className={`rounded-full shadow-pin border-0 ${isAddressLimitReached ? 'bg-muted cursor-not-allowed' : 'bg-gradient-primary text-primary-foreground hover:opacity-90'}`}
            onClick={() => isAddressLimitReached && toast.error(t(`Limit reached: Your plan allows only ${addressLimit} addresses.`, `Limite atteinte : Votre forfait n'autorise que ${addressLimit} adresses.`))}
          >
            {isAddressLimitReached ? (
              <span><Plus className="w-4 h-4 mr-1.5" /> {t("Add", "Ajouter")}</span>
            ) : (
              <Link to="/onboarding"><Plus className="w-4 h-4 mr-1.5" /> {t("Add", "Ajouter")}</Link>
            )}
          </Button>
          {isAddressLimitReached && (
            <Link to="/app/pricing" className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
              {t("Upgrade to add more", "Améliorer pour en ajouter plus")}
            </Link>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <ul className="space-y-2">
          {store.addresses.map((a) => {
            const Icon = getIcon(a.type);
            return (
              <li key={a.id}>
                <button
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    selected?.id === a.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"
                  }`}
                >
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      {t(a.type, a.type)} {a.businessName && `· ${a.businessName}`}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {selected && (
          <div className="space-y-5">
            <PinMap
              value={{ lat: selected.lat, lng: selected.lng }}
              onChange={(p) => store.updateAddress(selected.id, p)}
              height={360}
            />
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {(["personal", "home", "business"] as AddressType[]).map((type) => (
                  <Button
                    key={type}
                    variant={selected.type === type ? "default" : "outline"}
                    onClick={() => store.updateAddress(selected.id, { type })}
                    className="capitalize rounded-xl text-xs h-9"
                  >
                    {t(type, type)}
                  </Button>
                ))}
              </div>

              {selected.type === "business" && (
                <div>
                  <label className="text-sm font-medium">{t("Business Name", "Nom de l'entreprise")}</label>
                  <Input 
                    value={selected.businessName ?? ""} 
                    onChange={(e) => store.updateAddress(selected.id, { businessName: e.target.value })} 
                    className="mt-1.5 h-11" 
                    placeholder="e.g. Douala Electronics"
                  />
                </div>
              )}

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
                <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      <Share2 className="w-4 h-4 mr-1.5" /> {t("Generate Share Link", "Générer un lien")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("Generate Sharing Link", "Générer un lien de partage")}</DialogTitle>
                      <DialogDescription>
                        {t("Choose how you want to share this address.", "Choisissez comment vous souhaitez partager cette adresse.")}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-3 py-4">
                      {[
                        { id: "anonymous", label: t("Anonymous", "Anonyme"), icon: Lock, desc: t("Disappears after 24h", "Disparaît après 24h") },
                        { id: "alias", label: t("Alias", "Alias"), icon: Link2, desc: t("Permanent public link", "Lien public permanent") },
                        { id: "message", label: t("Message", "Message"), icon: MessageCircle, desc: t("Direct chat with agent", "Chat direct avec le livreur") }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setNewLinkType(type.id as LinkType)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                            newLinkType === type.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-foreground/20 bg-card"
                          }`}
                        >
                          <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${newLinkType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            <type.icon className="w-5 h-5" />
                          </span>
                          <div>
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
                        {t("Usage", "Utilisation")}: {store.links.length} / {linkLimit === Infinity ? "∞" : linkLimit} {t("links", "liens")}
                      </p>
                      <Button onClick={handleGenerateLink} disabled={isLinkLimitReached} className="rounded-xl w-full">
                        {t("Generate Link", "Générer le lien")}
                      </Button>
                      {isLinkLimitReached && (
                        <p className="text-[10px] text-destructive text-center font-bold">
                          {t("Limit reached. Upgrade for more links.", "Limite atteinte. Améliorez votre forfait.")}
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

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

export default Addresses;
