import { Link } from "react-router-dom";
import { useState } from "react";
import { Copy, MapPin, Plus, Share2, Trash2, Globe2, Home, User, Building2, Link2, Lock, MessageCircle, MoreVertical, Edit2, Info, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStore, PLAN_LIMITS, type AddressType, type LinkType, type Address } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PinMap } from "@/components/site/PinMap";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

function Addresses() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkTargetAddressId, setLinkTargetAddressId] = useState<string | null>(null);
  const [newLinkType, setNewLinkType] = useState<LinkType>("alias");

  const limits = PLAN_LIMITS[store.user?.plan || "free"];
  
  const personalCount = store.addresses.filter(a => a.type === "personal").length;
  const homeCount = store.addresses.filter(a => a.type === "homeaddress").length;
  const businessCount = store.addresses.filter(a => a.type === "business").length;

  const isAddressLimitReached = personalCount >= limits.personal && homeCount >= limits.home && businessCount >= limits.business;

  const lastMonth = Date.now() - 30 * 24 * 3600 * 1000;
  const getLinkCount = (type: LinkType) => store.links.filter(l => l.type === type && l.createdAt > lastMonth).length;
  
  const isLinkLimitReached = (type: LinkType) => {
    if (type === "anonymous") return getLinkCount("anonymous") >= limits.anonymousLinks;
    if (type === "alias") return getLinkCount("alias") >= limits.aliasLinks;
    return false;
  };

  const handleGenerateLink = () => {
    if (!linkTargetAddressId) return;
    const selected = store.addresses.find(a => a.id === linkTargetAddressId);
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

  if (store.addresses.length === 0) {
    return <Empty t={t} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("My addresses", "Mes adresses")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage your pinned locations.", "Gérez vos lieux épinglés.")}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button 
            asChild={!isAddressLimitReached} 
            disabled={isAddressLimitReached}
            className={`rounded-full shadow-pin border-0 ${isAddressLimitReached ? 'bg-muted cursor-not-allowed' : 'bg-gradient-primary text-primary-foreground hover:opacity-90'}`}
            onClick={() => isAddressLimitReached && toast.error(t(`Limit reached for all address types in your plan.`, `Limite atteinte pour tous les types d'adresses de votre forfait.`))}
          >{isAddressLimitReached ? (
              <span><Plus className="w-4 h-4 mr-1.5" /> {t("Add", "Ajouter")}</span>
            ) : (
              <Link to="/app/add-address"><Plus className="w-4 h-4 mr-1.5" /> {t("Add", "Ajouter")}</Link>
            )}</Button>
          {isAddressLimitReached && (
            <Link to="/app/pricing" className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
              {t("Upgrade to add more", "Améliorer pour en ajouter plus")}
            </Link>
          )}
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {store.addresses.map((addr) => (
          <AddressCard 
            key={addr.id} 
            addr={addr} 
            t={t} 
            onDelete={() => store.deleteAddress(addr.id)}
            onUpdate={(patch) => store.updateAddress(addr.id, patch)}
            onGenerateLink={() => {
              setLinkTargetAddressId(addr.id);
              setIsLinkDialogOpen(true);
            }}
            limits={limits}
          />
        ))}
      </div>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
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
              {t("Monthly Usage", "Utilisation mensuelle")}: {getLinkCount(newLinkType)} / {newLinkType === "anonymous" ? (limits.anonymousLinks === Infinity ? "∞" : limits.anonymousLinks) : (limits.aliasLinks === Infinity ? "∞" : limits.aliasLinks)}
            </p>
            <Button onClick={handleGenerateLink} disabled={isLinkLimitReached(newLinkType)} className="rounded-xl w-full">
              {t("Generate Link", "Générer le lien")}
            </Button>
            {isLinkLimitReached(newLinkType) && (
              <p className="text-[10px] text-destructive text-center font-bold">
                {t("Limit reached. Upgrade for more links.", "Limite atteinte. Améliorez votre forfait.")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddressCard({ addr, t, onDelete, onUpdate, onGenerateLink, limits }: { 
  addr: Address; 
  t: (en: string, fr: string) => string; 
  onDelete: () => void;
  onUpdate: (patch: Partial<Address>) => void;
  onGenerateLink: () => void;
  limits: any;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localAddr, setLocalAddr] = useState(addr);
  const [showPhotos, setShowPhotos] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const Icon = {
    homeaddress: Home,
    personal: User,
    business: Building2,
  }[addr.type] || MapPin;

  const hasPhotosNotes = limits.features.includes("photos") || limits.features.includes("notes");
  const hasPhotos = addr.photos && addr.photos.length > 0;

  const handleSave = () => {
    onUpdate(localAddr);
    setIsEditDialogOpen(false);
    toast.success(t("Changes saved", "Modifications enregistrées"));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photos = [...(localAddr.photos || [])];
        if (photos.length < 2) {
          setLocalAddr({ ...localAddr, photos: [...photos, reader.result as string] });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (idx: number) => {
    const photos = [...(localAddr.photos || [])];
    photos.splice(idx, 1);
    setLocalAddr({ ...localAddr, photos });
  };

  return (
    <>
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-elegant transition-all flex flex-col group">
        <div className="h-40 relative shrink-0">
          <PinMap value={{ lat: addr.lat, lng: addr.lng }} interactive={false} height={160} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl min-w-[140px]">
                <Popover open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <PopoverTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" /> {t("Edit", "Modifier")}
                    </DropdownMenuItem>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 rounded-3xl p-6 shadow-elegant border-border" 
                    side="left" 
                    align="start"
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t("Edit Address", "Modifier l'adresse")}</h3>
                        <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full" onClick={() => setIsEditDialogOpen(false)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Type", "Type")}</label>
                        <div className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm capitalize text-muted-foreground cursor-not-allowed">
                          {t(addr.type, addr.type)}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">{t("Type cannot be changed after registration.", "Le type ne peut plus être changé.")}</p>
                      </div>

                      {addr.type === "business" && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Business Name", "Nom")}</label>
                          <Input 
                            value={localAddr.businessName ?? ""} 
                            onChange={(e) => setLocalAddr({ ...localAddr, businessName: e.target.value })} 
                            className="rounded-xl h-10"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Label", "Étiquette")}</label>
                        <Input 
                          value={localAddr.label} 
                          onChange={(e) => setLocalAddr({ ...localAddr, label: e.target.value })} 
                          className="rounded-xl h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Public alias", "Alias")}</label>
                        <div className={`flex items-center gap-1 rounded-xl border border-input bg-background px-3 h-10 ${limits.aliasLinks === 0 ? "opacity-50 cursor-not-allowed bg-muted" : ""}`}>
                          <span className="text-muted-foreground text-xs">@</span>
                          <input
                            value={localAddr.alias ?? ""}
                            onChange={(e) => setLocalAddr({ ...localAddr, alias: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })}
                            placeholder="ChezMarie"
                            className="flex-1 bg-transparent outline-none text-sm disabled:cursor-not-allowed"
                            disabled={limits.aliasLinks === 0}
                          />
                        </div>
                        {limits.aliasLinks === 0 && (
                          <p className="text-[10px] text-primary font-medium">{t("Upgrade to Plus or Pro to use aliases.", "Passez à Plus ou Pro pour utiliser les alias.")}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40">
                        <span className="text-xs font-medium">{t("Public Search", "Recherche Publique")}</span>
                        <Switch 
                          checked={!!localAddr.isPublic} 
                          onCheckedChange={(v) => setLocalAddr({ ...localAddr, isPublic: v })} 
                          className="scale-75 origin-right"
                        />
                      </div>

                      {hasPhotosNotes && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Photos", "Photos")}</label>
                            <div className="flex gap-2">
                              {(localAddr.photos || []).map((url, i) => (
                                <div key={i} className="relative w-14 h-14 rounded-lg border border-border overflow-hidden">
                                  <img src={url} className="w-full h-full object-cover" />
                                  <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 text-white">
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                              {(localAddr.photos || []).length < 2 && (
                                <label className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Notes", "Notes")}</label>
                            <Textarea 
                              value={localAddr.notes ?? ""} 
                              onChange={(e) => setLocalAddr({ ...localAddr, notes: e.target.value })} 
                              className="rounded-xl min-h-[60px] text-sm"
                              placeholder={t("Blue door...", "Porte bleue...")}
                            />
                          </div>
                        </div>
                      )}

                      <Button className="w-full rounded-xl" onClick={handleSave}>
                        {t("Save Changes", "Enregistrer")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenuItem onSelect={onGenerateLink} className="gap-2 cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" /> {t("Share", "Partager")}
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onSelect={onDelete} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" /> {t("Delete", "Supprimer")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">{addr.label}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t(addr.type, addr.type)}</p>
              </div>
            </div>
          </div>

          {addr.alias && (
            <p className="text-xs text-primary font-medium mt-2">pinpoint.app/@{addr.alias}</p>
          )}

          <div className="flex gap-2 mt-4">
            {addr.notes && (
              <div className="flex-1 flex gap-2 text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border/50">
                <Info className="w-3.5 h-3.5 shrink-0 opacity-60" />
                <p className="line-clamp-2 italic">"{addr.notes}"</p>
              </div>
            )}
            
            {hasPhotos && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`w-9 h-9 rounded-xl shrink-0 transition-colors ${showPhotos ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
                    onClick={() => setShowPhotos(!showPhotos)}
                  >
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 rounded-2xl shadow-elegant border-border" side="top">
                  <div className="flex gap-2">
                    {addr.photos?.map((url, i) => (
                      <img key={i} src={url} className="w-20 h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {showPhotos && hasPhotos && (
            <div className="mt-4 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {addr.photos?.map((url, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-2xl border border-border overflow-hidden cursor-zoom-in group/photo"
                  onClick={() => setLightboxPhoto(url)}
                >
                  <img src={url} className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-5 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-xs" onClick={onGenerateLink}>
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> {t("Share", "Partager")}
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl h-9 px-3" asChild>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${addr.lat},${addr.lng}`} target="_blank" rel="noreferrer">
                <MapPin className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
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
    </>
  );
}

function Empty({ t }: { t: (a: string, b: string) => string }) {
  return (
    <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-pin mb-6"><MapPin className="w-8 h-8" /></div>
      <h2 className="font-display text-2xl font-semibold">{t("No addresses yet", "Aucune adresse")}</h2>
      <p className="mt-2 text-muted-foreground max-w-xs mx-auto">{t("Drop your first pin to start sharing your location easily.", "Posez votre première épingle pour commencer à partager.")}</p>
      <Button asChild className="mt-8 rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 px-8 h-12"><Link to="/onboarding"><Plus className="w-5 h-5 mr-2" /> {t("Add address", "Ajouter une adresse")}</Link></Button>
    </div>
  );
}

export default Addresses;
