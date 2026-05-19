---
name: threejs-r3f
description: React Three Fiber patterns for 3D WebGL sites — Canvas setup, animation, performance, fallbacks.
type: reference
---

# React Three Fiber — Production Rules

## Required packages
```json
{
  "three": "^0.169.0",
  "@react-three/fiber": "^8.17.10",
  "@react-three/drei": "^9.114.0"
}
```

## Canvas setup (mandatory structure)
```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Preload } from '@react-three/drei';
import { Suspense } from 'react';

export function Scene3DSection() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="city" />
          {/* 3D objects here */}
          <Preload all />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
```

## Continuous animation with useFrame
```tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

function FloatingMesh() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}
```

## Geometries to use (never CapsuleGeometry — Three.js r142+ only)
- ✅ `TorusKnotGeometry`, `IcosahedronGeometry`, `OctahedronGeometry`
- ✅ `SphereGeometry`, `BoxGeometry`, `CylinderGeometry`
- ❌ `CapsuleGeometry` — not available before r142

## WebGL fallback (mandatory)
```tsx
const hasWebGL = (() => {
  try { return !!document.createElement('canvas').getContext('webgl'); }
  catch { return false; }
})();

export function SceneWithFallback() {
  if (!hasWebGL) return <div className="fallback-bg" />;
  return <Scene3DSection />;
}
```

## Performance rules
- `dpr={[1, 2]}` — caps pixel ratio on high-DPI screens.
- `useMemo` for heavy geometries: `const geo = useMemo(() => new IcosahedronGeometry(2, 4), [])`.
- Max ~50k polygons total in the scene.
- No `window.addEventListener` inside R3F — use `useFrame` or `useThree`.
- Never use THREE.OrbitControls directly — always `@react-three/drei`'s `OrbitControls`.

## Anti-patterns
- NEVER `new THREE.WebGLRenderer()` manually — Canvas does this.
- NEVER put Canvas inside a `position: fixed` parent — breaks on iOS Safari.
- NEVER animate layout props (`width`, `height`) — only `position`, `rotation`, `scale` in 3D space.
- NEVER forget `Suspense` around async resources (gltf loaders, textures).
