import { useState } from "react";
import { Info, MapPin, Link2, MessageCircle, Share2, ChevronDown, Search, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const steps = [
    { title: t("help.s1.t"), desc: t("help.s1.d"), icon: MapPin, color: "bg-blue-500" },
    { title: t("help.s2.t"), desc: t("help.s2.d"), icon: Sparkles, color: "bg-amber-500" },
    { title: t("help.s3.t"), desc: t("help.s3.d"), icon: Link2, color: "bg-green-500" },
    { title: t("help.s4.t"), desc: t("help.s4.d"), icon: Share2, color: "bg-primary" },
  ];

  const faqs = [
    { 
      q: t("How does the anonymous link work?"), 
      a: t("Anonymous links are valid for only 24 hours. They hide your personal details like name and profile photo, only showing the map location and any specific notes you added.") 
    },
    { 
      q: t("Can I use PinPoint for my business?"), 
      a: t("Yes! You can create a Business address, set a custom public alias, and generate a QR code for your customers to scan. This is available on Pro and Business plans.") 
    },
    { 
      q: t("What happens when a link expires?"), 
      a: t("Once a link expires (like an anonymous link after 24h), it will no longer show the address details to anyone clicking it. You can always generate a new link from your dashboard.") 
    },
    { 
      q: t("Is PinPoint free?"), 
      a: t("PinPoint has a Free plan that allows for 1 personal address and 10 anonymous links per month. For more addresses, custom aliases, and advanced features, you can upgrade to Plus, Pro, or Business.") 
    },
    { 
      q: t("How accurate is the location?"), 
      a: t("PinPoint uses high-precision GPS coordinates. When you drop a pin, it marks the exact latitude and longitude of your door, ensuring riders don't have to search for house numbers.") 
    },
  ].filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold">{t("help.title")}</h1>
            <p className="text-muted-foreground">{t("help.sub")}</p>
          </div>
        </div>
      </header>

      {/* Step by Step Guide */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          {t("help.guide.title")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-elegant transition-all">
              <div className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Info className="w-6 h-6 text-primary" />
            {t("help.faq.title")}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t("Search questions...")} 
              className="pl-9 h-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border shadow-sm">
          {faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-none px-6">
                  <AccordionTrigger className="hover:no-underline py-4 text-left font-medium">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="p-12 text-center text-muted-foreground italic">
              {t("No matching questions found.")}
            </div>
          )}
        </div>
      </section>

      {/* Still need help? */}
      <section className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 text-center">
        <h2 className="text-xl font-bold mb-2">{t("Still have questions?")}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {t("Our team is available 24/7 to help you with any technical or billing inquiries.")}
        </p>
        <Button asChild className="rounded-full px-8 shadow-pin h-11">
          <a href="/app/support">{t("Contact Live Support")}</a>
        </Button>
      </section>
    </div>
  );
}
