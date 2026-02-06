export interface Atom {
  position: [number, number, number];
  element: "C" | "N" | "O" | "S" | "H";
  radius: number;
}

export interface ProteinData {
  atoms: Atom[];
  residueCount: number;
}

// Van der Waals-like radii (tuned for visual density)
const RADII: Record<string, number> = {
  C: 0.62,
  N: 0.58,
  O: 0.55,
  S: 0.70,
  H: 0.42,
};

// Major torus radius — exported so animation code can reference it
export const TORUS_R = 4.5;

// Seeded PRNG
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeAtom(
  pos: [number, number, number],
  element: Atom["element"]
): Atom {
  return {
    position: [pos[0], pos[1], pos[2]],
    element,
    radius: RADII[element],
  };
}

/**
 * Generates a protein structure shaped as a toroidal helix.
 * The backbone spirals around the tube of a torus, with atoms densely
 * packed to create that characteristic CPK space-filling look.
 */
export function generateProtein(
  residueCount: number = 100,
  seed: number = 42
): ProteinData {
  const rand = seededRandom(seed);
  const atoms: Atom[] = [];

  const R = TORUS_R;
  const r = 1.8;
  const helixTurns = 8;

  for (let i = 0; i < residueCount; i++) {
    const t = i / residueCount;
    const theta = t * Math.PI * 2;
    const phi = t * helixTurns * Math.PI * 2;

    // Torus surface point
    const cx = (R + r * Math.cos(phi)) * Math.cos(theta);
    const cy = r * Math.sin(phi);
    const cz = (R + r * Math.cos(phi)) * Math.sin(theta);

    // Local coordinate frame on the torus surface
    const nx = Math.cos(phi) * Math.cos(theta);
    const ny = Math.sin(phi);
    const nz = Math.cos(phi) * Math.sin(theta);

    const tx = -Math.sin(phi) * Math.cos(theta);
    const ty = Math.cos(phi);
    const tz = -Math.sin(phi) * Math.sin(theta);

    const bx = -Math.sin(theta);
    const by = 0;
    const bz = Math.cos(theta);

    const place = (
      along: number,
      up: number,
      side: number,
      el: Atom["element"]
    ) => {
      atoms.push(
        makeAtom(
          [
            cx + along * nx + up * tx + side * bx,
            cy + along * ny + up * ty + side * by,
            cz + along * nz + up * tz + side * bz,
          ],
          el
        )
      );
    };

    // Backbone
    place(0, 0, 0, "C");
    place(0.15, 0.35, 0.1, "N");
    place(-0.2, -0.1, 0.35, "O");
    place(0.1, -0.3, -0.15, "C");

    // Side chain outward
    const sideLen = 1 + Math.floor(rand() * 3);
    for (let j = 0; j < sideLen; j++) {
      const out = 0.5 + j * 0.42 + (rand() - 0.5) * 0.2;
      const d1 = (rand() - 0.5) * 0.5;
      const d2 = (rand() - 0.5) * 0.5;
      place(out, d1, d2, "C");

      if (rand() < 0.7) {
        place(
          out + (rand() - 0.5) * 0.3,
          d1 + (rand() - 0.5) * 0.35,
          d2 + (rand() - 0.5) * 0.35,
          "H"
        );
      }
      if (rand() < 0.5) {
        place(
          out + (rand() - 0.5) * 0.3,
          d1 + (rand() - 0.5) * 0.35,
          d2 + (rand() - 0.5) * 0.35,
          "H"
        );
      }
    }

    // Inward atoms for density
    if (rand() < 0.6) {
      const inw = -0.3 - rand() * 0.6;
      const d1 = (rand() - 0.5) * 0.4;
      const d2 = (rand() - 0.5) * 0.4;
      place(inw, d1, d2, rand() < 0.5 ? "C" : "N");
    }

    // Rare sulfur
    if (rand() < 0.04) {
      place(0.6 + rand() * 0.3, (rand() - 0.5) * 0.4, (rand() - 0.5) * 0.4, "S");
    }

    // Backbone hydrogens
    place(0.25, 0.2, -0.3, "H");
    if (rand() < 0.4) {
      place(-0.15, 0.3, 0.25, "H");
    }
  }

  // Center at origin
  const avgX = atoms.reduce((s, a) => s + a.position[0], 0) / atoms.length;
  const avgY = atoms.reduce((s, a) => s + a.position[1], 0) / atoms.length;
  const avgZ = atoms.reduce((s, a) => s + a.position[2], 0) / atoms.length;

  for (const atom of atoms) {
    atom.position[0] -= avgX;
    atom.position[1] -= avgY;
    atom.position[2] -= avgZ;
  }

  return { atoms, residueCount };
}
