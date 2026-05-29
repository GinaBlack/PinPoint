import { motion } from "framer-motion";
import { MapPin, Bookmark, Plus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";

function OveviewPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { user, addresses, saved } = useStore();

  const stats = [
    { label: t("My Addresses", "Mes adresses"), value: addresses.length, icon: MapPin },
    { label: t("Saved Links", "Liens enregistrés"), value: saved.length, icon: Bookmark },
    { label: t("Referrals", "Parrainages"), value: user?.referralCount || 0, icon: Gift },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("Welcome back,", "Bon retour,")} {user?.name}</h1>
          <p className="text-muted-foreground mt-1">{t("Here is what's happening with your addresses.", "Voici l'actualité de vos adresses.")}</p>
        </div>
        <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-pin border-0"><Link to="/app/add-address"><Plus className="w-4 h-4 mr-1.5" /> {t("Add address", "Ajouter une adresse")}</Link></Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">{t("Recent Activity", "Activité récente")}</h3>
          <div className="space-y-6">
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-10">
                {t("No addresses added yet.", "Aucune adresse ajoutée pour le moment.")}
              </p>
            ) : (
              addresses.slice(0, 3).map((addr) => (
                <div key={addr.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{addr.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(addr.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col items-center text-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("Refer & Earn", "Parrainez & Gagnez")}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
              {t("Invite friends to PinPoint and unlock bonus alias links for your profile.", "Invitez des amis et débloquez des liens d'alias bonus.")}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full mt-2"><Link to="/app/referral">{t("View referral link", "Voir mon lien")}</Link></Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="font-display text-4xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default OveviewPage;
