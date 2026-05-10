import { Link } from "@tanstack/react-router";
import { MapPin, Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary shadow-pin">
            <MapPin className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">PinPoint</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">{t("nav.how")}</a>
          <a href="#features" className="hover:text-foreground transition-colors">{t("nav.features")}</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">{t("nav.pricing")}</a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-full border border-border bg-card/50 p-0.5 text-xs font-medium">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-full transition-colors ${lang === "en" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={lang === "en"}
            >EN</button>
            <button
              onClick={() => setLang("fr")}
              className={`px-2.5 py-1 rounded-full transition-colors ${lang === "fr" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={lang === "fr"}
            >FR</button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
            {t("nav.cta")}
          </Button>
        </div>
      </div>
    </header>
  );
}