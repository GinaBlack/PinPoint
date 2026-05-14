import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.how": "How it works",
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.signin": "Sign in",
  "nav.cta": "Get PinPoint",
    "nav.login": "Login",
  "nav.register": "Register",


  "hero.eyebrow": "Made for Cameroon",
  "hero.title1": "An address that",
  "hero.title2": "actually finds you.",
  "hero.sub": "No street name. No house number. Just drop a pin on your door, share a link, and let deliveries arrive exactly where you are.",
  "hero.cta1": "Drop your first pin",
  "hero.cta2": "See how it works",
  "hero.stat1": "Average minutes saved per delivery",
  "hero.stat2": "Cities live across Cameroon",
  "hero.stat3": "Languages supported",

  "problem.eyebrow": "The problem",
  "problem.title": "“Behind the blue gate, near the church.”",
  "problem.body": "In Cameroon most streets have no names and most houses have no numbers. Riders get lost, packages return to the depot, and you waste an afternoon collecting what should have arrived at your door. PinPoint replaces a paragraph of directions with one tap on a map.",

  "how.eyebrow": "How it works",
  "how.title": "Three taps, one perfect address.",
  "how.s1.t": "Pin your spot",
  "how.s1.b": "Open PinPoint, allow GPS, and drag the pin onto your door, shop, or gate. Save as many places as you like.",
  "how.s2.t": "Choose a link",
  "how.s2.b": "Anonymous (24h), an alias like pinpoint.app/@ChezMarie, or a message link with built-in chat.",
  "how.s3.t": "Share anywhere",
  "how.s3.b": "WhatsApp, SMS, email — the receiver only needs a browser. One tap launches turn-by-turn navigation.",

  "feat.eyebrow": "New",
  "feat.title": "Saved Links — your address book, built automatically.",
  "feat.body": "Every PinPoint link shared with you appears in one quiet list. Active links glow green. Expired ones are clearly marked. No more digging through old WhatsApp threads to find that one address from last week.",
  "feat.b1": "Active, expired, and disabled — at a glance",
  "feat.b2": "Pull to refresh — see what still works",
  "feat.b3": "Anonymous, alias, and message links in one place",

  "why.title": "Why PinPoint feels different",
  "why.1.t": "Works offline to share",
  "why.1.b": "Send a link by SMS even with no data. The receiver opens it whenever they’re online.",
  "why.2.t": "Privacy by default",
  "why.2.b": "Anonymous links hide your name, photo, and notes. You decide what every visitor sees.",
  "why.3.t": "Multiple addresses",
  "why.3.b": "Buea today, Bamenda tomorrow. Switch between locations in two seconds.",
  "why.4.t": "Chat on the map",
  "why.4.b": "Message links keep the conversation right next to the pin — no app-juggling.",
  "why.5.t": "Public search",
  "why.5.b": "Make a shop or restaurant address public and customers find it by typing your alias.",
  "why.6.t": "EN · FR · light · dark",
  "why.6.b": "The whole experience speaks both languages and adapts to any light.",

  "pricing.eyebrow": "Pricing",
  "pricing.title": "A plan for every pocket.",
  "pricing.sub": "All prices in FCFA. Start free, upgrade when you need more.",
  "pricing.tab1": "Personal",
  "pricing.tab2": "Homeowners",
  "pricing.tab3": "Business",
  "pricing.month": "/month",
  "pricing.year": "/year",
  "pricing.once": "one-time",
  "pricing.cta": "Choose plan",
  "pricing.popular": "Most popular",

  "p.free.price": "0",
  "p.plus.price": "3,000",
  "p.pro.price": "7,000",
  "p.business.price": "15,000",
  "p.premium.price": "25,000",

  "ref.title": "Refer & Earn",
  "ref.sub": "Invite friends to PinPoint and unlock bonus features.",
  "ref.card.t": "Your Referral Link",
  "ref.card.d": "Share this link. When someone joins, you get 10 extra alias links per month!",
  "ref.stats.t": "Your Impact",
  "ref.stats.count": "Friends Joined",
  "ref.stats.bonus": "Bonus Alias Links",
  "ref.copy": "Copy Link",
  "ref.copied": "Link copied!",

  "p.free": "Free",
  "p.plus": "Plus",
  "p.pro": "Pro",
  "p.business": "Business",
  "p.premium": "Premium",

  "plan.free.f1": "1 personal address",
  "plan.free.f2": "10 anonymous links/mo",
  "plan.plus.f1": "1 personal address",
  "plan.plus.f2": "15 anonymous links/mo",
  "plan.plus.f3": "7 alias links/mo",
  "plan.pro.f1": "2 personal & 1 home address",
  "plan.pro.f2": "Unlimited anonymous links",
  "plan.pro.f3": "20 alias links/mo",
  "plan.pro.f4": "Photo uploads & notes",
  "plan.biz.f1": "1 business address",
  "plan.biz.f2": "Aliased photos & notes",
  "plan.biz.f3": "Public profile default",
  "plan.premium.f1": "Business analytics",
  "plan.premium.f2": "Priority support",

  "help.title": "Help Center",
  "help.sub": "Everything you need to know about using PinPoint.",
  "help.guide.title": "Step-by-Step Guide",
  "help.s1.t": "1. Drop your Pin",
  "help.s1.d": "Open the app and drag the pin to your exact entrance. Precision is key!",
  "help.s2.t": "2. Add Details",
  "help.s2.d": "Give it a name like 'Home' and add a photo of your gate to help riders.",
  "help.s3.t": "3. Pick a Link",
  "help.s3.d": "Choose between Anonymous (private), Alias (permanent), or Message (chat).",
  "help.s4.t": "4. Share & Relax",
  "help.s4.d": "Send the link via WhatsApp or SMS. The rider follows it directly to your door.",
  "help.faq.title": "Common Questions",

  "cta.title": "Stop describing. Start sharing.",
  "cta.sub": "Turn “somewhere near the blue gate” into one perfect tap. No street names. No government. Just your phone.",
  "cta.btn": "Drop your first pin — it’s free",

  "foot.tag": "A simple address for everyone in Cameroon.",
  "foot.rights": "All rights reserved.",
};

