import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Directions from './sections/Directions';
import CallToAction from './sections/CallToAction';
import About from './sections/About';
import Contact from './sections/Contact';
import WhyChooseUs from './sections/WhyChooseUs';
import Advantages from './sections/Advantages';
import KeyServices from './sections/KeyServices';
import Partners from './sections/Partners';
import FAQ from './sections/FAQ';
import QualityManagement from './sections/QualityManagement';
import Footer from './sections/Footer';

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