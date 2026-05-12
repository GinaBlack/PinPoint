import { Link } from "react-router-dom";
import { CreditCard, ShieldCheck, Zap, Building2, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";

export default function MyPlanPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { user, addresses } = useStore();

  const planInfo = {
    basic: {
      name: t("Basic Personal", "Personnel de Base"),
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      limit: 3,
      description: t("Standard features for personal use.", "Fonctionnalités standard pour un usage personnel."),
    },
    pro: {
      name: "Pro",
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      limit: Infinity,
      description: t("Professional features for power users.", "Fonctionnalités professionnelles pour les utilisateurs avertis."),
    },
    business: {
      name: "Business",
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      limit: Infinity,
      description: t("Business-grade tools and team support.", "Outils de niveau professionnel et support d'équipe."),
    },
  }[user?.plan || "basic"];

  const usagePercent = planInfo.limit === Infinity ? 0 : (addresses.length / planInfo.limit) * 100;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl font-semibold">{t("My Plan", "Mon Forfait")}</h1>
        <p className="text-muted-foreground mt-1">{t("Manage your subscription and usage limits.", "Gérez votre abonnement et vos limites d'utilisation.")}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                {planInfo.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t("Current Plan", "Forfait Actuel")}</p>
                <h2 className="text-2xl font-bold">{planInfo.name}</h2>
              </div>
              <Button asChild variant="outline" size="sm" className="ml-auto rounded-full">
                <Link to="/app/pricing">{t("Change Plan", "Changer")}</Link>
              </Button>
            </div>
            
            <p className="text-muted-foreground mb-8 text-sm">{planInfo.description}</p>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium">{t("Address Usage", "Utilisation des adresses")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {addresses.length} {t("of", "sur")} {planInfo.limit === Infinity ? t("Unlimited", "Illimité") : planInfo.limit} {t("locations", "lieux")}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums">{Math.round(usagePercent)}%</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              {planInfo.limit !== Infinity && addresses.length >= planInfo.limit && (
                <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3" />
                  {t("Upgrade to Pro to add more addresses.", "Passez à Pro pour ajouter plus d'adresses.")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              {t("Billing History", "Historique de facturation")}
            </h3>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">{t("No billing history available.", "Aucun historique de facturation disponible.")}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4 text-sm">{t("Need help?", "Besoin d'aide ?")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {t("Our support team is here to help you with any billing or plan questions.", "Notre équipe de support est là pour vous aider pour toute question sur la facturation ou les forfaits.")}
            </p>
            <Button variant="secondary" className="w-full rounded-xl text-xs" size="sm">
              {t("Contact Support", "Contacter le Support")}
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-pin">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2 text-sm">{t("Upgrade to Pro", "Passez à Pro")}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              {t("Get unlimited addresses, custom aliases, and priority support.", "Obtenez des adresses illimitées, des alias personnalisés et un support prioritaire.")}
            </p>
            <Button asChild className="w-full rounded-xl text-xs h-9 bg-primary" size="sm">
              <Link to="/app/pricing">{t("View Plans", "Voir les Forfaits")}</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
