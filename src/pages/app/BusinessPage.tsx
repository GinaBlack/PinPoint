import { Link} from "react-router-dom";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Building2, Copy, Download, Globe2, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStore, PLAN_LIMITS } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { BusinessAnalytics } from "@/components/business/BusinessAnalytics";

function BusinessPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const store = useStore();
  const { planLimits } = store;

  const candidates = store.addresses.filter(a => a.type === "business");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = candidates.find((a) => a.id === selectedId) ?? candidates[0];

  const limits = planLimits[store.user?.plan || "free"];
  const hasAnalytics = limits.features.includes("analytics");
  const canDownloadQR = limits.features.includes("qr_download");

  if (!selected) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-pin"><Building2 /></div>
        <h2 className="mt-6 font-display text-2xl font-semibold">{t("No business address yet", "Pas encore d’adresse pro")}</h2>
        <p className="mt-2 text-muted-foreground">{t("Create one to generate a QR code.", "Créez-en une pour générer un QR code.")}</p>
        <Button asChild className="mt-6 rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
          <Link to="/onboarding"><Plus className="w-4 h-4 mr-1.5" /> {t("Add address", "Ajouter")}</Link>
        </Button>
      </div>
    );
  }

  const aliasUrl = selected.alias ? `https://pin-point-zeta.vercel.app/@${selected.alias}` : `https://pin-point-zeta.vercel.app/p/${selected.id}`;

  const copy = async () => {
    await navigator.clipboard.writeText(aliasUrl);
    toast.success(t("Copied", "Copié"));
  };

  const downloadQR = () => {
    const svgElement = document.getElementById("biz-qr");
    if (!(svgElement instanceof SVGSVGElement)) return;
    const xml = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pinpoint-${selected.alias ?? selected.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-semibold">{t("Business address", "Adresse pro")}</h1>
        <p className="text-muted-foreground mt-1">{t("Generate a QR code suppliers can scan to reach your door.", "Générez un QR code que vos fournisseurs scannent pour vous trouver.")}</p>
      </header>

      {candidates.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {candidates.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${selected.id === a.id ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-foreground/30"}`}
            >{a.label}</button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-border bg-card p-8 flex flex-col items-center text-center">
          <div className="p-5 rounded-2xl bg-white shadow-elegant">
            <QRCodeSVG
              id="biz-qr"
              value={aliasUrl}
              size={220}
              level="M"
              fgColor="#0d2a1f"
              imageSettings={undefined}
            />
          </div>
          <p className="mt-5 font-display text-xl font-semibold">{selected.label}</p>
          <p className="text-sm text-primary font-medium mt-1 break-all">{aliasUrl}</p>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={copy}><Copy className="w-4 h-4 mr-1.5" /> {t("Copy link", "Copier")}</Button>
            {canDownloadQR ? (
              <Button onClick={downloadQR} className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
                <Download className="w-4 h-4 mr-1.5" /> {t("Download QR", "Télécharger")}
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-full border-dashed">
                <Link to="/app/pricing"><Download className="w-4 h-4 mr-1.5" /> {t("Unlock QR", "Débloquer QR")}</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Type", "Type")}</label>
            <div className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm capitalize text-muted-foreground cursor-not-allowed flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {t("Business", "Entreprise")}
            </div>
            <p className="text-[10px] text-muted-foreground italic">{t("Type cannot be changed after registration.", "Le type ne peut plus être changé.")}</p>
          </div>

          <div>
            <label className="text-sm font-medium">{t("Display name", "Nom affiché")}</label>
            <Input
              value={selected.label}
              onChange={(e) => store.updateAddress(selected.id, { label: e.target.value })}
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("Public alias", "Alias public")}</label>
            <div className="mt-1.5 flex items-center gap-1 rounded-xl border border-input bg-background px-3 h-11">
              <span className="text-muted-foreground text-sm">pin-point-zeta.vercel.app/@</span>
              <input
                value={selected.alias ?? ""}
                onChange={(e) => store.updateAddress(selected.id, { alias: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })}
                placeholder="MyShop"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5"><Globe2 className="w-4 h-4" /> {t("Public alias search", "Recherche publique")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Customers find you via PinPoint search.", "Les clients vous trouvent via la recherche.")}</p>
            </div>
            <Switch
              checked={!!selected.isPublic}
              onCheckedChange={(v) => {
                store.updateAddress(selected.id, { isPublic: v, isBusiness: true });
                toast.success(v ? t("Now public", "Public") : t("Now private", "Privé"));
              }}
            />
          </div>
        </div>
      </div>

      {hasAnalytics ? (
        <div className="rounded-3xl border border-border bg-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">{t("Business Intelligence", "Intelligence Business")}</h3>
              <p className="text-sm text-muted-foreground">{t("Your premium analytics dashboard is ready.", "Votre tableau de bord d'analyses est prêt.")}</p>
            </div>
          </div>
          <Button asChild className="rounded-full shadow-pin">
            <Link to="/app/analytics">{t("View Analytics", "Voir les analyses")}</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-muted/10 p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="font-semibold text-lg">{t("Unlock Business Analytics", "Débloquez les Analyses")}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {t("Upgrade to Premium to see who is visiting your business address and how they find you.", "Passez à Premium pour voir qui visite votre adresse business et comment on vous trouve.")}
          </p>
          <Button asChild className="mt-6 rounded-full" variant="outline">
            <Link to="/app/pricing">{t("Upgrade Now", "Améliorer")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
export default BusinessPage;BusinessPage;