const fr: Dict = {
  "nav.how": "Comment ça marche",
  "nav.features": "Fonctions",
  "nav.pricing": "Tarifs",
  "nav.signin": "Connexion",
  "nav.cta": "Obtenir PinPoint",
  "nav.login": "Connexion",
  "nav.register": "S'inscrire",

  "hero.eyebrow": "Conçu pour le Cameroun",
  "hero.title1": "Une adresse qui",
  "hero.title2": "vous trouve vraiment.",
  "hero.sub": "Pas de nom de rue. Pas de numéro. Posez une épingle sur votre porte, partagez un lien, et les livraisons arrivent exactement chez vous.",
  "hero.cta1": "Posez votre épingle",
  "hero.cta2": "Voir comment ça marche",
  "hero.stat1": "Minutes économisées par livraison",
  "hero.stat2": "Villes actives au Cameroun",
  "hero.stat3": "Langues prises en charge",

  "problem.eyebrow": "Le problème",
  "problem.title": "« Derrière le portail bleu, près de l’église. »",
  "problem.body": "Au Cameroun, la plupart des rues n’ont pas de nom et la plupart des maisons pas de numéro. Les livreurs se perdent, les colis repartent au dépôt, et vous perdez un après-midi à aller chercher ce qui aurait dû arriver chez vous. PinPoint remplace un paragraphe d’indications par un simple geste sur la carte.",

  "how.eyebrow": "Comment ça marche",
  "how.title": "Trois gestes, une adresse parfaite.",
  "how.s1.t": "Posez votre épingle",
  "how.s1.b": "Ouvrez PinPoint, activez le GPS, déposez l’épingle sur votre porte, boutique ou portail. Enregistrez autant de lieux que vous voulez.",
  "how.s2.t": "Choisissez un lien",
  "how.s2.b": "Anonyme (24h), un alias comme pinpoint.app/@ChezMarie, ou un lien message avec chat intégré.",
  "how.s3.t": "Partagez partout",
  "how.s3.b": "WhatsApp, SMS, email — un navigateur suffit au destinataire. Un clic lance la navigation guidée.",

  "feat.eyebrow": "Nouveau",
  "feat.title": "Liens enregistrés — votre carnet d’adresses, automatique.",
  "feat.body": "Chaque lien PinPoint qu’on vous partage apparaît dans une liste claire. Les liens actifs s’affichent en vert. Les expirés sont clairement signalés. Fini de fouiller dans les anciens messages WhatsApp.",
  "feat.b1": "Actif, expiré, désactivé — d’un coup d’œil",
  "feat.b2": "Tirez pour rafraîchir — voyez ce qui marche encore",
  "feat.b3": "Anonyme, alias et message au même endroit",

  "why.title": "Pourquoi PinPoint est différent",
  "why.1.t": "Partage hors-ligne",
  "why.1.b": "Envoyez un lien par SMS sans data. Le destinataire l’ouvre dès qu’il est en ligne.",
  "why.2.t": "Vie privée par défaut",
  "why.2.b": "Les liens anonymes cachent nom, photo et notes. Vous décidez ce que chacun voit.",
  "why.3.t": "Plusieurs adresses",
  "why.3.b": "Buea aujourd’hui, Bamenda demain. Changez de lieu en deux secondes.",
  "why.4.t": "Chat sur la carte",
  "why.4.b": "Les liens message gardent la conversation à côté de l’épingle — sans changer d’app.",
  "why.5.t": "Recherche publique",
  "why.5.b": "Rendez l’adresse d’un commerce publique : on vous trouve en tapant votre alias.",
  "why.6.t": "EN · FR · clair · sombre",
  "why.6.b": "Toute l’expérience parle les deux langues et s’adapte à toute lumière.",

  "pricing.eyebrow": "Tarifs",
  "pricing.title": "Un plan pour chaque budget.",
  "pricing.sub": "Tous les prix en FCFA. Commencez gratuitement, évoluez ensuite.",
  "pricing.tab1": "Personnel",
  "pricing.tab2": "Particuliers",
  "pricing.tab3": "Entreprise",
  "pricing.month": "/mois",
  "pricing.year": "/an",
  "pricing.once": "unique",
  "pricing.cta": "Choisir",
  "pricing.popular": "Le plus choisi",

  "p.free.price": "0",
  "p.plus.price": "3.000",
  "p.pro.price": "7.000",
  "p.business.price": "15.000",
  "p.premium.price": "25.000",

  "ref.title": "Parrainez & Gagnez",
  "ref.sub": "Invitez des amis sur PinPoint et débloquez des bonus.",
  "ref.card.t": "Votre lien de parrainage",
  "ref.card.d": "Partagez ce lien. Quand quelqu'un s'inscrit, vous gagnez 10 liens d'alias bonus par mois !",
  "ref.stats.t": "Votre impact",
  "ref.stats.count": "Amis inscrits",
  "ref.stats.bonus": "Liens d'alias bonus",
  "ref.copy": "Copier le lien",
  "ref.copied": "Lien copié !",

  "p.free": "Gratuit",
  "p.plus": "Plus",
  "p.pro": "Pro",
  "p.business": "Business",
  "p.premium": "Premium",

  "plan.free.f1": "1 adresse personnelle",
  "plan.free.f2": "10 liens anonymes/mois",
  "plan.plus.f1": "1 adresse personnelle",
  "plan.plus.f2": "15 liens anonymes/mois",
  "plan.plus.f3": "7 liens d'alias/mois",
  "plan.pro.f1": "2 perso & 1 domicile",
  "plan.pro.f2": "Liens anonymes illimités",
  "plan.pro.f3": "20 liens d'alias/mois",
  "plan.pro.f4": "Photos & notes",
  "plan.biz.f1": "1 adresse business",
  "plan.biz.f2": "Photos & notes avec alias",
  "plan.biz.f3": "Profil public par défaut",
  "plan.premium.f1": "Analyses business",
  "plan.premium.f2": "Support prioritaire",

  "help.title": "Centre d'aide",
  "help.sub": "Tout ce que vous devez savoir pour utiliser PinPoint.",
  "help.guide.title": "Guide étape par étape",
  "help.s1.t": "1. Posez votre épingle",
  "help.s1.d": "Ouvrez l'appli et glissez l'épingle sur votre entrée exacte. La précision est capitale !",
  "help.s2.t": "2. Ajoutez des détails",
  "help.s2.d": "Donnez un nom comme 'Maison' et ajoutez une photo du portail pour aider les livreurs.",
  "help.s3.t": "3. Choisissez un lien",
  "help.s3.d": "Choisissez entre Anonyme (privé), Alias (permanent) ou Message (chat).",
  "help.s4.t": "4. Partagez & relaxez",
  "help.s4.d": "Envoyez le lien via WhatsApp ou SMS. Le livreur arrive directement à votre porte.",
  "help.faq.title": "Questions fréquentes",

  "cta.title": "Cessez de décrire. Commencez à partager.",
  "cta.sub": "Transformez « quelque part près du portail bleu » en un geste précis. Pas de noms de rues. Pas de gouvernement. Juste votre téléphone.",
  "cta.btn": "Posez votre première épingle — c’est gratuit",

  "foot.tag": "Une adresse simple pour tous, au Cameroun.",
  "foot.rights": "Tous droits réservés.",
};

const dicts: Record<Lang, Dict> = { en, fr };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("pp.lang") as Lang)) || null;
    if (saved === "en" || saved === "fr") setLangState(saved);
    else if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) setLangState("fr");
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("pp.lang", l);
  };

  const t = (k: string) => dicts[lang][k] ?? k;
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}