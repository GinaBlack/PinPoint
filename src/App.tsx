import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AddressesPage from "./pages/AddressesPage";
import AliasPage from "./pages/AliasPage";
import OverviewPage from "./pages/OverviewPage";
import BusinessPage from "./pages/BusinessPage";
import SavedLinksPage from "./pages/SavedLinksPage";
import MyLinksPage from "./pages/MyLinksPage";
import MessagesPage from "./pages/MessagesPage";
import PricingPage from "./pages/PricingPage";
import NotificationsPage from "./pages/NotificationsPage";
import MyPlanPage from "./pages/MyPlanPage";
import ProfilePage from "./pages/ProfilePage";
import MessagePage from "./pages/MessagePage";
import SearchPage from "./pages/SearchPage";
import Onboarding from "./pages/OnboardingPage";

import { I18nProvider } from "./lib/i18n";  

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
    <Route path="/auth" element={<AuthPage />} />
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
      <Route path="search" element={<SearchPage />} />
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
      <I18nProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
