"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, PresentationControls, Float, Environment } from "@react-three/drei";
import { Vector3, Quaternion, CanvasTexture, RepeatWrapping } from "three";
import type { Group } from "three";

const POSITIONS: [number, number, number][] = [];
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++) POSITIONS.push([x, y, z]);

// variation de surface par cubie pour un rendu moins uniforme
const hash = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

// Textures procédurales (bump) : grain fin, métal brossé, moletage diamant
function makeBumpTexture(kind: 0 | 1 | 2): CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, size, size);
  if (kind === 0) {
    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 116 + Math.random() * 24;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
  } else if (kind === 1) {
    for (let y = 0; y < size; y++) {
      const v = 118 + Math.random() * 18;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, size, 1);
    }
  } else {
    ctx.strokeStyle = "#a8a8a8";
    ctx.lineWidth = 2;
    for (let i = -size; i < size * 2; i += 11) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + size, 0); ctx.lineTo(i, size); ctx.stroke();
    }
  }
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type SliceMove = {
  axis: Vector3;
  axisIdx: number;
  layer: number;
  dir: number;
  t: number;
  dur: number;
  prevEased: number;
};

function Cubies() {
  const cube = useRef<Group>(null);
  const cubies = useRef<(Group | null)[]>([]);
  const move = useRef<SliceMove | null>(null);
  const wait = useRef(1.2);

  useFrame((_, delta) => {
    if (cube.current) cube.current.rotation.y += delta * 0.12;

    // tranche au repos : on attend avant le prochain mouvement
    if (!move.current) {
      wait.current -= delta;
      if (wait.current <= 0) {
        const axisIdx = Math.floor(Math.random() * 3);
        const axis = new Vector3();
        axis.setComponent(axisIdx, 1);
        move.current = {
          axis,
          axisIdx,
          layer: [-1, 0, 1][Math.floor(Math.random() * 3)],
          dir: Math.random() < 0.5 ? 1 : -1,
          t: 0,
          dur: 1.1,
          prevEased: 0,
        };
      }
      return;
    }

    // rotation de la tranche active, par incréments easés (total exact : 90°)
    const m = move.current;
    m.t = Math.min(m.t + delta / m.dur, 1);
    const eased = easeInOutCubic(m.t);
    const dAngle = (eased - m.prevEased) * (Math.PI / 2) * m.dir;
    m.prevEased = eased;
    const q = new Quaternion().setFromAxisAngle(m.axis, dAngle);
    for (const c of cubies.current) {
      if (!c) continue;
      if (Math.abs(c.position.getComponent(m.axisIdx) - m.layer) < 0.4) {
        c.position.applyQuaternion(q);
        c.quaternion.premultiply(q);
      }
    }

    if (m.t >= 1) {
      for (const c of cubies.current) {
        if (!c) continue;
        c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
      }
      move.current = null;
      wait.current = 0.8 + Math.random() * 2;
    }
  });

  const textures = useMemo(
    () => [makeBumpTexture(0), makeBumpTexture(1), makeBumpTexture(2)],
    []
  );

  return (
    <group ref={cube}>
      {POSITIONS.map((p, i) => {
        const h = hash(i);
        // majorité grain fin, quelques brossés, quelques moletés (comme Resend)
        const kind = h < 0.55 ? 0 : h < 0.8 ? 1 : 2;
        return (
          <group key={i} ref={el => { cubies.current[i] = el; }} position={p}>
            <RoundedBox args={[0.97, 0.97, 0.97]} radius={0.06} smoothness={8}>
              <meshPhysicalMaterial
                color="#0a0a0e"
                roughness={0.3 + h * 0.18}
                metalness={0.88}
                clearcoat={kind === 0 ? 0.8 : 0.25}
                clearcoatRoughness={0.2 + h * 0.1}
                envMapIntensity={0.75}
                bumpMap={textures[kind]}
                bumpScale={kind === 0 ? 0.12 : kind === 1 ? 0.18 : 0.45}
              />
            </RoundedBox>
          </group>
        );
      })}
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* éclairage low-key : fond sombre, fortes hautes lumières */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 10, 4]} intensity={2.4} />
      <directionalLight position={[-8, 2, -6]} intensity={0.9} color="#b9bdfa" />
      <directionalLight position={[-6, -4, 5]} intensity={0.45} color="#6366f1" />
      <PresentationControls
        global
        cursor
        speed={1.5}
        rotation={[0.5, -0.65, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        config={{ mass: 1, tension: 170, friction: 26 }}
      >
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
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
          camera={{ position: [0, 0, 10.8], fov: 30 }}
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
