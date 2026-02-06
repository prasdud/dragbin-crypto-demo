"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateProtein, TORUS_R, type Atom } from "@/lib/protein-generator";

// ── Cyberpunk atom palette ──────────────────────────────────────────
// Each element mapped to the design system's neon palette
const ELEMENT_MATERIALS: Record<
  Atom["element"],
  { color: string; emissive: string; emissiveIntensity: number }
> = {
  C: { color: "#00ff88", emissive: "#00ff88", emissiveIntensity: 0.15 },
  N: { color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.2 },
  O: { color: "#ff00ff", emissive: "#ff00ff", emissiveIntensity: 0.2 },
  S: { color: "#ffcc00", emissive: "#ffcc00", emissiveIntensity: 0.25 },
  H: { color: "#aabbee", emissive: "#8899dd", emissiveIntensity: 0.1 },
};

// ── Organic noise for subtle per-atom vibration ─────────────────────
function organicNoise(
  x: number,
  y: number,
  z: number,
  t: number
): [number, number, number] {
  const a = 0.025;
  return [
    Math.sin(x * 1.7 + t * 0.3) * Math.cos(z * 0.9 + t * 0.25) * a,
    Math.sin(y * 1.3 + t * 0.35) * Math.cos(x * 1.1 + t * 0.2) * a,
    Math.sin(z * 1.5 + t * 0.28) * Math.cos(y * 0.8 + t * 0.32) * a,
  ];
}

// ── Rodrigues' rotation: rotate v around axis k by angle a ──────────
function rotateAroundAxis(
  vx: number,
  vy: number,
  vz: number,
  kx: number,
  ky: number,
  kz: number,
  angle: number
): [number, number, number] {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  // k × v
  const cx = ky * vz - kz * vy;
  const cy = kz * vx - kx * vz;
  const cz = kx * vy - ky * vx;
  // k · v
  const dot = kx * vx + ky * vy + kz * vz;

  return [
    vx * cosA + cx * sinA + kx * dot * (1 - cosA),
    vy * cosA + cy * sinA + ky * dot * (1 - cosA),
    vz * cosA + cz * sinA + kz * dot * (1 - cosA),
  ];
}

// ── Per-element instanced mesh ──────────────────────────────────────
// Separate InstancedMesh per element allows unique material + emissive
function ElementCloud({
  atoms,
  element,
}: {
  atoms: Atom[];
  element: Atom["element"];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mat = ELEMENT_MATERIALS[element];

  const originalPositions = useMemo(
    () => atoms.map((a) => [...a.position] as [number, number, number]),
    [atoms]
  );

  // Set initial transforms
  useEffect(() => {
    if (!meshRef.current || atoms.length === 0) return;
    atoms.forEach((atom, i) => {
      dummy.position.set(...atom.position);
      dummy.scale.setScalar(atom.radius);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [atoms, dummy]);

  useFrame(({ clock }) => {
    if (!meshRef.current || atoms.length === 0) return;
    const t = clock.getElapsedTime();

    // Strand revolution speed (radians/sec)
    const revAngle = t * 0.12;

    // Breathing: subtle scale pulse
    const breath = 1 + Math.sin(t * 0.4) * 0.02;

    for (let i = 0; i < atoms.length; i++) {
      const [ox, oy, oz] = originalPositions[i];

      // ── Strand revolution ──
      // Find this atom's angle on the torus centerline
      const theta = Math.atan2(oz, ox);

      // Centerline point
      const clx = TORUS_R * Math.cos(theta);
      const clz = TORUS_R * Math.sin(theta);

      // Offset from centerline
      const dx = ox - clx;
      const dy = oy;
      const dz = oz - clz;

      // Rotation axis: centerline tangent at this theta
      const kx = -Math.sin(theta);
      const kz = Math.cos(theta);

      // Rotate offset around tangent
      const [rx, ry, rz] = rotateAroundAxis(dx, dy, dz, kx, 0, kz, revAngle);

      // Recombine
      let px = (clx + rx) * breath;
      let py = ry * breath;
      let pz = (clz + rz) * breath;

      // ── Organic vibration ──
      const [nx, ny, nz] = organicNoise(ox, oy, oz, t);
      px += nx;
      py += ny;
      pz += nz;

      dummy.position.set(px, py, pz);
      dummy.scale.setScalar(atoms[i].radius);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (atoms.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, atoms.length]}>
      <sphereGeometry args={[1, 28, 20]} />
      <meshStandardMaterial
        color={mat.color}
        emissive={mat.emissive}
        emissiveIntensity={mat.emissiveIntensity}
        roughness={0.35}
        metalness={0.08}
      />
    </instancedMesh>
  );
}

// ── Scene containing the full protein ───────────────────────────────
function ProteinScene() {
  const protein = useMemo(() => generateProtein(100, 42), []);

  // Group atoms by element
  const grouped = useMemo(() => {
    const map: Record<Atom["element"], Atom[]> = {
      C: [],
      N: [],
      O: [],
      S: [],
      H: [],
    };
    for (const atom of protein.atoms) {
      map[atom.element].push(atom);
    }
    return map;
  }, [protein]);

  const groupRef = useRef<THREE.Group>(null);

  // Slow global tumble
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.04;
    groupRef.current.rotation.x = Math.sin(t * 0.02) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {(Object.keys(grouped) as Atom["element"][]).map((el) => (
        <ElementCloud key={el} atoms={grouped[el]} element={el} />
      ))}
    </group>
  );
}

// ── Exported canvas component ───────────────────────────────────────
export function MolecularModel() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 5, 14], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient fill — enough so nothing goes pitch black */}
        <ambientLight intensity={0.6} color="#e8e0f0" />

        {/* Key: warm neon green from top-right */}
        <directionalLight position={[8, 10, 6]} intensity={3} color="#88ffbb" />

        {/* Fill: magenta from lower-left */}
        <directionalLight position={[-6, -4, -8]} intensity={1.8} color="#dd77ff" />

        {/* Rim: cyan from behind for edge highlights */}
        <directionalLight position={[0, 3, -10]} intensity={1.5} color="#55ddff" />

        {/* Inner glow so the torus interior isn't a black hole */}
        <pointLight position={[0, 0, 0]} intensity={1.2} color="#ffffff" distance={15} />

        <ProteinScene />

        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate={false}
          minDistance={8}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}
