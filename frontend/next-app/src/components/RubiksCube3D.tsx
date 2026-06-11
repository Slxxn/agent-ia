"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, PresentationControls, Float, Environment } from "@react-three/drei";
import type { Group } from "three";

// Cubies accent indigo (clin d'œil au logo pixel builderz)
const ACCENTS = new Set(["0,0,1", "1,1,0", "-1,0,-1"]);

const POSITIONS: [number, number, number][] = [];
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++) POSITIONS.push([x, y, z]);

function Cubies() {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.2;
  });
  return (
    <group ref={group}>
      {POSITIONS.map(([x, y, z]) => {
        const accent = ACCENTS.has(`${x},${y},${z}`);
        return (
          <RoundedBox key={`${x},${y},${z}`} args={[0.94, 0.94, 0.94]} radius={0.1} smoothness={8} position={[x, y, z]}>
            {accent ? (
              <meshPhysicalMaterial
                color="#5b5ef0" emissive="#4338ca" emissiveIntensity={0.35}
                roughness={0.22} metalness={0.5} clearcoat={1} clearcoatRoughness={0.12}
                envMapIntensity={1.4}
              />
            ) : (
              <meshPhysicalMaterial
                color="#0d0d14" roughness={0.32} metalness={0.92}
                clearcoat={0.9} clearcoatRoughness={0.22}
                envMapIntensity={1.15}
              />
            )}
          </RoundedBox>
        );
      })}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 7, 6]} intensity={1.3} />
      <directionalLight position={[-5, -3, 4]} intensity={0.5} color="#6366f1" />
      <PresentationControls
        global
        cursor
        speed={1.5}
        rotation={[0.45, -0.55, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        config={{ mass: 1, tension: 170, friction: 26 }}
      >
        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.7}>
          <Cubies />
        </Float>
      </PresentationControls>
      {/* Reflets studio — si le HDR ne charge pas, les lumières directes suffisent */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

// Fallback CSS 3D si WebGL est indisponible
const CUBE = 250;
const CUBE_FACES = [
  { transform: `translateZ(${CUBE / 2}px)`, shade: "rgba(255,255,255,0.03)" },
  { transform: `rotateY(180deg) translateZ(${CUBE / 2}px)`, shade: "rgba(0,0,0,0.55)" },
  { transform: `rotateY(90deg) translateZ(${CUBE / 2}px)`, shade: "rgba(0,0,0,0.28)" },
  { transform: `rotateY(-90deg) translateZ(${CUBE / 2}px)`, shade: "rgba(0,0,0,0.28)" },
  { transform: `rotateX(90deg) translateZ(${CUBE / 2}px)`, shade: "rgba(255,255,255,0.08)" },
  { transform: `rotateX(-90deg) translateZ(${CUBE / 2}px)`, shade: "rgba(0,0,0,0.65)" },
];
const CUBE_ACCENTS: Record<number, number[]> = { 0: [4], 2: [2], 4: [6] };

function CssCubeFallback() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", perspective: 1100 }}>
      <style>{`@keyframes cubeSpin{0%{transform:rotateX(-28deg) rotateY(0deg)}100%{transform:rotateX(-28deg) rotateY(360deg)}}`}</style>
      <div style={{ width: CUBE, height: CUBE, position: "relative", transformStyle: "preserve-3d", animation: "cubeSpin 30s linear infinite" }}>
        {CUBE_FACES.map((face, f) => (
          <div key={f} style={{ position: "absolute", inset: 0, transform: face.transform, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, background: "#04040a", borderRadius: 14, padding: 7 }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const accent = CUBE_ACCENTS[f]?.includes(i);
              return (
                <div key={i} style={{
                  borderRadius: 10,
                  background: accent
                    ? "linear-gradient(145deg, #818cf8 0%, #4f46e5 70%)"
                    : "linear-gradient(145deg, #24242f 0%, #0b0b13 65%)",
                  border: accent ? "1px solid rgba(165,180,252,0.55)" : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: accent
                    ? "0 0 26px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.35)"
                    : "inset 0 1px 0 rgba(255,255,255,0.06)",
                }} />
              );
            })}
            <div style={{ position: "absolute", inset: 0, background: face.shade, borderRadius: 14, pointerEvents: "none" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function RubiksCube3D() {
  const [webgl] = useState(hasWebGL);
  return (
    <div style={{ width: "100%", height: "100%", animation: "fadeIn 0.8s ease both", touchAction: "pan-y" }}>
      {webgl ? (
        <Canvas
          camera={{ position: [0, 0, 8.5], fov: 30 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      ) : (
        <CssCubeFallback />
      )}
    </div>
  );
}
