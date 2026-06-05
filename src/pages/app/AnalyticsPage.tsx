import { BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { BusinessAnalytics } from "@/components/business/BusinessAnalytics";

export default function AnalyticsPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-semibold flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          {t("Business Intelligence", "Intelligence Business")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("Advanced analytics for your delivery operations.", "Analyses avancées pour vos opérations de livraison.")}
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <BusinessAnalytics />
      </div>
    </div>
  );
}
