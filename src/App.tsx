import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "./pages/marketing/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import AddressesPage from "./pages/app/AddressesPage";
import AliasPage from "./pages/public/AliasPage";
import OverviewPage from "./pages/app/OverviewPage";
import BusinessPage from "./pages/app/BusinessPage";
import AnalyticsPage from "./pages/app/AnalyticsPage";
import SavedLinksPage from "./pages/app/SavedLinksPage";
import MyLinksPage from "./pages/app/MyLinksPage";
import MessagesPage from "./pages/app/MessagesPage";
import PricingPage from "./pages/marketing/PricingPage";
import NotificationsPage from "./pages/app/NotificationsPage";
import MyPlanPage from "./pages/app/MyPlanPage";
import ProfilePage from "./pages/app/ProfilePage";
import MessagePage from "./pages/public/MessagePage";
import SearchPage from "./pages/public/SearchPage";
import Onboarding from "./pages/onboarding/OnboardingPage";
import AddAddressPage from "./pages/app/AddAddressPage";
import SupportPage from "./pages/support/SupportPage";
import HelpPage from "./pages/support/HelpPage";
import ReferralPage from "./pages/app/ReferralPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import VerificationPage from "./pages/auth/VerificationPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

import { I18nProvider } from "./lib/i18n";  
import { useAuth } from "./lib/auth";
import { useStore } from "./lib/store";
import { useEffect } from "react";

import NotFound from "./pages/errors/NotFound";

const queryClient = new QueryClient();

const AuthSync = () => {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { user: localUser, loading: storeLoading, syncUser } = useStore();

  useEffect(() => {
    if (!authLoading && !storeLoading && firebaseUser && !localUser) {
      // Firebase is logged in but Firestore user doc is not yet in state
      const email = firebaseUser.email || `${firebaseUser.uid}@noemail.com`;
      syncUser(email, firebaseUser.displayName || undefined);
    }
  }, [firebaseUser, localUser, authLoading, storeLoading, syncUser]);

  return null;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/verify" element={<VerificationPage />} />
    <Route path="/app" element={<AppLayout />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<OverviewPage />} />
      <Route path="addresses" element={<AddressesPage />} />
      <Route path="links" element={<MyLinksPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="plan" element={<MyPlanPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="saved" element={<SavedLinksPage />} />
      <Route path="business" element={<BusinessPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="add-address" element={<AddAddressPage />} />
      <Route path="support" element={<SupportPage />} />
      <Route path="help" element={<HelpPage />} />
      <Route path="referral" element={<ReferralPage />} />
      <Route path="privacy" element={<PrivacyPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="admin" element={<AdminDashboard />} />
    </Route>
    <Route path="/a/:alias" element={<AliasPage />} />
    <Route path="/m/:linkId" element={<MessagePage />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <TooltipProvider>
            <AuthSync />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
