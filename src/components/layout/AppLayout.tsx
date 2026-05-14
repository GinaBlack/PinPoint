import { Link, Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Bookmark, 
  Building2, 
  Search, 
  Home as HomeIcon, 
  LogOut, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Link2,
  MessageCircle,
  Bell,
  CreditCard,
  Shield,
  User,
  Section,
  LayoutDashboard,
  LucideInfo,
  Headphones,
  Info,
  Settings,
  Gift
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function AppLayout() {
  const navigate = useNavigate();
  const { user, logout, onboarded } = useStore();
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not logged in
  if (!user) return <Navigate to="/auth" replace />;

  // Redirect to onboarding if not completed
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const menuItems = [
    { to: "/", label: t("Home", "Accueil"), icon: HomeIcon, exact: true }, // Changed from /app/overview to /
    { to: "/app/overview", label: t("Dashboard", "Tableau de bord"), icon: LayoutDashboard, exact: true }, // Added as separate, or can be removed if redundant
    { to: "/app/addresses", label: t("My addresses", "Mes adresses"), icon: MapPin },
    { to: "/app/links", label: t("My Links", "Mes Liens"), icon: Link2 },
    { to: "/app/messages", label: t("Messages", "Messages"), icon: MessageCircle },
    { to: "/app/profile", label: t("Profile", "Profil"), icon: User },
    { to: "/app/notifications", label: t("Notifications", "Notifications"), icon: Bell },
    { to: "/app/pricing", label: t("Pricing", "Tarification"), icon: CreditCard },
    { to: "/app/plan", label: t("My Plan", "Mon Forfait"), icon: Shield },
    { to: "/app/saved", label: t("Saved Links", "Liens enregistrés"), icon: Bookmark },
    { to: "/app/business", label: t("Business", "Entreprise"), icon: Building2 },
    { to: "/app/search", label: t("Public search", "Recherche publique"), icon: Search },
    { to: "/app/referral", label: t("Refer & Earn", "Parrainage"), icon: Gift },
    { to: "/app/support", label: t("Customer Support", "Assistance client"), icon: Headphones },
    { to: "/app/help", label: t("Help", "Aide"), icon: Info },
  ];

  const SidebarContent = ({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-card border-r border-border/60">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary shadow-pin flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-primary-foreground" />
        </div>
        {(!isCollapsed || mobile) && (
          <span className="font-display text-xl font-semibold tracking-tight">PinPoint</span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(!isCollapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60 space-y-4">
        {(!isCollapsed || mobile) && (
          <Link 
            to="/app/profile" 
            onClick={onClose}
            className="flex items-center gap-3 px-2 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
        )}
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl ${
            isCollapsed && !mobile ? "px-2" : ""
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!isCollapsed || mobile) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block transition-all duration-300 ease-in-out border-r border-border/60 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen flex flex-col relative">
          <SidebarContent />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-lg z-50 hover:scale-110 transition-transform"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/60 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary shadow-pin flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold tracking-tight">PinPoint</span>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent mobile onClose={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-10 pt-24 md:pt-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
