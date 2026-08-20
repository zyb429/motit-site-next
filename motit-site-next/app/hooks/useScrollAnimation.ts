'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  y?: number;
  x?: number;
  opacity?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  start?: string;
}

export function useScrollAnimation(
  selector: string,
  options: ScrollAnimationOptions = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(selector);
    if (elements.length === 0) return;

    const {
      y = 40,
      x = 0,
      opacity = 0,
      scale,
      duration = 0.8,
      delay = 0,
      stagger = 0.12,
      ease = 'power3.out',
      start = 'top 85%',
    } = options;

    const fromVars: gsap.TweenVars = {
      y,
      x,
      opacity,
      duration,
      delay,
      ease,
      stagger: elements.length > 1 ? stagger : 0,
      scrollTrigger: {
        trigger: container,
        start,
        toggleActions: 'play none none none',
      },
    };

    if (scale !== undefined) {
      fromVars.scale = scale;
    }

    const ctx = gsap.context(() => {
      gsap.from(elements, fromVars);
    }, container);

    return () => ctx.revert();
  }, [selector, options]);

  return containerRef;
}

export function useParallax(speed: number = 0.5) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.to(element, {
        y: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return elementRef;
}
