import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Sparkles, ImagePlus, X, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useStore, type AddressType, PLAN_LIMITS } from "@/lib/store";
import { PinMap, useMyLocation } from "@/components/site/PinMap";
import { toast } from "sonner";

// Re-usable Card component definition
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-elegant">{children}</div>;
}

function AddAddressPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const navigate = useNavigate();
  const store = useStore();
  const { user, addresses } = store;

  // State extracted from OnboardingPage Steps 0 & 1
  const { pos, setPos, request, requested } = useMyLocation();
  const [label, setLabel] = useState(t("Home", "Maison"));
  const [addressType, setAddressType] = useState<AddressType>("personal");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [alias, setAlias] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  if (!user) return null;

  const limits = PLAN_LIMITS[user.plan || "free"];
  const hasPhotosNotes = limits.features.includes("photos") || limits.features.includes("notes");

  // Photo upload handlers
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrls = [...photoUrls];
        if (index < 2) {
          newUrls[index] = reader.result as string;
          setPhotoUrls(newUrls);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    const newUrls = [...photoUrls];
    newUrls.splice(index, 1);
    setPhotoUrls(newUrls);
  };

  // Submission logic
  const handleSaveAddress = async () => {
    if (!label.trim()) {
      toast.error(t("Label cannot be empty.", "L'étiquette ne peut pas être vide."));
      return;
    }
    if (addressType === "business" && !businessName.trim()) {
      toast.error(t("Business name is required.", "Le nom de l'entreprise est requis."));
      return;
    }
    if (!pos || (pos.lat === 0 && pos.lng === 0)) {
        toast.error(t("Please set the location on the map.", "Veuillez définir l'emplacement sur la carte."));
        return;
    }

    // Double check limits (the UI also disables but let's be safe)
    const typeKey = addressType === "homeaddress" ? "home" : addressType;
    const count = addresses.filter(addr => addr.type === addressType).length;
    const limit = (limits as any)[typeKey];

    if (count >= limit) {
      toast.error(t(`Limit reached: Your plan allows only ${limit} ${addressType} addresses.`, `Limite atteinte : Votre forfait ne permet que ${limit} adresses de type ${addressType}.`));
      return;
    }

    // Construct address data, avoiding undefined values
    const addressData: any = {
      label: label.trim(),
      type: addressType,
      lat: pos.lat,
      lng: pos.lng,
      isPublic,
    };

    if (addressType === "business" && businessName.trim()) {
      addressData.businessName = businessName.trim();
    }
    if (notes.trim()) {
      addressData.notes = notes.trim();
    }
    if (photoUrls.length > 0) {
      addressData.photos = photoUrls;
    }
    if (alias.trim() && limits.aliasLinks > 0) {
      addressData.alias = alias.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    }

    const result = await store.addAddress(addressData);

    if (!result.success) {
      toast.error(result.error || t("Failed to save address.", "Échec de l'enregistrement de l'adresse."));
      return;
    }

    toast.success(t("Address saved successfully!", "Adresse enregistrée avec succès !"));
    navigate("/app/addresses");
  };

  const getLimitForType = (type: AddressType) => {
    const key = type === "homeaddress" ? "home" : type;
    return (limits as any)[key];
  };

  const getCountForType = (type: AddressType) => {
    return addresses.filter(a => a.type === type).length;
  };

  const pageTitle = t("Add New Address", "Ajouter une nouvelle adresse");
  const pageDescription = t("Enter the details for your location.", "Entrez les détails de votre emplacement.");

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <header className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("Back", "Retour")}
          </Button>
          <h1 className="font-display text-4xl font-semibold leading-tight mb-2">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </header>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-2xl font-semibold leading-tight mb-4">
              {t("Location", "Localisation")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t(
                "Tap the map or drag the pin so it sits exactly where deliveries should arrive.",
                "Tapez sur la carte ou faites glisser l’épingle exactement où la livraison doit arriver.",
              )}
            </p>
            <div className="mt-6">
              <PinMap value={pos} onChange={setPos} height={380} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
              <Button variant="outline" onClick={request} className="rounded-full">
                <MapPin className="w-4 h-4 mr-1.5" />
                {requested ? t("Re-detect", "Redétecter") : t("Use my location", "Utiliser ma position")}
              </Button>
              <p className="text-xs text-muted-foreground tabular-nums">
                {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-2xl font-semibold leading-tight mb-4">
              {t("Details", "Détails")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">{t("Address Type", "Type d'adresse")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["personal", "homeaddress", "business"] as AddressType[]).map((type) => {
                    const limit = getLimitForType(type);
                    const count = getCountForType(type);
                    const isFull = count >= limit;
                    
                    return (
                      <div key={type} className="flex flex-col gap-1">
                        <Button
                          variant={addressType === type ? "default" : "outline"}
                          onClick={() => setAddressType(type)}
                          disabled={isFull && addressType !== type}
                          className="capitalize rounded-xl text-xs h-10 w-full"
                        >
                          {t(type, type === "personal" ? "Personal" : type === "homeaddress" ? "Home" : "Business")}
                        </Button>
                        <p className={`text-[10px] text-center px-1 ${isFull ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                          {count}/{limit === Infinity ? "∞" : limit} {t("used", "utilisés")}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {Object.values(limits).some(v => v === 0) && (
                  <p className="mt-3 text-[10px] text-primary font-medium text-center">
                    <Link to="/app/pricing" className="hover:underline">
                      {t("Upgrade to unlock Home and Business addresses.", "Passez à un forfait supérieur pour débloquer les adresses Domicile et Entreprise.")}
                    </Link>
                  </p>
                )}
              </div>

              {addressType === "business" && (
                <div>
                  <label className="text-sm font-medium block mb-2">{t("Business Name", "Nom de l'entreprise")}</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="e.g. Douala Electronics"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-2">{t("Label", "Étiquette")}</label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium block mb-2">{t("Public alias", "Alias public")}</label>
                <div className={`flex items-center gap-1 rounded-xl border border-input bg-background px-3 h-11 ${limits.aliasLinks === 0 ? "opacity-50 cursor-not-allowed bg-muted" : ""}`}>
                  <span className="text-muted-foreground text-xs font-bold">@</span>
                  <input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    placeholder="ChezMarie"
                    className="flex-1 bg-transparent outline-none text-sm disabled:cursor-not-allowed"
                    disabled={limits.aliasLinks === 0}
                  />
                </div>
                {limits.aliasLinks === 0 ? (
                  <p className="text-[10px] text-primary font-medium mt-1">
                    {t("Upgrade to Plus or Pro to use aliases.", "Passez à Plus ou Pro pour utiliser les alias.")}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t("A permanent link like pinpoint.app/@yourname", "Un lien permanent comme pinpoint.app/@votre-nom")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{t("Available in Public Search", "Visible dans la recherche publique")}</span>
                </div>
                <Switch 
                  checked={isPublic} 
                  onCheckedChange={setIsPublic} 
                  className="scale-90"
                />
              </div>

              {hasPhotosNotes && (
                <>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <label className="text-sm font-medium block mb-2">{t("Front Gate Photos (Max 2)", "Photos de la porte d'entrée (Max 2)")}</label>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {photoUrls.map((url, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted group">
                          <img src={url} alt={`Front gate photo ${index + 1}`} className="w-full h-full object-cover"/>
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {photoUrls.length < 2 && (
                        <label htmlFor="photo-upload-new" className="w-24 h-24 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/70 transition-colors">
                          <ImagePlus className="w-6 h-6 text-muted-foreground" />
                          <input
                            id="photo-upload-new"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPhotoUrls([...photoUrls, reader.result as string]);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">{t("Notes for visitors (optional)", "Notes pour les visiteurs (optionnel)")}</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("Blue door, ring twice", "Porte bleue, sonnez deux fois")}
                      className="mt-1.5 min-h-24 rounded-xl resize-none"/>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 flex items-center justify-end">
              <Button 
                onClick={handleSaveAddress} 
                disabled={!label.trim() || (addressType === "business" && !businessName.trim()) || !pos || (pos.lat === 0 && pos.lng === 0)}
                className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 h-12 px-8 font-semibold"
              >
                {t("Save Address", "Enregistrer l'adresse")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AddAddressPage;
