import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Sections";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-display text-4xl font-semibold mb-8">{t("Privacy Policy", "Politique de Confidentialité")}</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("1. Information We Collect", "1. Informations que nous collectons")}</h2>
            <p className="text-muted-foreground">
              {t("We collect information you provide directly to us, such as your name, email address, and the precise geographic coordinates of the pins you drop. We also collect device information and usage data to improve our service.", 
                 "Nous collectons les informations que vous nous fournissez directement, telles que votre nom, votre adresse e-mail et les coordonnées géographiques précises des épingles que vous déposez. Nous collectons également des informations sur l'appareil et des données d'utilisation pour améliorer notre service.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("2. How We Use Your Information", "2. Comment nous utilisons vos informations")}</h2>
            <p className="text-muted-foreground">
              {t("Your location data is used primarily to generate shareable links and navigation routes for delivery agents. We do not sell your personal data to third parties. Your name and bio are only visible on public aliases or if you choose to include them in message links.", 
                 "Vos données de localisation sont utilisées principalement pour générer des liens partageables et des itinéraires de navigation pour les agents de livraison. Nous ne vendons pas vos données personnelles à des tiers. Votre nom et votre biographie ne sont visibles que sur les alias publics ou si vous choisissez de les inclure dans les liens de message.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("3. Anonymous vs. Public Sharing", "3. Partage anonyme vs public")}</h2>
            <p className="text-muted-foreground">
              {t("Anonymous links are designed to protect your identity and expire after 24 hours. Public aliases are searchable by other users. You have full control over which addresses are public and what information is shared through each link type.", 
                 "Les liens anonymes sont conçus pour protéger votre identité et expirent après 24 heures. Les alias publics peuvent être recherchés par d'autres utilisateurs. Vous avez le contrôle total sur les adresses qui sont publiques et sur les informations partagées via chaque type de lien.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("4. Data Retention", "4. Conservation des données")}</h2>
            <p className="text-muted-foreground">
              {t("We retain your account information and saved addresses as long as your account is active. You can delete individual addresses or your entire account at any time through your profile settings.", 
                 "Nous conservons vos informations de compte et vos adresses enregistrées tant que votre compte est actif. Vous pouvez supprimer des adresses individuelles ou l'intégralité de votre compte à tout moment via les paramètres de votre profil.")}
            </p>
          </section>

          <section className="space-y-4 text-foreground">
            <h2 className="text-xl font-bold">{t("5. Contact Us", "5. Contactez-nous")}</h2>
            <p className="text-muted-foreground">
              {t("If you have any questions about this Privacy Policy, please contact us at privacy@pinpoint.app.", 
                 "Si vous avez des questions sur cette politique de confidentialité, veuillez nous contacter à privacy@pinpoint.app.")}
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
