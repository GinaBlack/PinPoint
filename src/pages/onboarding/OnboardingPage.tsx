import { useNavigate, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, Sparkles, Link2, MessageCircle, Lock, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useStore, setOnboarded, type LinkType, type AddressType, PLAN_LIMITS } from "@/lib/store";
import { PinMap, useMyLocation } from "@/components/site/PinMap";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";


type Step = 0 | 1 | 2 | 3;

function Onboarding() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const navigate = useNavigate();
  const { user, onboarded, loading, planLimits, ...store } = useStore();

  const [step, setStep] = useState<Step>(0);
  const { pos, setPos, request, requested } = useMyLocation();
  const [label, setLabel] = useState(t("Home", "Maison"));
  const [addressType, setAddressType] = useState<AddressType>("personal");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("alias");
  const [alias, setAlias] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]); // State for photo URLs

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (onboarded) return <Navigate to="/app/overview" replace />;

  const limits = planLimits[user.plan || "free"];
  const hasPhotosNotes = limits.features.includes("photos") || limits.features.includes("notes");

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // In a real app, you'd handle file reading and uploading here.
      // For this example, we'll simulate by just storing a placeholder or the file name.
      // If using data URLs:
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrls = [...photoUrls];
        newUrls[index] = reader.result as string;
        setPhotoUrls(newUrls);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    const newUrls = [...photoUrls];
    newUrls.splice(index, 1);
    setPhotoUrls(newUrls);
  };

  const addPhotoField = () => {
    if (photoUrls.length < 2) {
      setPhotoUrls([...photoUrls, ""]);
    }
  };

  const finish = () => {
    // If no label is set, we assume they want to skip creating the first address
    if (!label.trim()) {
      store.updateProfile({ isOnboarded: true });
      navigate("/app/overview");
      return;
    }

    const cleanAlias = alias.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    
    // Construct address data, avoiding undefined values
    const addressData: any = {
      label,
      type: addressType,
      lat: pos.lat,
      lng: pos.lng,
      isPublic: false,
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
    if (linkType === "alias" && cleanAlias) {
      addressData.alias = cleanAlias;
    }

    store.addAddress(addressData).then((result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const addr = result.data!;
      
      // Construct link data, avoiding undefined values
      const linkData: any = {
        addressId: addr.id,
        type: linkType,
      };

      if (linkType === "alias" && cleanAlias) {
        linkData.alias = cleanAlias;
      }
      if (linkType === "anonymous") {
        linkData.expiresAt = Date.now() + 24 * 3600 * 1000;
      }

      store.addLink(linkData).then((linkResult) => {
        if (!linkResult.success) {
          toast.error(linkResult.error);
        }

        // Mark as onboarded in profile
        store.updateProfile({ isOnboarded: true });
        navigate("/app/overview");
      });
    });
  };

  const steps = [
    t("Locate", "Localiser"),
    t("Name & Describe", "Nommer & Décrire"),
    t("Choose link", "Type de lien"),
    t("Review", "Confirmer"),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <span
                className={`grid place-items-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                  i <= step
                    ? "bg-gradient-primary text-primary-foreground shadow-pin"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <span className="flex-1 h-px bg-border ml-1" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <h1 className="font-display text-3xl font-semibold leading-tight">
              {t("Drop a pin on your door", "Posez l’épingle sur votre porte")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(
                "Tap the map or drag the pin so it sits exactly where deliveries should arrive.",
                "Tapez sur la carte ou faites glisser l’épingle exactement où la livraison doit arriver.",
              )}
            </p>
            <div className="mt-6">
              <PinMap value={pos} onChange={setPos} height={380} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={request} className="rounded-full">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {requested ? t("Re-detect", "Redétecter") : t("Use my location", "Utiliser ma position")}
                </Button>
                <Button variant="ghost" onClick={() => {
                  store.updateProfile({ isOnboarded: true });
                  navigate("/app/overview");
                }} className="rounded-full text-muted-foreground">
                  {t("Skip for now", "Passer pour l'instant")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
              </p>
            </div>
            <Footer next={() => setStep(1)} />
          </Card>
        )}

        {step === 1 && (
          <Card>
            <h1 className="font-display text-3xl font-semibold leading-tight">
              {t("Give it a friendly name", "Donnez-lui un nom")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("Just for you — like “Home” or “Shop in Buea”.", "Pour vous — comme « Maison » ou « Boutique à Buea ».")}
            </p>
            <div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(["personal", "homeaddress", "business"] as AddressType[]).map((type) => (
                  <Button
                    key={type}
                    variant={addressType === type ? "default" : "outline"}
                    onClick={() => setAddressType(type)}
                    disabled={type !== "personal"}
                    className="capitalize rounded-xl text-xs h-9"
                  >
                    {t(type, type === "personal" ? "Personal" : type === "homeaddress" ? "Home" : "Business")}
                  </Button>
                ))}
              </div>
              {addressType === "business" && (
                <div>
                  <label className="text-sm font-medium">{t("Business Name", "Nom de l'entreprise")}</label>
                  <Input 
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)} 
                    className="mt-1.5 h-11" 
                    placeholder="e.g. Douala Electronics"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">{t("Label", "Étiquette")}</label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1.5 h-11" />
              </div>

              {/* Photo Uploads */}
              {hasPhotosNotes && (
                <div className="mt-4">
                  <label className="text-sm font-medium">{t("Front Gate Photos (Max 2)", "Photos de la porte d'entrée (Max 2)")}</label>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {photoUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted group">
                        {url ? (
                          <>
                            <img src={url} alt={`Front gate photo ${index + 1}`} className="w-full h-full object-cover"/>
                            <button 
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <label htmlFor={`photo-upload-${index}`} className="cursor-pointer flex items-center justify-center w-full h-full">
                            <ImagePlus className="w-6 h-6 text-muted-foreground" />
                            <input 
                              id={`photo-upload-${index}`}
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handlePhotoUpload(e, index)} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    ))}
                    {photoUrls.length < 2 && (
                      <label htmlFor="photo-upload-new" className="w-24 h-24 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer bg-muted">
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
              )}

              {hasPhotosNotes && (
                <div className="mt-4">
                  <label className="text-sm font-medium">{t("Notes for visitors (optional)", "Notes pour les visiteurs (optionnel)")}</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("Blue door, ring twice", "Porte bleue, sonnez deux fois")}
                    className="mt-1.5 min-h-24"/>
                </div>
              )}
            </div>
            <Footer back={() => setStep(0)} next={() => setStep(2)} disabled={!label.trim() || (addressType === "business" && !businessName.trim())} />
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h1 className="font-display text-3xl font-semibold leading-tight">
              {t("Choose how you share", "Choisissez le mode de partage")}
            </h1>
            <div className="mt-6 grid gap-3">
              <LinkOption
                icon={Lock}
                active={linkType === "anonymous"}
                onClick={() => setLinkType("anonymous")}
                title={t("Anonymous link", "Lien anonyme")}
                desc={t("Disappears after 24h. Hides your name.", "Disparaît après 24h. Cache votre nom.")}
              />
              <LinkOption
                icon={Link2}
                active={false}
                onClick={() => {}}
                disabled={true}
                title={t("Alias link (Available on upgrade)", "Lien alias (Disponible après mise à niveau)")}
                desc={t("Permanent and easy to remember. Upgrade to unlock.", "Permanent et facile à retenir. Mettez à niveau pour débloquer.")}
              />
              <LinkOption
                icon={MessageCircle}
                active={false}
                onClick={() => {}}
                disabled={true}
                title={t("Message link (Available on upgrade)", "Lien message (Disponible après mise à niveau)")}
                desc={t("Map + chat with the delivery agent. Upgrade to unlock.", "Carte + chat avec le livreur. Mettez à niveau pour débloquer.")}
              />
            </div>
            <Footer back={() => setStep(1)} next={() => setStep(3)} />
          </Card>
        )}

        {step === 3 && (
          <Card>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                {t("Ready", "Prêt")}
              </p>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">
              {t("Your first PinPoint is ready.", "Votre premier PinPoint est prêt.")}
            </h1>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <PinMap value={pos} interactive={false} height={220} />
              <div className="rounded-2xl border border-border p-5 bg-card">
                <p className="text-xs text-muted-foreground">{t("Address", "Adresse")}</p>
                <p className="font-display text-xl font-semibold mt-0.5">{label}</p>
                {hasPhotosNotes && notes && <p className="text-sm text-muted-foreground mt-2">{notes}</p>}
                {hasPhotosNotes && photoUrls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">{t("Photos", "Photos")}</p>
                    <div className="flex gap-2 mt-1">
                      {photoUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Front gate photo ${index + 1}`} className="w-16 h-16 object-cover rounded-lg border border-border"/>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">{t("Share via", "Partage via")}</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">{linkType}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button onClick={finish} className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 h-12 text-base font-semibold">
                {t("Create & Open Dashboard", "Créer & Ouvrir mon espace")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="ghost" onClick={() => {
                store.updateProfile({ isOnboarded: true });
                navigate("/app/overview");
              }} className="w-full rounded-full text-muted-foreground">
                {t("Skip creation, just open dashboard", "Passer la création, ouvrir mon espace")}
              </Button>
            </div>
          </Card>
        )}

        <p className="text-center mt-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← {t("Back to home", "Retour à l’accueil")}</Link>
        </p>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-elegant">{children}</div>;
}

function LinkOption({
  icon: Icon,
  active,
  onClick,
  title,
  desc,
}: {
  icon: any;
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left flex items-start gap-4 p-4 rounded-2xl border transition-all ${
        active
          ? "border-primary bg-primary/5 shadow-pin"
          : "border-border hover:border-foreground/20 bg-card"
      }`}
    >
      <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${active ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function Footer({
  back,
  next,
  nextLabel,
  disabled,
}: {
  back?: () => void;
  next: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {back ? (
        <Button variant="ghost" onClick={back} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
      ) : <span />}
      <Button onClick={next} disabled={disabled} className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 h-11 px-5">
        {nextLabel ?? "Continue"} <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </div>
  );
}

export default Onboarding;
