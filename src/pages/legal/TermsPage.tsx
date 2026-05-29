import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Sections";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-display text-4xl font-semibold mb-8">{t("Terms and Conditions", "Conditions Générales d'Utilisation")}</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("1. Acceptance of Terms", "1. Acceptation des conditions")}</h2>
            <p className="text-muted-foreground">
              {t("By accessing and using PinPoint, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use this application.", 
                 "En accédant à PinPoint et en l'utilisant, vous acceptez d'être lié par les présentes conditions générales. Si vous n'acceptez pas toutes ces conditions, n'utilisez pas cette application.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("2. User Responsibility", "2. Responsabilité de l'utilisateur")}</h2>
            <p className="text-muted-foreground">
              {t("You are responsible for the accuracy of the pins you drop. PinPoint is a tool to facilitate navigation and delivery; we are not responsible for any delays or failed deliveries caused by incorrect pin placement.", 
                 "Vous êtes responsable de l'exactitude des épingles que vous déposez. PinPoint est un outil destiné à faciliter la navigation et la livraison ; nous ne sommes pas responsables des retards ou des échecs de livraison causés par un placement incorrect de l'épingle.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("3. Subscription and Billing", "3. Abonnement et facturation")}</h2>
            <p className="text-muted-foreground">
              {t("Certain features of PinPoint require a paid subscription. All prices are listed in XAF (FCFA). Subscriptions are billed monthly and can be canceled at any time. Referral bonuses are subject to our fair use policy.", 
                 "Certaines fonctionnalités de PinPoint nécessitent un abonnement payant. Tous les prix sont indiqués en XAF (FCFA). Les abonnements sont facturés mensuellement et peuvent être annulés à tout moment. Les bonus de parrainage sont soumis à notre politique d'utilisation équitable.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("4. Prohibited Use", "4. Utilisations interdites")}</h2>
            <p className="text-muted-foreground">
              {t("You may not use PinPoint for any illegal activity, including harassment, stalking, or unauthorized surveillance. We reserve the right to terminate accounts that violate these guidelines.", 
                 "Vous ne pouvez pas utiliser PinPoint pour toute activité illégale, y compris le harcèlement, la traque ou la surveillance non autorisée. Nous nous réservons le droit de résilier les comptes qui violent ces directives.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("5. Limitation of Liability", "5. Limitation de responsabilité")}</h2>
            <p className="text-muted-foreground">
              {t("PinPoint is provided 'as is' without warranty of any kind. We are not liable for any damages resulting from the use or inability to use our service.", 
                 "PinPoint est fourni 'en l'état' sans garantie d'aucune sorte. Nous ne sommes pas responsables des dommages résultant de l'utilisation ou de l'incapacité d'utiliser notre service.")}
            </p>
          </section>

          <p className="text-xs pt-8 border-t border-border">
            {t("Last updated: May 14, 2026", "Dernière mise à jour : 14 mai 2026")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
