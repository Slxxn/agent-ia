/**
 * Hero3D — Hero with animated particle field via Three.js canvas.
 * Deps: @react-three/fiber @react-three/drei three
 */
import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { fadeUp, stagger } from '@/lib/motion';

export interface Hero3DProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string; };
  ctaSecondary?: { label: string; href: string; };
  particleColor?: string;
  particleCount?: number;
}

function ParticleField({ color = '#6366f1', count = 1200 }: { color?: string; count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.04;
      mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function FloatingOrb({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh position={position}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.15} wireframe />
      </mesh>
    </Float>
  );
}

export default function Hero3D({
  badge, headline, headlineAccent, sub, cta, ctaSecondary,
  particleColor = '#6366f1', particleCount = 1200,
}: Hero3DProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Three.js canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ background: 'transparent' }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color={particleColor} />
          <Stars radius={40} depth={20} count={500} factor={2} fade speed={0.6} />
          <ParticleField color={particleColor} count={particleCount} />
          <FloatingOrb position={[-3.5, 1.5, -2]} color={particleColor} />
          <FloatingOrb position={[3.5, -1.5, -3]} color="#38bdf8" />
          <FloatingOrb position={[0, 2.5, -4]} color="#818cf8" />
        </Canvas>
      </div>

      {/* Radial overlay to focus on text */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 20%, rgba(15,15,18,0.7) 100%)', pointerEvents: 'none' }} />

      {/* Content */}
      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760, margin: '0 auto', padding: '80px 24px 40px' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
            <span className="section-label">{badge}</span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: 22,
            textShadow: `0 0 60px ${particleColor}40`,
          }}
        >
          {headline}
          {headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 38px' }}
        >
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px', boxShadow: `0 8px 32px ${particleColor}40` }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 15, fontWeight: 500, padding: '13px 28px', borderRadius: 'var(--radius)',
              border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)',
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
              transition: 'all 0.18s',
            }}>
              {ctaSecondary.label}
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, var(--bg), transparent)', pointerEvents: 'none' }} />
    </section>
  );
}
