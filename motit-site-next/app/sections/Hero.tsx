import HeroClient from './HeroClient';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Клиентский компонент с GSAP-анимациями */}
      <HeroClient />
    </section>
  );
}