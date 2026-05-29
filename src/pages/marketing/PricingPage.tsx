import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type Plan } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
  const { t } = useI18n();
  const { user, updateUserPlan } = useStore();
  const navigate = useNavigate();

  const handleUpgrade = (plan: Plan) => {
    updateUserPlan(plan);
    toast.success(t("Upgraded!"));
    navigate("/app/plan");
  };

  const plans = [
    {
      id: "free",
      name: t("p.free"),
      price: t("p.free.price") + " XAF",
      description: t("Basic personal use."),
      features: [
        t("plan.free.f1"),
        t("plan.free.f2"),
      ],
    },
    {
      id: "plus",
      name: t("p.plus"),
      price: t("p.plus.price") + " XAF",
      description: t("More links for individuals."),
      features: [
        t("plan.plus.f1"),
        t("plan.plus.f2"),
        t("plan.plus.f3"),
      ],
    },
    {
      id: "pro",
      name: t("p.pro"),
      price: t("p.pro.price") + " XAF",
      description: t("Advanced features for power users."),
      features: [
        t("plan.pro.f1"),
        t("plan.pro.f2"),
        t("plan.pro.f3"),
        t("plan.pro.f4"),
      ],
      popular: true,
    },
    {
      id: "business",
      name: t("p.business"),
      price: t("p.business.price") + " XAF",
      description: t("Ideal for small businesses."),
      features: [
        t("plan.pro.f1"), 
        t("plan.biz.f1"),
        t("plan.biz.f2"),
        t("plan.biz.f3"),
      ],
    },
    {
      id: "premium",
      name: t("p.premium"),
      price: t("p.premium.price") + " XAF",
      description: t("The ultimate business solution."),
      features: [
        t("plan.biz.f1"),
        t("plan.premium.f1"),
        t("plan.premium.f2"),
      ],
    },
  ];

  return (
    <div className="space-y-10 py-6">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-semibold">{t("Simple, transparent pricing")}</h1>
        <p className="text-muted-foreground mt-3">
          {t("pricing.sub")}
        </p>
      </header>

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto px-4">
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
                {t("pricing.popular")}
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-xs">/mo</span>
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
              {user?.plan === plan.id ? t("Current Plan") : t("Select Plan")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
