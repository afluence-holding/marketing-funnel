'use client';

import { Header } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/Header';
import { Hero } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/Hero';
import { PainPoints } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/PainPoints';
import { Services } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/Services';
import { Showcase } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/Showcase';
import { HowItWorks } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/HowItWorks';
import { StackAccordion } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/StackAccordion';
import { SocialProof } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/SocialProof';
import { WhatsAppChallenges } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/WhatsAppChallenges';
import { FAQ } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/FAQ';
import { Scarcity } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/Scarcity';
import { Footer } from '../../../../../../../../docs/Landing page para Afluence/src/app/components/Footer';
import { BookingSection } from '@/components/ai-factory-creators/booking-section';

interface LandingAppProps {
  calendlyUrl: string;
  debugBooking: boolean;
}

export function LandingApp({ calendlyUrl, debugBooking }: LandingAppProps) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <BookingSection calendlyUrl={calendlyUrl} debugBooking={debugBooking} />
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
