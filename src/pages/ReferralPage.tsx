import { useState } from "react";
import { Gift, Copy, Check, Users, Link2, ArrowRight, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function ReferralPage() {
  const { t } = useI18n();
  const { user } = useStore();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const referralLink = `${window.location.origin}/auth?mode=register&ref=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t("ref.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <Gift className="w-8 h-8" />
        </div>
        <h1 className="font-display text-4xl font-semibold">{t("ref.title")}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{t("ref.sub")}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Referral Link Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold">{t("ref.card.t")}</h2>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("ref.card.d")}
          </p>

          <div className="flex gap-2">
            <Input 
              readOnly 
              value={referralLink} 
              className="rounded-xl bg-muted/30 border-border/60 text-xs h-12"
            />
            <Button onClick={copyLink} size="icon" className="h-12 w-12 rounded-xl shrink-0 shadow-pin">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="pt-4 flex items-center justify-center">
             <Button variant="outline" className="rounded-full gap-2 text-xs font-bold uppercase tracking-widest px-6">
                <Share2 className="w-3.5 h-3.5" />
                {t("Share Link", "Partager")}
             </Button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("ref.stats.t")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                <p className="text-3xl font-display font-bold text-primary">{user.referralCount || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{t("ref.stats.count")}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                <p className="text-3xl font-display font-bold text-green-500">+{user.bonusAliasLinks || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{t("ref.stats.bonus")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
               <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{t("Top Referrers", "Top Parrains")}</p>
              <p className="text-xs text-muted-foreground">{t("Join the leaderboard this month.", "Rejoignez le classement ce mois-ci.")}</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
