import { useEffect } from 'react';
import Lenis from 'lenis';

import LandingNavbar    from '../components/landing/LandingNavbar';
import Hero             from '../components/landing/Hero';
import TechStack        from '../components/landing/TechStack';
import Features         from '../components/landing/Features';
import HowItWorks       from '../components/landing/HowItWorks';
import AISection        from '../components/landing/AISection';
import SecuritySection  from '../components/landing/SecuritySection';
import FAQ              from '../components/landing/FAQ';
import FinalCTA         from '../components/landing/FinalCTA';
import LandingFooter    from '../components/landing/LandingFooter';

export default function LandingPage() {
  // Initialize Lenis smooth scrolling
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-snap-bg text-white">
      <LandingNavbar />
      <main>
        <Hero />
        <TechStack />
        <Features />
        <HowItWorks />
        <AISection />
        <SecuritySection />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
