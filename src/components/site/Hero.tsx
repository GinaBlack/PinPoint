import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MapVisual } from "./MapVisual";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase tracking-[0.18em] text-muted-foreground">{t("hero.eyebrow")}</span>
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl xl:text-[5.5rem] font-semibold leading-[0.98] tracking-tight">
            {t("hero.title1")}
            <br />
            <span className="italic text-primary">{t("hero.title2")}</span>
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            {t("hero.sub")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 h-12 px-6 text-base">
              {t("hero.cta1")} <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-6 text-base bg-card/60 backdrop-blur" asChild>
              <a href="#how">{t("hero.cta2")}</a>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { v: "20+", l: t("hero.stat1") },
              { v: "12", l: t("hero.stat2") },
              { v: "EN · FR", l: t("hero.stat3") },
            ].map((s) => (
              <div key={s.l} className="border-l border-border pl-4">
                <dt className="font-display text-2xl sm:text-3xl font-semibold">{s.v}</dt>
                <dd className="mt-1 text-xs text-muted-foreground leading-snug">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <MapVisual />
      </div>
    </section>
  );
}