import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PainPoints } from "./components/PainPoints";
import { Services } from "./components/Services";
import { Showcase } from "./components/Showcase";
import { HowItWorks } from "./components/HowItWorks";
import { StackAccordion } from "./components/StackAccordion";
import { SocialProof } from "./components/SocialProof";
import { BookingSection } from "./components/BookingSection";
import { WhatsAppChallenges } from "./components/WhatsAppChallenges";
import { FAQ } from "./components/FAQ";
import { Scarcity } from "./components/Scarcity";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <BookingSection />
        <Showcase />
        <PainPoints />
        <Services />
        <WhatsAppChallenges />
        <HowItWorks />
        <StackAccordion />
        <SocialProof />
        <FAQ />
        <Scarcity />
      </main>
      <Footer />
    </div>
  );
}