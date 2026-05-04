/**
 * Scene3D — Interactive 3D feature showcase section.
 * Rotating geometric objects with labels and descriptions.
 */
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface Scene3DFeature {
  icon: string;
  title: string;
  description: string;
}

export interface Scene3DProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  features: Scene3DFeature[];
  accentColor?: string;
}

function RotatingObject({ color, shape, position }: { color: string; shape: 'box' | 'sphere' | 'torus' | 'octahedron'; position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    mesh.current.rotation.x = clock.getElapsedTime() * 0.4;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.6;
  });

  const geo = {
    box:        <boxGeometry args={[1, 1, 1]} />,
    sphere:     <sphereGeometry args={[0.7, 32, 32]} />,
    torus:      <torusGeometry args={[0.6, 0.22, 16, 60]} />,
    octahedron: <octahedronGeometry args={[0.8]} />,
  }[shape];

  return (
    <Float speed={1.2} floatIntensity={0.5} rotationIntensity={0.3}>
      <mesh ref={mesh} position={position}>
        {geo}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.2}
          wireframe={shape === 'octahedron'}
        />
      </mesh>
    </Float>
  );
}

const SHAPES: Array<'box' | 'sphere' | 'torus' | 'octahedron'> = ['torus', 'octahedron', 'box', 'sphere'];

export default function Scene3D({ badge, headline, headlineAccent, sub, features, accentColor = '#6366f1' }: Scene3DProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)', overflow: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 14 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7 }}
            style={{ height: 420, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--bd)', background: 'var(--surface2)', position: 'relative' }}
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 5, 5]} color={accentColor} intensity={1.2} />
              <pointLight position={[-5, -3, -5]} color="#38bdf8" intensity={0.6} />
              {features.slice(0, 4).map((_, i) => (
                <RotatingObject
                  key={i}
                  color={accentColor}
                  shape={SHAPES[i % 4]}
                  position={[
                    (i % 2 === 0 ? -1.6 : 1.6),
                    (i < 2 ? 1.4 : -1.4),
                    0,
                  ]}
                />
              ))}
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            {/* Glow overlay */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
          </motion.div>

          {/* Feature list */}
          <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{ display: 'flex', gap: 16, padding: '20px 22px', background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', transition: 'border-color 0.2s' }}
                whileHover={{ borderColor: `${accentColor}44` } as any}
              >
                <div style={{ width: 42, height: 42, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
