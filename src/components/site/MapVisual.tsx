import { MapPin, Navigation, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function MapVisual() {
  const { lang } = useI18n();
  return (
    <div className="relative aspect-[5/6] sm:aspect-[4/5] w-full max-w-md mx-auto">
      {/* glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-hero blur-2xl opacity-80" />

      {/* map card */}
      <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-elegant border border-border/60 bg-card">
        {/* faux map */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.95 0.02 130)" />
              <stop offset="100%" stopColor="oklch(0.88 0.04 150)" />
            </linearGradient>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(0.48 0.13 160 / 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="480" fill="url(#mapBg)" />
          <rect width="400" height="480" fill="url(#grid)" />
          {/* roads */}
          <path d="M -20 120 Q 200 90 420 200" stroke="oklch(1 0 0 / 0.85)" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M 60 -20 Q 120 220 220 500" stroke="oklch(1 0 0 / 0.7)" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 420 320 Q 250 360 -20 380" stroke="oklch(1 0 0 / 0.55)" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* park */}
          <ellipse cx="320" cy="100" rx="80" ry="60" fill="oklch(0.78 0.13 150 / 0.45)" />
          {/* river */}
          <path d="M 0 420 Q 150 360 300 440 T 500 420" stroke="oklch(0.68 0.12 220 / 0.5)" strokeWidth="22" fill="none" strokeLinecap="round" />
        </svg>

        {/* dotted route to pin */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 480" aria-hidden="true">
          <path d="M 60 420 Q 160 380 200 280" stroke="oklch(0.48 0.13 160)" strokeWidth="2.5" strokeDasharray="2 8" fill="none" strokeLinecap="round" />
        </svg>

        {/* pin */}
        <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
          <div className="rounded-full bg-card text-card-foreground px-3 py-1.5 mb-2 text-xs font-medium shadow-elegant border border-border whitespace-nowrap">
            pin-point-zeta.vercel.app/<span className="text-primary font-semibold">@ChezMarie</span>
          </div>
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <span className="relative grid place-items-center w-12 h-12 rounded-full bg-gradient-primary shadow-pin">
              <MapPin className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} fill="currentColor" fillOpacity={0.15} />
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-primary mt-1" />
        </div>

        {/* floating chat card */}
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-card/95 backdrop-blur border border-border shadow-elegant p-3 flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-accent/30 text-accent-foreground shrink-0">
            <MessageCircle className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium leading-tight">
              {lang === "fr" ? "Livreur · 2 min" : "Rider · 2 min away"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {lang === "fr" ? "Je suis devant le portail bleu 👍" : "I’m at the blue gate 👍"}
            </p>
          </div>
          <button className="grid place-items-center w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground shadow-pin">
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}