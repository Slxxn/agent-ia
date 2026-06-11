"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, PresentationControls, Float, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, N8AO, Bloom } from "@react-three/postprocessing";
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

// Textures procédurales (bump) : grain + flecks, brossé, perforations
function makeBumpTexture(kind: 0 | 1 | 2): CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, size, size);
  if (kind === 0) {
    // grain fin + flecks brillants (paillettes qui accrochent la lumière)
    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.random() * 20;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = "#e8e8e8";
    for (let n = 0; n < 350; n++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
  } else if (kind === 1) {
    for (let y = 0; y < size; y++) {
      const v = 116 + Math.random() * 24;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, size, 1);
    }
  } else {
    // perforations en quinconce (grille type haut-parleur, comme Resend)
    ctx.fillStyle = "#9a9a9a";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#2e2e2e";
    const step = 18;
    let row = 0;
    for (let y = step / 2; y < size; y += step, row++) {
      const offset = row % 2 ? step / 2 : 0;
      for (let x = step / 2; x < size + step; x += step) {
        ctx.beginPath();
        ctx.arc(x + offset, y, 4.6, 0, Math.PI * 2);
        ctx.fill();
      }
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
  const wait = useRef(2.2);

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
          // uniquement les couches externes — les tranches du milieu cassent la silhouette
          layer: Math.random() < 0.5 ? -1 : 1,
          dir: Math.random() < 0.5 ? 1 : -1,
          t: 0,
          dur: 1.6,
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
      wait.current = 1.8 + Math.random() * 2.4;
    }
  });

  const textures = useMemo(
    () => [makeBumpTexture(0), makeBumpTexture(1), makeBumpTexture(2)],
    []
  );

  return (
    <group ref={cube} rotation={[0, 0, 0.1]}>
      {/* noyau arrondi : mécanisme interne discret, jamais une face plate visible */}
      <RoundedBox args={[2.78, 2.78, 2.78]} radius={0.32} smoothness={8}>
        <meshStandardMaterial color="#030305" roughness={0.85} metalness={0} envMapIntensity={0.25} />
      </RoundedBox>
      {POSITIONS.map((p, i) => {
        const h = hash(i);
        // majorité lisse brillant, quelques brossés, quelques perforés (comme Resend)
        const kind = h < 0.5 ? 0 : h < 0.78 ? 1 : 2;
        return (
          <group key={i} ref={el => { cubies.current[i] = el; }} position={p}>
            <RoundedBox args={[0.96, 0.96, 0.96]} radius={0.05} smoothness={4}>
              {kind === 0 ? (
                <meshPhysicalMaterial
                  color="#060608" metalness={0.05}
                  roughness={0.3 + h * 0.1}
                  clearcoat={1} clearcoatRoughness={0.16}
                  envMapIntensity={1.1}
                  bumpMap={textures[0]} bumpScale={0.25}
                />
              ) : kind === 1 ? (
                <meshPhysicalMaterial
                  color="#08080a" metalness={0.4}
                  roughness={0.45}
                  clearcoat={0.4} clearcoatRoughness={0.3}
                  envMapIntensity={0.9}
                  bumpMap={textures[1]} bumpScale={0.4}
                />
              ) : (
                <meshPhysicalMaterial
                  color="#060608" metalness={0.1}
                  roughness={0.6}
                  clearcoat={0.2} clearcoatRoughness={0.35}
                  envMapIntensity={0.8}
                  bumpMap={textures[2]} bumpScale={0.9}
                />
              )}
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
      <ambientLight intensity={0.06} />
      <PresentationControls
        global
        cursor
        speed={1.5}
        rotation={[0.45, -0.7, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        config={{ mass: 1, tension: 170, friction: 26 }}
      >
        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
          <Cubies />
        </Float>
      </PresentationControls>
      {/* studio virtuel : softboxes — donne les longs dégradés doux sur les faces noires */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3.5} position={[0, 6, 1]} rotation-x={-Math.PI / 2} scale={[9, 9, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[7, 1, -2]} rotation-y={-Math.PI / 2} scale={[7, 2.5, 1]} color="#eef" />
        <Lightformer form="rect" intensity={1.1} position={[-7, -1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#6366f1" />
        <Lightformer form="rect" intensity={0.5} position={[0, 0, 7]} scale={[5, 5, 1]} />
      </Environment>
      {/* AO dans les rainures + lueur subtile des hautes lumières */}
      <EffectComposer multisampling={4}>
        <N8AO aoRadius={0.5} intensity={4} distanceFalloff={1} quality="medium" />
        <Bloom mipmapBlur intensity={0.3} luminanceThreshold={0.5} radius={0.6} />
      </EffectComposer>
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
          camera={{ position: [0, 0, 10.2], fov: 30 }}
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
