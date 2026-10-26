'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type AboutProps = {
  label: string;
  title: string;
  text1: string;
  text2: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string | null;
};

export default function About({ label, title, text1, text2, buttonLabel, buttonHref, imageUrl }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof document !== 'undefined' && document.querySelector('.Puck')) return;

    const ctx = gsap.context(() => {
      gsap.from('.about-image', { opacity: 0, scale: 1.02, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 85%' } });
      gsap.from('.about-label', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 85%' } });
      gsap.from('.about-title', { opacity: 0, y: 40, duration: 0.8, delay: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 85%' } });
      gsap.from('.about-text p', { opacity: 0, y: 40, duration: 0.8, stagger: 0.15, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 85%' } });
      gsap.from('.about-cta', { opacity: 0, y: 40, duration: 0.8, delay: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 85%' } });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container section-padding">
        {imageUrl && (
          <div className="about-image mb-10 md:mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="w-full object-cover rounded-2xl" style={{ height: '360px' }} loading="lazy" />
          </div>
        )}
        <div className="about-text max-w-200">
          <span className="about-label section-label block mb-3">{label}</span>
          <h2 className="about-title section-title mb-5">{title}</h2>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: 'rgba(128, 222, 234, 0.75)' }}>{text1}</p>
          {text2 && <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'rgba(128, 222, 234, 0.75)' }}>{text2}</p>}
          {buttonLabel && <a href={buttonHref} className="about-cta btn-secondary inline-flex">{buttonLabel}</a>}
        </div>
      </div>
    </section>
  );
}