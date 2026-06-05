import { Link } from "react-router-dom";
import { CreditCard, ShieldCheck, Zap, Building2, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, PLAN_LIMITS } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";

export default function MyPlanPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { user, addresses, links, planLimits } = useStore();

  const planInfo = {
    free: {
      name: t("Free", "Gratuit"),
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      description: t("Basic personal use.", "Usage personnel de base."),
    },
    plus: {
      name: "Plus",
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      description: t("More links for individuals.", "Plus de liens pour les particuliers."),
    },
    pro: {
      name: "Pro",
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      description: t("Advanced features for power users.", "Fonctionnalités avancées pour les experts."),
    },
    business: {
      name: "Business",
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      description: t("Ideal for small businesses.", "Idéal pour les petites entreprises."),
    },
    premium: {
      name: "Premium",
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      description: t("The ultimate business solution.", "La solution professionnelle ultime."),
    },
  }[user?.plan || "free"];

  const limits = planLimits[user?.plan || "free"];
  
  const personalCount = addresses.filter(a => a.type === "personal").length;
  const homeCount = addresses.filter(a => a.type === "homeaddress").length;
  const businessCount = addresses.filter(a => a.type === "business").length;

  const lastMonth = Date.now() - 30 * 24 * 3600 * 1000;
  const anonymousCount = links.filter(l => l.type === "anonymous" && l.createdAt > lastMonth).length;
  const aliasCount = links.filter(l => l.type === "alias" && l.createdAt > lastMonth).length;

  const UsageItem = ({ label, current, limit, unit }: { label: string, current: number, limit: number, unit: string }) => {
    const percent = limit === Infinity ? 0 : (current / limit) * 100;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {current} {t("of", "sur")} {limit === Infinity ? t("Unlimited", "Illimité") : limit} {unit}
            </p>
          </div>
          {limit !== Infinity && <span className="text-sm font-bold tabular-nums">{Math.round(percent)}%</span>}
        </div>
        {limit !== Infinity && <Progress value={percent} className="h-1.5" />}
      </div>
    );
  };

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
              <Button asChild variant="outline" size="sm" className="ml-auto rounded-full"><Link to="/app/pricing">{t("Change Plan", "Changer")}</Link></Button>
            </div>
            
            <p className="text-muted-foreground mb-8 text-sm">{planInfo.description}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("Address Limits", "Limites d'adresses")}</h3>
                <UsageItem label={t("Personal", "Personnel")} current={personalCount} limit={limits.personal} unit={t("addresses", "adresses")} />
                <UsageItem label={t("Home", "Domicile")} current={homeCount} limit={limits.home} unit={t("addresses", "adresses")} />
                <UsageItem label={t("Business", "Professionnel")} current={businessCount} limit={limits.business} unit={t("addresses", "adresses")} />
              </div>
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("Link Usage (Monthly)", "Utilisation des liens (Mensuel)")}</h3>
                <UsageItem label={t("Anonymous", "Anonyme")} current={anonymousCount} limit={limits.anonymousLinks} unit={t("usages", "utilisations")} />
                <UsageItem label={t("Alias", "Alias")} current={aliasCount} limit={limits.aliasLinks} unit={t("usages", "utilisations")} />
              </div>
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
            <Button asChild variant="secondary" className="w-full rounded-xl text-xs" size="sm"><Link to="/app/support">{t("Contact Support", "Contacter le Support")}</Link></Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-pin">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2 text-sm">{t("Explore Plans", "Explorer les Forfaits")}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              {t("Find the perfect plan for your needs and unlock more features.", "Trouvez le forfait idéal pour vos besoins et débloquez plus de fonctionnalités.")}
            </p>
            <Button asChild className="w-full rounded-xl text-xs h-9 bg-primary" size="sm"><Link to="/app/pricing">{t("View Pricing", "Voir les Tarifs")}</Link></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
