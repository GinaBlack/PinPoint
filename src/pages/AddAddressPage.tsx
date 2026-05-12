import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Sparkles, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useStore, type AddressType } from "@/lib/store";
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
  const { addAddress, user } = useStore();

  // State extracted from OnboardingPage Steps 0 & 1
  const { pos, setPos, request, requested } = useMyLocation();
  const [label, setLabel] = useState(t("Home", "Maison"));
  const [addressType, setAddressType] = useState<AddressType>("homeaddress");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]); // State for photo URLs

  // Photo upload handlers (adapted from OnboardingPage)
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

  // Submission logic for the new page
  const handleSaveAddress = () => {
    // Basic validation for required fields
    if (!label.trim()) {
      toast.error("Label cannot be empty.");
      return;
    }
    if (addressType === "business" && !businessName.trim()) {
      toast.error("Business name is required for business type addresses.");
      return;
    }
    if (!pos || (pos.lat === 0 && pos.lng === 0)) { // Check if location is set
        toast.error("Please set the location on the map.");
        return;
    }

    const result = addAddress({
      label: label.trim(),
      type: addressType,
      businessName: addressType === "business" ? businessName.trim() : undefined,
      lat: pos.lat,
      lng: pos.lng,
      notes: notes.trim(),
      photos: photoUrls.length > 0 ? photoUrls : undefined, // Pass photos array
    });

    if (!result.success) {
      toast.error(result.error || "Failed to save address.");
      return;
    }

    toast.success("Address saved successfully!");
    // Redirect back to onboarding to continue the flow
    navigate("/onboarding");
  };

  // Simplified Footer for this page
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
        ) : <span />} {/* Placeholder to keep space if no back button */}
        <Button onClick={next} disabled={disabled} className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 h-11 px-5">
          {nextLabel ?? "Save Address"} <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    );
  }

  // Page title and description
  const pageTitle = t("Add New Address", "Ajouter une nouvelle adresse");
  const pageDescription = t("Enter the details for your location.", "Entrez les détails de votre emplacement.");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-4xl font-semibold leading-tight mb-2">{pageTitle}</h1>
        <p className="text-muted-foreground mb-8">{pageDescription}</p>

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

        <Card >
          <h2 className="font-display text-2xl font-semibold leading-tight mb-4">
            {t("Details", "Détails")}
          </h2>
          <div className="space-y-4">
            {/* Address Type selection */}
            <div>
              <label className="text-sm font-medium block mb-2">{t("Address Type", "Type d'adresse")}</label>
              <div className="grid grid-cols-3 gap-2">
                {(["personal", "homeaddress", "business"] as AddressType[]).map((type) => (
                  <Button
                    key={type}
                    variant={addressType === type ? "default" : "outline"}
                    onClick={() => setAddressType(type)}
                    className="capitalize rounded-xl text-xs h-9"
                  >
                    {t(type, type === "personal" ? "Personal" : type === "homeaddress" ? "Home" : "Business")}
                  </Button>
                ))}
              </div>
            </div>

            {addressType === "business" && (
              <div>
                <label className="text-sm font-medium block mb-2">{t("Business Name", "Nom de l'entreprise")}</label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11"
                  placeholder="e.g. Douala Electronics"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-2">{t("Label", "Étiquette")}</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-11" />
            </div>

            {/* Photo Uploads */}
            <div className="mt-4">
              <label className="text-sm font-medium block mb-2">{t("Front Gate Photos (Max 2)", "Photos de la porte d'entrée (Max 2)")}</label>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted group">
                    {url ? (
                      <>
                        <img src={url} alt={`Front gate photo ${index + 1}`} className="w-full h-full object-cover"/>
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </>
                    ) : (
                      null
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

            <div>
              <label className="text-sm font-medium block mb-2">{t("Notes for visitors (optional)", "Notes pour les visiteurs (optionnel)")}</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("Blue door, ring twice", "Porte bleue, sonnez deux fois")}
                className="mt-1.5 min-h-24"/>
            </div>
          </div>
          <Footer
            back={() => navigate(-1)} // Option to go back to the previous page
            next={handleSaveAddress}
            nextLabel={t("Save Address", "Enregistrer l'adresse")}
            disabled={!label.trim() || (addressType === "business" && !businessName.trim()) || !pos || (pos.lat === 0 && pos.lng === 0)}
          />
        </Card>
      </div>
    </div>
  );
}

export default AddAddressPage;
