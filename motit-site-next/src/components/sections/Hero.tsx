import HeroClient from './HeroClient';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Фоновые блики на всю ширину */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="hero-bg-sparkle-1 absolute top-1/4 left-1/4 w-3 h-3 bg-[#2dd4bf] rounded-full opacity-30 blur-[1.5px]" />
        <div className="hero-bg-sparkle-2 absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-[#4dd0e1] rounded-full opacity-40 blur-[1px]" />
        <div className="hero-bg-sparkle-3 absolute bottom-1/3 left-1/3 w-4 h-4 bg-[#2dd4bf] rounded-full opacity-25 blur-[2px]" />
        <div className="hero-bg-sparkle-4 absolute top-1/2 right-1/3 w-2 h-2 bg-[#80deea] rounded-full opacity-35 blur-[1px]" />
        <div className="hero-bg-sparkle-5 absolute bottom-1/4 left-1/5 w-2 h-2 bg-[#2dd4bf] rounded-full opacity-30 blur-[1px]" />
        <div className="hero-bg-sparkle-6 absolute top-2/3 right-1/5 w-2.5 h-2.5 bg-[#4dd0e1] rounded-full opacity-25 blur-[1.5px]" />
      </div>

      {/* Контент поверх фона */}
      <HeroClient />
    </section>
  );
}