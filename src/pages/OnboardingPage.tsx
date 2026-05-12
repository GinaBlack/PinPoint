import { useNavigate, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, Sparkles, Link2, MessageCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useStore, setOnboarded, type LinkType, type AddressType } from "@/lib/store";
import { PinMap, useMyLocation } from "@/components/site/PinMap";
import { Navbar } from "@/components/site/Navbar";


type Step = 0 | 1 | 2 | 3;

function Onboarding() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const navigate = useNavigate();
  const { user, onboarded, ...store } = useStore();

  if (!user) return <Navigate to="/auth" replace />;
  if (onboarded) return <Navigate to="/app/overview" replace />;

  const [step, setStep] = useState<Step>(0);
  const { pos, setPos, request, requested } = useMyLocation();
  const [label, setLabel] = useState(t("Home", "Maison"));
  const [addressType, setAddressType] = useState<AddressType>("homeaddress");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("alias");
  const [alias, setAlias] = useState("");

  const finish = () => {
    const cleanAlias = alias.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    const result = store.addAddress({
      label,
      type: addressType,
      businessName: addressType === "business" ? businessName : undefined,
      lat: pos.lat,
      lng: pos.lng,
      notes,
      alias: linkType === "alias" ? cleanAlias || undefined : undefined,
      isPublic: false,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const addr = result.data!;
    const linkResult = store.addLink({
      addressId: addr.id,
      type: linkType,
      alias: linkType === "alias" ? cleanAlias || undefined : undefined,
      expiresAt:
        linkType === "anonymous" ? Date.now() + 24 * 3600 * 1000 : undefined,
    });

    if (!linkResult.success) {
      toast.error(linkResult.error);
    }

    setOnboarded(true);
    navigate("/app/overview");
  };

  const steps = [
    t("Locate", "Localiser"),
    t("Name it", "Nommer"),
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
              <Button variant="outline" onClick={request} className="rounded-full">
                <MapPin className="w-4 h-4 mr-1.5" />
                {requested ? t("Re-detect", "Redétecter") : t("Use my location", "Utiliser ma position")}
              </Button>
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
                        <div className="grid grid-cols-3 gap-2">
                          {(["personal", "homeaddress", "business"] as AddressType[]).map((type) => (
                            <Button
                              key={type}
                              variant={addressType === type ? "default" : "outline"}
                              onClick={() => setAddressType(type)}
                              className="capitalize rounded-xl text-xs h-9"
                            >
                              {t(type, type === "personal" ? "Personnel" : type === "homeaddress" ? "Maison" : "Entreprise")}
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
              <div>
                <label className="text-sm font-medium">{t("Notes for visitors (optional)", "Notes pour les visiteurs (optionnel)")}</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("Blue door, ring twice", "Porte bleue, sonnez deux fois")}
                  className="mt-1.5 min-h-24"/>
              </div>
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
                active={linkType === "alias"}
                onClick={() => setLinkType("alias")}
                title={t("Alias link (recommended)", "Lien alias (recommandé)")}
                desc={t("Permanent and easy to remember.", "Permanent et facile à retenir.")}
              />
              <LinkOption
                icon={MessageCircle}
                active={linkType === "message"}
                onClick={() => setLinkType("message")}
                title={t("Message link", "Lien message")}
                desc={t("Map + chat with the delivery agent.", "Carte + chat avec le livreur.")}
              />
              {linkType === "alias" && (
                <div className="mt-2">
                  <label className="text-sm font-medium">{t("Choose your alias", "Choisissez votre alias")}</label>
                  <div className="mt-1.5 flex items-center gap-1 rounded-lg border border-input bg-background px-3 h-11">
                    <span className="text-muted-foreground text-sm">pinpoint.app/@</span>
                    <input
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="ChezMarie"
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              )}
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
                {notes && <p className="text-sm text-muted-foreground mt-2">{notes}</p>}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">{t("Share via", "Partage via")}</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">{linkType}</p>
                  {linkType === "alias" && alias && (
                    <p className="text-sm text-primary font-medium mt-1">pinpoint.app/@{alias}</p>
                  )}
                </div>
              </div>
            </div>
            <Footer back={() => setStep(2)} nextLabel={t("Open my dashboard", "Ouvrir mon espace")} next={finish} />
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
