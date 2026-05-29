import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { reload } from "firebase/auth";
import { useStore } from "@/lib/store";

export default function VerificationPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!user) {
      toast.error("No user found.");
      return;
    }
    setIsLoading(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        // Sync with local store
        store.verifyEmail(user.email!);
        
        toast.success("Email verified successfully!");
        navigate("/onboarding");
      } else {
        toast.error("Email not verified yet. Please check your inbox.");
      }
    } catch (error: any) {
      toast.error("Verification check failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">{t("Verify your email", "Vérifiez votre e-mail")}</CardTitle>
          <CardDescription>
            {t("Check your email and click the verification link, then click the button below.", "Vérifiez votre e-mail et cliquez sur le lien de vérification, puis cliquez sur le bouton ci-dessous.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full rounded-xl" 
            onClick={handleVerify}
            disabled={isLoading || !user}
          >
            {isLoading ? t("Checking...", "Vérification...") : t("I've verified", "J'ai vérifié")}
            {!isLoading && <CheckCircle className="w-4 h-4 ml-2" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
