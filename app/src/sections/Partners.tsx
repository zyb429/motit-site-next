import { useRef, useState, useEffect, useCallback } from 'react';
import { useReveal } from '../hooks/useReveal';

interface Partner {
  name: string;
  logo: string;
  website: string;
}

const partners: Partner[] = [
  { name: 'Axoft', logo: '/images/partners/partner_1.png', website: 'https://axoftglobal.ru/ru-by/' },
  { name: 'Rusiem', logo: '/images/partners/partner_2.png', website: 'https://rusiem.com/' },
  { name: 'Life', logo: '/images/partners/partner_3.png', website: 'https://life.by/business/it-solutions' },
  { name: 'Kaspersky', logo: '/images/partners/partner_4.png', website: 'https://www.kaspersky.ru/' },
  { name: 'Tenit', logo: '/images/partners/partner_5.png', website: 'https://tenit.by/' },
  { name: 'Qtech', logo: '/images/partners/partner_6.png', website: 'https://www.qtech.ru/' },
  { name: 'Wi-Tek', logo: '/images/partners/partner_7.png', website: 'https://wireless-tek.ru/' },
  { name: 'Киберпротект', logo: '/images/partners/partner_8.png', website: 'https://cyberprotect.ru/' },
  { name: 'СерверКом', logo: '/images/partners/partner_9.png', website: 'https://xn--b1afbuklkce.com/' },
  { name: 'hoster.by', logo: '/images/partners/partner_10.png', website: 'https://hoster.by/' },
  { name: 'ЭйСиТехникс', logo: '/images/partners/partner_11.png', website: 'https://actech.by/' },
  { name: 'Librasoft', logo: '/images/partners/partner_12.png', website: 'https://librasoft.by/' },
  { name: 'F6', logo: '/images/partners/partner_13.png', website: 'https://www.f6.ru/' },
  { name: 'IT Distribution', logo: '/images/partners/partner_14.png', website: 'https://it-d.by/' },
  { name: 'Ассистент', logo: '/images/partners/partner_15.png', website: 'https://xn--80akicokc0aablc.xn--p1ai/' },
  { name: 'Mont', logo: '/images/partners/partner_16.png', website: 'https://mont.by/ru-by' },
  { name: 'Belsiem', logo: '/images/partners/partner_17.png', website: 'https://belsiem.com/' },
];

const doubled = [...partners, ...partners];

export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  useReveal(sectionRef);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || isDragging) return;
    let animId: number;
    let pos = track.scrollLeft || 0;
    const speed = 0.4;
    const animate = () => {
      if (!isDragging) {
        pos += speed;
        const maxScroll = track.scrollWidth / 2;
        if (pos >= maxScroll) pos = 0;
        track.scrollLeft = pos;
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !trackRef.current) return;
    const x = e.touches[0].pageX - (trackRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  return (
    <section ref={sectionRef} className="section-padding overflow-hidden" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="reveal text-center mb-10 md:mb-14">
          <span className="section-label block mb-3">НАМ ДОВЕРЯЮТ</span>
          <h2 className="section-title mb-4">Наши партнеры</h2>
          <p className="section-subtitle max-w-[600px] mx-auto">Сотрудничаем с ведущими технологическими компаниями</p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 md:gap-5 overflow-x-hidden cursor-grab active:cursor-grabbing select-none px-5 md:px-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ scrollbarWidth: 'none' }}
      >
        {doubled.map((partner, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <a
              key={index}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 group relative overflow-hidden transition-all duration-150"
              style={{
                width: 'clamp(150px, 18vw, 210px)',
                backgroundColor: isHovered ? '#153541' : '#0f2832',
                border: `1px solid ${isHovered ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.08)'}`,
                borderRadius: '20px',
                transform: isHovered ? 'translateY(-4px) scale(1.03)' : 'translateY(0)',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => isDragging && e.preventDefault()}
              draggable={false}
            >
              <div className="flex flex-col items-center justify-center p-4">
                <div
                  className="w-full aspect-[3/2] rounded-xl flex items-center justify-center mb-2 p-2 overflow-hidden relative"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="relative z-[1] w-full h-full object-contain"
                    style={{ opacity: 0.95 }}
                    loading="lazy"
                    draggable={false}
                  />
                  <div
                    className="absolute inset-0 z-[2] rounded-xl pointer-events-none"
                    style={{
                      backgroundColor: 'rgba(45, 212, 191, 0.4)',
                      mixBlendMode: 'multiply',
                      opacity: isHovered ? 0 : 1,
                      transition: 'opacity 0.15s ease-out',
                    }}
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-center whitespace-nowrap" style={{ color: '#e0f7fa' }}>
                  {partner.name}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="reveal text-center mt-10 md:mt-12">
        <p className="text-sm mb-3" style={{ color: 'rgba(128, 222, 234, 0.5)' }}>Хотите стать нашим партнером?</p>
        <a href="#contact" className="btn-ghost text-xs">Свяжитесь с нами</a>
      </div>
    </section>
  );
}
