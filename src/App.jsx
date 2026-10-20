import { useState, useEffect } from 'react';
import { RELEASE, loadRelease } from './release.js';
import { Nav, Footer, NotFound } from './components/Layout.jsx';
import { Hero } from './components/Hero.jsx';
import { HowItWorks, SecurityAndPrivacy, InstallGuide, SpecsSection, FaqSection } from './components/Sections.jsx';

export default function App() {
  const [hash, setHash] = useState(location.hash);

  useEffect(() => {
    loadRelease();
    const handleHash = () => setHash(location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    document.title = `${RELEASE.name} — Clean up WhatsApp media with a swipe`;
  }, []);

  const validHashes = [
    '',
    '#',
    '#top',
    '#how-it-works',
    '#security',
    '#install',
    '#specs',
    '#faq',
  ];

  if (!validHashes.includes(hash)) {
    return (
      <div className="editorial-app">
        <Nav />
        <NotFound />
        <Footer />
      </div>
    );
  }

  return (
    <div className="editorial-app">
      <Nav />

      <main id="main">
        {/* Minimalist Hero with Review Card */}
        <Hero />

        {/* 3-Step Protocol */}
        <HowItWorks />

        {/* Security & Offline Architecture */}
        <SecurityAndPrivacy />

        {/* Simple Android Install Walkthrough */}
        <InstallGuide />

        {/* Technical Specs & Verification */}
        <SpecsSection />

        {/* Questions & Answers */}
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
