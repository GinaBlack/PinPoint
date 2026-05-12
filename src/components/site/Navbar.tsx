import { NavLink } from "../NavLink"
import { MapPin, Moon, Sun, LogOut, User, Bell } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, notifications } = useStore();

  const isAuthPage = pathname === "/auth";
  const isRegister = searchParams.get("mode") === "register";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary shadow-pin">
            <MapPin className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">PinPoint</span>
        </NavLink>

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

          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Button asChild variant="ghost" className="rounded-full p-2 relative">
                <NavLink to="/app/notifications">
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </NavLink>
              </Button>
              
              <Button asChild variant="ghost" className="rounded-full gap-2">
                <NavLink to="/app/overview">
                  <User className="w-4 h-4" />
                  Account
                </NavLink>
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="rounded-full gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              {!isAuthPage && (
                <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
                  <NavLink to="/onboarding">{t("nav.cta")}</NavLink>
                </Button>
              )}

              <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0">
                {isAuthPage ? (
                  <NavLink to={isRegister ? "/auth?mode=login" : "/auth?mode=register"}>
                    {isRegister ? t("nav.login") : t("nav.register")}
                  </NavLink>
                ) : (
                  <NavLink to="/auth">{t("nav.login")}</NavLink>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}