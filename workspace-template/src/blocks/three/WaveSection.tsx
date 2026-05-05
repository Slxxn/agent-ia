import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';
import * as THREE from 'three';

function WaveMesh({ color = '#6366f1' }: { color?: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(12, 6, 80, 40), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.8 + t * 1.2) * 0.18 + Math.sin(y * 1.2 + t * 0.8) * 0.12);
    }
    pos.needsUpdate = true;
    if (mesh.current) mesh.current.rotation.x = -0.55;
  });

  return (
    <mesh ref={mesh} geometry={geo} position={[0, -1.2, 0]}>
      <meshStandardMaterial color={color} wireframe opacity={0.18} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

export interface WaveSectionProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  waveColor?: string;
  features?: { icon: string; title: string; description: string }[];
}

export default function WaveSection({ badge, headline, headlineAccent, sub, cta, ctaSecondary, waveColor = '#6366f1', features }: WaveSectionProps) {
  return (
    <section style={{ position: 'relative', padding: '100px 0', background: 'var(--bg)', overflow: 'hidden', minHeight: '60vh' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }} style={{ background: 'transparent' }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <WaveMesh color={waveColor} />
        </Canvas>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 20 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36 }}>{sub}</motion.p>}
          {(cta || ctaSecondary) && (
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {cta && <a href={cta.href} className="btn-primary">{cta.label}</a>}
              {ctaSecondary && <a href={ctaSecondary.href} className="btn-secondary">{ctaSecondary.label}</a>}
            </motion.div>
          )}
        </motion.div>

        {features && features.length > 0 && (
          <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEWPORT}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6" style={{ marginTop: 72 }}>
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
