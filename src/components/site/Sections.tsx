import { Check, MapPin, Link2, Share2, MessageCircle, Globe2, Lock, Layers, Search, Sparkles, ArrowRight, WifiOff, Sun } from "lucide-react";
import { useState } from "react";
import {NavLink} from "../NavLink"
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

export function Problem() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center">
      <Eyebrow>{t("problem.eyebrow")}</Eyebrow>
      <h2 className="mt-6 font-display text-4xl sm:text-6xl font-semibold leading-[1.05]">
        {t("problem.title")}
      </h2>
      <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {t("problem.body")}
      </p>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: "01", icon: MapPin, t: t("how.s1.t"), b: t("how.s1.b") },
    { n: "02", icon: Link2, t: t("how.s2.t"), b: t("how.s2.b") },
    { n: "03", icon: Share2, t: t("how.s3.t"), b: t("how.s3.b") },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="max-w-2xl">
        <Eyebrow>{t("how.eyebrow")}</Eyebrow>
        <h2 className="mt-6 font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">{t("how.title")}</h2>
      </div>
      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="group relative rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-elegant hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground shadow-pin">
                <s.icon className="w-5 h-5" />
              </span>
              <span className="font-display text-3xl text-muted-foreground/40">{s.n}</span>
            </div>
            <h3 className="mt-8 font-display text-2xl font-semibold">{s.t}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{s.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SavedLinks() {
  const { t, lang } = useI18n();
  const items = [
    { name: "Chez Marie", from: lang === "fr" ? "Marie N." : "Marie N.", when: lang === "fr" ? "Hier" : "Yesterday", status: "active", type: "Alias" },
    { name: lang === "fr" ? "Livraison Glovo" : "Glovo drop-off", from: "Anonymous", when: lang === "fr" ? "Il y a 3 j" : "3d ago", status: "expired", type: "Anonymous" },
    { name: lang === "fr" ? "Maman — Bamenda" : "Mum — Bamenda", from: "Family", when: lang === "fr" ? "La sem. dernière" : "Last week", status: "active", type: "Message" },
    { name: "Bao Café", from: "Bao Café", when: lang === "fr" ? "Il y a 2 sem" : "2w ago", status: "active", type: "Alias" },
  ];
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Eyebrow>{t("feat.eyebrow")}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">{t("feat.title")}</h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("feat.body")}</p>
          <ul className="mt-8 space-y-3">
            {[t("feat.b1"), t("feat.b2"), t("feat.b3")].map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1 grid place-items-center w-5 h-5 rounded-full bg-primary/15 text-primary shrink-0">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 bg-gradient-hero blur-3xl opacity-70" />
          <div className="rounded-3xl border border-border bg-card shadow-elegant overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-primary text-primary-foreground">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <p className="font-display font-semibold">{lang === "fr" ? "Liens enregistrés" : "Saved Links"}</p>
              </div>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.name} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
                  <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${it.status === "active" ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {it.from} · {it.type} · {it.when}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                      it.status === "active"
                        ? "border-primary/30 text-primary bg-primary/10"
                        : "border-border text-muted-foreground bg-muted"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${it.status === "active" ? "bg-primary animate-pulse" : "bg-muted-foreground/50"}`} />
                    {it.status === "active" ? (lang === "fr" ? "Actif" : "Active") : (lang === "fr" ? "Expiré" : "Expired")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyDifferent() {
  const { t } = useI18n();
  const cells = [
    { i: WifiOff, k: 1 },
    { i: Lock, k: 2 },
    { i: Layers, k: 3 },
    { i: MessageCircle, k: 4 },
    { i: Search, k: 5 },
    { i: Sun, k: 6 },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] max-w-2xl">{t("why.title")}</h2>
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
        {cells.map(({ i: Icon, k }) => (
          <div key={k} className="bg-card p-8">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/20 text-accent-foreground">
              <Icon className="w-5 h-5" />
            </span>
            <h3 className="mt-6 font-display text-xl font-semibold">{t(`why.${k}.t`)}</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed text-sm">{t(`why.${k}.b`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type Plan = {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  popular?: boolean;
};

function PlanCard({ p }: { p: Plan }) {
  const { t } = useI18n();
  return (
    <div
      className={`relative rounded-3xl p-8 border transition-all ${
        p.popular
          ? "bg-gradient-primary text-primary-foreground border-transparent shadow-elegant scale-[1.02]"
          : "bg-card border-border hover:shadow-elegant"
      }`}
    >
      {p.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.18em] font-semibold bg-accent text-accent-foreground px-3 py-1 rounded-full">
          {t("pricing.popular")}
        </span>
      )}
      <p className={`text-sm uppercase tracking-[0.18em] font-medium ${p.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.name}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold">{p.price}</span>
        <span className={`text-sm ${p.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.cadence}</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.popular ? "text-primary-foreground" : "text-primary"}`} strokeWidth={3} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`mt-8 w-full rounded-full ${
          p.popular
            ? "bg-background text-foreground hover:bg-background/90"
            : "bg-foreground text-background hover:bg-foreground/90"
        }`}
      >
        {t("pricing.cta")} <ArrowRight className="ml-1 w-4 h-4" />
      </Button>
    </div>
  );
}

