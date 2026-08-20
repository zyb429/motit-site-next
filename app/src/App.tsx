import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDimensionWarp } from './hooks/useDimensionWarp';
import { Headphones } from 'lucide-react';

import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Directions from './sections/Directions';
import CallToAction from './sections/CallToAction';
import About from './sections/About';
import WhyChooseUs from './sections/WhyChooseUs';
import Advantages from './sections/Advantages';
import KeyServices from './sections/KeyServices';
import Partners from './sections/Partners';
import FAQ from './sections/FAQ';
import Contact from './sections/Contact';
import QualityManagement from './sections/QualityManagement';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  useDimensionWarp(canvasContainerRef);

  useEffect(() => {
    // Sync ScrollTrigger on scroll
    const onScroll = () => ScrollTrigger.update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={canvasContainerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <a
        href="https://help.motit.by"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-[1001] flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm transition-all duration-150 hover:scale-105"
        style={{
          right: '20px',
          bottom: '20px',
          backgroundColor: '#2dd4bf',
          color: '#0a1920',
          boxShadow: '0 4px 20px rgba(45, 212, 191, 0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#14b8a6';
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(45, 212, 191, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2dd4bf';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 212, 191, 0.4)';
        }}
      >
        <Headphones size={18} />
        <span className="hidden sm:inline">Техподдержка</span>
      </a>

      <div className="relative z-[1]">
        <Navigation />
        <Hero />
        <Directions />
        <CallToAction />
        <About />
        <div
          className="relative h-[40vh] md:h-[50vh] bg-fixed bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/about-image.jpg)' }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10, 25, 32, 0.65)' }} />
        </div>
        <WhyChooseUs />
        <Advantages />
        <KeyServices />
        <Partners />
        <FAQ />
        <Contact />
        <QualityManagement />
        <Footer />
      </div>
    </div>
  );
}
