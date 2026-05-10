import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { MapPin, Bookmark, Building2, Search, Home as HomeIcon, Plus } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/app", label: t("Overview", "Tableau de bord"), icon: HomeIcon, exact: true },
    { to: "/app/addresses", label: t("My addresses", "Mes adresses"), icon: MapPin },
    { to: "/app/saved", label: t("Saved Links", "Liens enregistrés"), icon: Bookmark },
    { to: "/app/business", label: t("Business", "Entreprise"), icon: Building2 },
    { to: "/search", label: t("Public search", "Recherche publique"), icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 self-start">
          <Button asChild className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0 mb-4">
            <Link to="/onboarding"><Plus className="w-4 h-4 mr-1.5" /> {t("New address", "Nouvelle adresse")}</Link>
          </Button>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {items.map((it) => {
              const active = it.exact ? path === it.to : path.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors whitespace-nowrap ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <it.icon className="w-4 h-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}