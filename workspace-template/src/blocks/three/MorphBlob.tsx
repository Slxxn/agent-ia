import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

function Blob({ color = '#6366f1', color2 = '#38bdf8' }: { color?: string; color2?: string }) {
  const meshRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.18;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.22;
    }
  });
  return (
    <Sphere ref={meshRef} args={[1.6, 128, 128]}>
      <MeshDistortMaterial
        color={color}
        distort={0.45}
        speed={1.8}
        roughness={0.1}
        metalness={0.3}
      />
    </Sphere>
  );
}

export interface MorphBlobProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  blobColor?: string;
  blobColor2?: string;
  stats?: { value: string; label: string }[];
}

export default function MorphBlob({ badge, headline, headlineAccent, sub, cta, ctaSecondary, blobColor = '#6366f1', blobColor2 = '#38bdf8', stats }: MorphBlobProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)', overflow: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}>
            {badge && <motion.div variants={fadeUp} style={{ marginBottom: 20 }}><span className="section-label">{badge}</span></motion.div>}
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}>
              {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
            </motion.h2>
            {sub && <motion.p variants={fadeUp} style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: 36 }}>{sub}</motion.p>}
            {(cta || ctaSecondary) && (
              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {cta && <a href={cta.href} className="btn-primary">{cta.label}</a>}
                {ctaSecondary && <a href={ctaSecondary.href} className="btn-secondary">{ctaSecondary.label}</a>}
              </motion.div>
            )}
            {stats && stats.length > 0 && (
              <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEWPORT}
                style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
                {stats.map((s, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <div className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
            style={{ height: 420, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, filter: 'blur(40px)', background: `radial-gradient(circle, ${blobColor}30 0%, transparent 70%)`, zIndex: 0 }} />
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }} style={{ position: 'relative', zIndex: 1 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[4, 4, 4]} intensity={2} color={blobColor} />
              <pointLight position={[-4, -2, -2]} intensity={1} color={blobColor2} />
              <Blob color={blobColor} color2={blobColor2} />
            </Canvas>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
