import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Problem, HowItWorks, SavedLinks, WhyDifferent, Pricing, FinalCTA, Footer } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PinPoint — A simple address for everyone in Cameroon" },
      { name: "description", content: "Turn your phone into a precise, shareable digital address. Drop a pin, share a link, get deliveries to your exact door — no street names needed." },
      { property: "og:title", content: "PinPoint — A simple address for everyone in Cameroon" },
      { property: "og:description", content: "Drop a pin, share a link. Deliveries arrive exactly where you are." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <SavedLinks />
        <WhyDifferent />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
