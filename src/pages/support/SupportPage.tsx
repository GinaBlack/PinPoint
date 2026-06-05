import { useState, useEffect, useRef } from "react";
import { Headphones, MessageCircle, Send, Search, ChevronDown, Check, User, Sparkles, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Msg = { id: string; text: string; sender: "user" | "support"; timestamp: number };

export default function SupportPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { user } = useStore();
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: "1", text: t("Hello! How can we help you today?", "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?"), sender: "support", timestamp: Date.now() - 10000 }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const faqs = [
    { q: t("How do I create an alias?", "Comment créer un alias ?"), a: t("Go to Addresses, click Edit on any address, and type your desired name in the Alias field. Note: requires Plus plan or higher.", "Allez dans Adresses, cliquez sur Modifier et tapez le nom souhaité. Note : nécessite le forfait Plus ou supérieur.") },
    { q: t("Are anonymous links permanent?", "Les liens anonymes sont-ils permanents ?"), a: t("No, anonymous links expire after 24 hours for security and privacy.", "Non, les liens anonymes expirent après 24 heures pour des raisons de sécurité et de confidentialité.") },
    { q: t("How can I change my plan?", "Comment changer mon forfait ?"), a: t("Visit the Pricing page in your dashboard to view all available tiers and upgrade instantly.", "Visitez la page Tarifs dans votre tableau de bord pour voir tous les forfaits disponibles.") },
    { q: t("Can I use PinPoint offline?", "Puis-je utiliser PinPoint hors-ligne ?"), a: t("Yes! You can generate links while offline. They will be shared via SMS and can be opened by the recipient whenever they are online.", "Oui ! Vous pouvez générer des liens hors-ligne. Ils seront partagés par SMS.") },
  ].filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Msg = { id: Math.random().toString(), text: input, sender: "user", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate instant support response
    setTimeout(() => {
      const responses = [
        t("Thanks for reaching out! One of our agents will be with you shortly.", "Merci de nous avoir contactés ! Un agent sera avec vous sous peu."),
        t("We've received your inquiry. While you wait, have you checked our FAQ below?", "Nous avons reçu votre demande. En attendant, avez-vous consulté notre FAQ ?"),
        t("Got it! We're looking into that for you right now.", "C'est noté ! Nous examinons cela pour vous en ce moment.")
      ];
      const supportMsg: Msg = { id: Math.random().toString(), text: responses[Math.floor(Math.random() * responses.length)], sender: "support", timestamp: Date.now() };
      setMessages(prev => [...prev, supportMsg]);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold">{t("Customer Support", "Assistance client")}</h1>
            <p className="text-muted-foreground">{t("We're here to help, 24/7.", "Nous sommes là pour vous aider, 24h/24 et 7j/7.")}</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Help Center / FAQ */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t("Search for help...", "Rechercher de l'aide...")} 
              className="pl-11 h-12 rounded-2xl border-border/60 bg-card shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2 px-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t("Frequently Asked Questions", "Foire aux questions")}
            </h2>
            {faqs.length > 0 ? faqs.map((f, i) => (
              <div key={i} className="group rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-elegant transition-all">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-base">{f.q}</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </div>
            )) : (
              <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                <p className="text-muted-foreground">{t("No matching questions found.", "Aucune question correspondante trouvée.")}</p>
              </div>
            )}
          </div>

          {/* Contact Methods */}
          <div className="grid sm:grid-cols-2 gap-4 pt-6">
            <div className="rounded-3xl bg-primary/5 border border-primary/10 p-6">
              <Globe className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold">{t("Community Forum", "Communauté")}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{t("Ask questions and share tips with other users.", "Posez des questions et partagez des astuces.")}</p>
              <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold uppercase tracking-widest">{t("Join Forum", "Rejoindre")}</Button>
            </div>
            <div className="rounded-3xl bg-secondary/10 border border-border p-6">
              <Clock className="w-6 h-6 text-secondary-foreground mb-4" />
              <h3 className="font-bold">{t("Email Support", "Email")}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{t("Average response time: 2 hours.", "Délai de réponse moyen : 2 heures.")}</p>
              <Button variant="link" className="p-0 h-auto text-secondary-foreground text-xs font-bold uppercase tracking-widest">support@pin-point-zeta.vercel.app</Button>
            </div>
          </div>
        </div>

        {/* Live Chat Component */}
        <aside className="lg:sticky lg:top-8">
          <div className="rounded-3xl border border-border bg-card shadow-elegant flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full" />
                </div>
                <div>
                  <p className="font-bold text-sm">PinPoint Support</p>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest">{t("Online Now", "En ligne")}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    m.sender === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted border border-border/50 rounded-tl-none"
                  }`}>
                    {m.text}
                    <p className={`text-[9px] mt-1 opacity-60 text-right`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
              <Input 
                placeholder={t("Type your message...", "Écrivez votre message...")} 
                className="rounded-xl h-11"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-pin shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
