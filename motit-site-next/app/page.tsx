import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <Hero />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}