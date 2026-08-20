'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;

#define PI 3.14159265359
#define TAU 6.28318530718

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float val = 0.0;
  float amp = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    val += amp * noise(p);
    p = rot * p * 2.0 + shift;
    amp *= 0.5;
  }
  return val;
}

vec3 stars(vec2 uv, float t) {
  vec3 col = vec3(0.0);
  for (int layer = 0; layer < 3; layer++) {
    float scale = 6.0 + float(layer) * 4.0;
    vec2 p = uv * scale;
    float speed = 0.02 + float(layer) * 0.01;
    p.y += t * speed;
    vec2 id = floor(p);
    vec2 f = fract(p) - 0.5;
    float rnd = hash(id + float(layer) * 100.0);
    if (rnd > 0.98) {
      float starSeed = hash1(id.x + id.y * 57.0 + float(layer) * 200.0);
      float twinkle = sin(t * 2.0 + starSeed * 10.0) * 0.2 + sin(t * 3.0 + starSeed * 20.0) * 0.1;
      float brightness = 0.4 + 0.4 * sin(rnd * TAU + t * 1.5 + twinkle);
      float d = length(f);
      float core = smoothstep(0.015, 0.0, d) * brightness;
      float glow = smoothstep(0.06, 0.015, d) * brightness * 0.2;
      vec3 starColor = mix(vec3(0.6, 0.85, 0.9), vec3(0.7, 0.95, 1.0), rnd);
      col += starColor * (core + glow) * (0.8 + float(layer) * 0.3);
    }
  }
  return col;
}

vec3 nebula(vec2 uv, float t) {
  vec3 col = vec3(0.0);
  float n1 = fbm(uv * 1.5 + vec2(t * 0.01, t * 0.005), 4);
  float n2 = fbm(uv * 2.0 - vec2(t * 0.008, t * 0.012), 4);
  float density = n1 * n2;
  vec3 nebColor1 = vec3(0.02, 0.08, 0.08);
  vec3 nebColor2 = vec3(0.01, 0.06, 0.07);
  col += mix(nebColor1, nebColor2, n2) * density * 0.3;
  float brightPatch = smoothstep(0.5, 0.85, density);
  col += vec3(0.03, 0.12, 0.12) * brightPatch * 0.15;
  return col;
}

vec3 floatingParticles(vec2 uv, float t) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float x = sin(fi * 1.3 + t * 0.15) * 0.6;
    float y = cos(fi * 0.9 + t * 0.12 + fi) * 0.4;
    vec2 center = vec2(x, y);
    float d = length(uv - center);
    float particle = smoothstep(0.03, 0.0, d);
    vec3 pColor = mix(vec3(0.1, 0.5, 0.5), vec3(0.2, 0.65, 0.7), sin(fi + t) * 0.5 + 0.5);
    col += pColor * particle * 0.4;
  }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y);
  float t = uTime;

  // Deep forest green base
  vec3 col = vec3(0.01, 0.04, 0.05);

  // Add soft stars
  col += stars(uv, t) * 0.6;

  // Add nebula
  col += nebula(uv, t);

  // Add floating green particles
  col += floatingParticles(uv, t);

  // Gentle radial glow
  float r = length(uv);
  float centerGlow = exp(-r * r * 3.0) * 0.08;
  col += vec3(0.06, 0.3, 0.35) * centerGlow;

  // Vignette
  float vignette = 1.0 - smoothstep(0.4, 1.3, r);
  col *= mix(0.8, 1.0, vignette);

  // Tone mapping
  col = col / (1.0 + col * 0.3);
  col = pow(col, vec3(0.95));

  gl_FragColor = vec4(col, 1.0);
}
`;

export function useDimensionWarp(containerRef: React.RefObject<HTMLDivElement | null>) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const currentSpeedRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    rendererRef.current = renderer;

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(w * dpr, h * dpr) },
      uSpeed: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (document.visibilityState === 'hidden') return;

      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed * 0.3;

      const scrollPos = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      const targetSpeed = scrollPos * 1.5;
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * 0.03;
      uniforms.uSpeed.value = currentSpeedRef.current;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      renderer.setSize(nw, nh);
      uniforms.uResolution.value.set(nw * dpr, nh * dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);
}
