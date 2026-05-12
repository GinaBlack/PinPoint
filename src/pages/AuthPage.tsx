import { useSearchParams, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Sections";
import { useStore } from "@/lib/store";

export default function AuthPage() {
  const { user } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") !== "register";

  if (user) return <Navigate to="/app/overview" replace />;

  const switchToRegister = () => setSearchParams({ mode: "register" });
  const switchToLogin = () => setSearchParams({ mode: "login" });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {isLogin ? (
          <LoginPage onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterPage onSwitchToLogin={switchToLogin} />
        )}
      </main>
      <Footer />
    </div>
  );
}
