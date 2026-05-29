import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Problem, HowItWorks, SavedLinks, WhyDifferent, Pricing, FinalCTA, Footer } from "@/components/site/Sections";

const LandingPage = () => {

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

export default LandingPage;
