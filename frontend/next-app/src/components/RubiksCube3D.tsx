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

// Textures bump 512px, une par face (repeat 1) : chaque face lit comme une
// plaque sertie (cadre sombre en pourtour) — le détail signature de Resend.
function makeBumpTexture(kind: 0 | 1 | 2): CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, size, size);

  if (kind === 0) {
    // lisse : grain très fin + flecks qui scintillent sous la lumière
    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 122 + Math.random() * 12;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = "#ececec";
    for (let n = 0; n < 700; n++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
  } else if (kind === 1) {
    // métal brossé
    for (let y = 0; y < size; y++) {
      const v = 116 + Math.random() * 24;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, size, 1);
    }
  } else {
    // perforations en quinconce (grille type haut-parleur)
    ctx.fillStyle = "#969696";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#262626";
    const step = 21;
    let row = 0;
    for (let y = step; y < size - step / 2; y += step, row++) {
      const offset = row % 2 ? step / 2 : 0;
      for (let x = step; x < size - step / 2 + (offset ? step / 2 : 0); x += step) {
        ctx.beginPath();
        ctx.arc(x + offset, y, 4.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // cadre incrusté en pourtour de face
  ctx.strokeStyle = "#5c5c5c";
  ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, size - 20, size - 20);

  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

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
  // plusieurs tranches parallèles peuvent tourner en même temps (jamais d'axes croisés : clipping)
  const moves = useRef<SliceMove[]>([]);
  const wait = useRef(1.6);

  useFrame((state, delta) => {
    // le cube entier tourne sur lui-même sur plusieurs axes (tumbling)
    if (cube.current) {
      const t = state.clock.elapsedTime;
      cube.current.rotation.y += delta * 0.16;
      cube.current.rotation.x += delta * 0.07;
      cube.current.rotation.z = 0.1 + Math.sin(t * 0.2) * 0.15;
    }

    if (moves.current.length === 0) {
      wait.current -= delta;
      if (wait.current <= 0) {
        const axisIdx = Math.floor(Math.random() * 3);
        const axis = new Vector3();
        axis.setComponent(axisIdx, 1);
        // 45% du temps : les deux couches externes tournent ensemble (sens indépendants)
        const layers = Math.random() < 0.45 ? [-1, 1] : [Math.random() < 0.5 ? -1 : 1];
        moves.current = layers.map((layer, k) => ({
          axis,
          axisIdx,
          layer,
          dir: Math.random() < 0.5 ? 1 : -1,
          t: 0,
          dur: 0.85 + Math.random() * 0.3 + k * 0.12,
          prevEased: 0,
        }));
      }
      return;
    }

    for (const m of moves.current) {
      if (m.t >= 1) continue;
      m.t = Math.min(m.t + delta / m.dur, 1);
      const eased = easeInOutQuart(m.t);
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
    }

    if (moves.current.every(m => m.t >= 1)) {
      for (const c of cubies.current) {
        if (!c) continue;
        c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
      }
      moves.current = [];
      // parfois enchaîne immédiatement le mouvement suivant
      wait.current = Math.random() < 0.25 ? 0.2 : 0.9 + Math.random() * 1.6;
    }
  });

  const textures = useMemo(
    () => [makeBumpTexture(0), makeBumpTexture(1), makeBumpTexture(2)],
    []
  );

  return (
    <group ref={cube} rotation={[0, 0, 0.1]}>
      {POSITIONS.map((p, i) => {
        const h = hash(i);
        // perforé dominant comme Resend, puis lisse brillant, puis brossé
        const kind = h < 0.4 ? 0 : h < 0.6 ? 1 : 2;
        return (
          <group key={i} ref={el => { cubies.current[i] = el; }} position={p}>
            <RoundedBox args={[0.985, 0.985, 0.985]} radius={0.05} smoothness={4}>
              {kind === 0 ? (
                <meshPhysicalMaterial
                  color="#060608" metalness={0.05}
                  roughness={0.26 + h * 0.1}
                  clearcoat={1} clearcoatRoughness={0.12}
                  envMapIntensity={1.2}
                  bumpMap={textures[0]} bumpScale={0.3}
                />
              ) : kind === 1 ? (
                <meshPhysicalMaterial
                  color="#08080a" metalness={0.45}
                  roughness={0.5}
                  clearcoat={0.4} clearcoatRoughness={0.3}
                  envMapIntensity={0.95}
                  bumpMap={textures[1]} bumpScale={0.45}
                  roughnessMap={textures[1]}
                />
              ) : (
                <meshPhysicalMaterial
                  color="#060608" metalness={0.3}
                  roughness={0.62}
                  clearcoat={0.25} clearcoatRoughness={0.3}
                  envMapIntensity={0.9}
                  bumpMap={textures[2]} bumpScale={1.1}
                  roughnessMap={textures[2]}
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
        <Lightformer form="rect" intensity={0.6} position={[-7, -1, 2]} rotation-y={Math.PI / 2} scale={[5, 1.8, 1]} color="#6366f1" />
        <Lightformer form="rect" intensity={0.5} position={[0, 0, 7]} scale={[5, 5, 1]} />
      </Environment>
      {/* AO dans les rainures + lueur subtile des hautes lumières */}
      <EffectComposer multisampling={4}>
        <N8AO aoRadius={0.45} intensity={4.5} distanceFalloff={1} quality="medium" />
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

function CssCubeFallback() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", perspective: 1100 }}>
      <style>{`@keyframes cubeSpin{0%{transform:rotateX(-28deg) rotateY(0deg)}100%{transform:rotateX(-28deg) rotateY(360deg)}}`}</style>
      <div style={{ width: CUBE, height: CUBE, position: "relative", transformStyle: "preserve-3d", animation: "cubeSpin 30s linear infinite" }}>
        {CUBE_FACES.map((face, f) => (
          <div key={f} style={{ position: "absolute", inset: 0, transform: face.transform, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, background: "#04040a", borderRadius: 14, padding: 7 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{
                borderRadius: 10,
                background: "linear-gradient(145deg, #24242f 0%, #0b0b13 65%)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }} />
            ))}
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
          camera={{ position: [0, 0, 9.8], fov: 30 }}
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
