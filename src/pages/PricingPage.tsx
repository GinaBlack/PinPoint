import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type Plan } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { user, updateUserPlan } = useStore();
  const navigate = useNavigate();

  const handleUpgrade = (plan: Plan) => {
    updateUserPlan(plan);
    toast.success(t(`Upgraded to ${plan} plan!`, `Passé au forfait ${plan} !`));
    navigate("/app/plan");
  };

  const plans = [
    {
      id: "basic",
      name: t("Basic Personal", "Personnel de Base"),
      price: "$0",
      description: t("Perfect for individuals getting started.", "Idéal pour les particuliers qui débutent."),
      features: [
        t("Up to 3 addresses", "Jusqu'à 3 adresses"),
        t("Standard share links", "Liens de partage standard"),
        t("Basic search visibility", "Visibilité de recherche basique"),
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9",
      description: t("Advanced features for power users.", "Fonctionnalités avancées pour les utilisateurs avertis."),
      features: [
        t("Unlimited addresses", "Adresses illimitées"),
        t("Custom aliases", "Alias personnalisés"),
        t("Priority delivery chat", "Chat de livraison prioritaire"),
        t("Advanced analytics", "Analyses avancées"),
      ],
      popular: true,
    },
    {
      id: "business",
      name: "Business",
      price: "$29",
      description: t("Scalable solutions for your business.", "Solutions évolutives pour votre entreprise."),
      features: [
        t("Everything in Pro", "Tout ce qui est dans Pro"),
        t("Multi-user support", "Support multi-utilisateurs"),
        t("API access", "Accès API"),
        t("Dedicated support", "Support dédié"),
      ],
    },
  ];

  return (
    <div className="space-y-10 py-6">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-semibold">{t("Simple, transparent pricing", "Une tarification simple et transparente")}</h1>
        <p className="text-muted-foreground mt-3">
          {t("Choose the plan that's right for you. All plans include our core features.", "Choisissez le forfait qui vous convient. Tous les forfaits incluent nos fonctionnalités de base.")}
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl border p-8 flex flex-col ${
              plan.popular
                ? "border-primary bg-primary/5 shadow-elegant"
                : "border-border bg-card shadow-sm"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3 h-3" />
                {t("Most Popular", "Le plus populaire")}
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade(plan.id as Plan)}
              variant={plan.popular ? "default" : "outline"}
              className={`w-full rounded-xl h-11 transition-all ${
                user?.plan === plan.id ? "bg-muted text-muted-foreground border-transparent cursor-default pointer-events-none" : ""
              }`}
            >
              {user?.plan === plan.id ? t("Current Plan", "Forfait Actuel") : t("Select Plan", "Choisir")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
