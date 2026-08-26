import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import Navigation from '@/components/sections/Navigation';
import About from '@/components/sections/About';
import Advantages from '@/components/sections/Advantages';
import QualityManagement from '@/components/sections/QualityManagement';
import Footer from '@/components/sections/Footer';

const Hero = dynamic(() => import('@/components/sections/Hero'), {
  ssr: true,
  loading: () => <div className="min-h-[60vh]" />,
});

const Directions = dynamic(() => import('@/components/sections/Directions'), {
  ssr: true,
});

const CallToAction = dynamic(() => import('@/components/sections/CallToAction'), {
  ssr: true,
});

const WhyChooseUs = dynamic(() => import('@/components/sections/WhyChooseUs'), {
  ssr: true,
});

const KeyServices = dynamic(() => import('@/components/sections/KeyServices'), {
  ssr: true,
});

const Partners = dynamic(() => import('@/components/sections/Partners'), {
  ssr: true,
});

const FAQ = dynamic(() => import('@/components/sections/FAQ'), {
  ssr: true,
});

const Contact = dynamic(() => import('@/components/sections/Contact'), {
  ssr: true,
});

export const metadata: Metadata = {
  title: 'МОТИТ — IT-решения для бизнеса',
  description: 'Комплексные IT-услуги: аудит, мониторинг, безопасность',
};

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
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
      </main>
      <Footer />
    </>
  );
}