export function Pricing() {
  const { t } = useI18n();

  const plans: Plan[] = [
    { name: t("p.free"), price: "0", cadence: `FCFA${t("pricing.month")}`, features: [t("plan.free.f1"), t("plan.free.f2")] },
    { name: t("p.plus"), price: "3,000", cadence: `FCFA${t("pricing.month")}`, features: [t("plan.plus.f1"), t("plan.plus.f2"), t("plan.plus.f3")] },
    { name: t("p.pro"), price: "7,000", cadence: `FCFA${t("pricing.month")}`, features: [t("plan.pro.f1"), t("plan.pro.f2"), t("plan.pro.f3"), t("plan.pro.f4")], popular: true },
    { name: t("p.business"), price: "15,000", cadence: `FCFA${t("pricing.month")}`, features: [t("plan.biz.f1"), t("plan.biz.f2"), t("plan.biz.f3")] },
    { name: t("p.premium"), price: "25,000", cadence: `FCFA${t("pricing.month")}`, features: [t("plan.premium.f1"), t("plan.premium.f2")] },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="text-center max-w-2xl mx-auto">
        <Eyebrow>{t("pricing.eyebrow")}</Eyebrow>
        <h2 className="mt-6 font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">{t("pricing.title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("pricing.sub")}</p>
      </div>

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {plans.map((p) => <PlanCard key={p.name} p={p} />)}
      </div>
    </section>
  );
}

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-primary text-primary-foreground p-12 sm:p-20 text-center shadow-elegant">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "60px 60px, 80px 80px" }} />
        <Globe2 className="w-10 h-10 mx-auto opacity-80" />
        <h2 className="relative mt-6 font-display text-4xl sm:text-6xl font-semibold leading-[1.05] max-w-3xl mx-auto">
          {t("cta.title")}
        </h2>
        <p className="relative mt-6 text-primary-foreground/80 max-w-xl mx-auto text-lg">{t("cta.sub")}</p>
        <Button asChild size="lg" className="relative mt-10 rounded-full bg-background text-foreground hover:bg-background/90 px-8 h-12 text-base">
          <NavLink to="/onboarding">{t("cta.btn")} <ArrowRight className="ml-1.5 w-4 h-4" /></NavLink>
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-primary text-primary-foreground">
            <MapPin className="w-3.5 h-3.5" />
          </span>
          <span className="font-display font-semibold text-foreground">PinPoint</span>
          <span className="hidden sm:inline">— {t("foot.tag")}</span>
        </div>
        <p>© {new Date().getFullYear()} PinPoint · {t("foot.rights")}</p>
      </div>
    </footer>
  );
}