// Grouping of the 127 STEP instances into presentable components.
// Rule fields: product (STEP name), zMin/zMax filter on mesh centroid Z (mm, rotor axis).
// spin: part of the rotating assembly. dir: explode direction in STEP coords (x,y,z), unit-ish.
export const GROUPS = [
  { id: 'shaft',    label: 'Main shaft',        spin: true,  match: n => n === 'Fillet17',
    dir: [0, 0, 1.0],  kind: 'rotor' },
  { id: 'blades-a', label: 'Rotor stage A',     spin: true,  match: (n, c) => n === 'Save Bodies1[48]' && c[2] > 0,
    dir: [0, 0, 0.9],  kind: 'rotor' },
  { id: 'blades-b', label: 'Rotor stage B',     spin: true,  match: (n, c) => n === 'Save Bodies1[48]' && c[2] < 0,
    dir: [0, 0, 0.35], kind: 'rotor' },
  { id: 'blades-c', label: 'Rotor stage C',     spin: true,  match: n => n === 'Save Bodies1[119]',
    dir: [0, 0, -0.7], kind: 'rotor' },
  { id: 'vanes-a',  label: 'Stator vanes A',    spin: false, match: (n, c) => n === 'Save Bodies1[65]' && c[2] > 0,
    dir: [0, 0, 1.25], kind: 'stator' },
  { id: 'vanes-b',  label: 'Stator vanes B',    spin: false, match: (n, c) => n === 'Save Bodies1[65]' && c[2] < 0,
    dir: [0, 0, 0.1],  kind: 'stator' },
  { id: 'rings',    label: 'Stator rings',      spin: false, match: n => n === 'Save Bodies5[4]' || n === 'Save Bodies5[2]',
    dir: [0, 0, 0.65], kind: 'stator' },
  { id: 'hubs',     label: 'Rotor hubs',        spin: true,  match: n => ['Save Bodies1[51]', 'Save Bodies1[67]', 'Save Bodies1[70]', 'Save Bodies1[102]', 'Save Bodies5[1]', 'Save Bodies1[75]'].includes(n),
    dir: [0, 0, 0.55], kind: 'rotor' },
  { id: 'gears',    label: 'Gear train',        spin: false, match: n => ['Cut-Extrude20[2]', 'Save Bodies1[92]', 'Save Bodies1[105]', 'Save Bodies1[82]', 'Save Bodies1[111]'].includes(n),
    dir: [0.9, -0.9, -0.1], kind: 'drive' },
  { id: 'casing',   label: 'Outer casing',      spin: false, match: n => n === 'Cut-Extrude26' || n === 'Split3[3]',
    dir: [0.6, 0.5, 0.25], kind: 'static' },
  { id: 'mounts',   label: 'Pedestal mounts',   spin: false, match: n => n === 'Save Bodies1[31]' || n === 'Save Bodies3[2]',
    dir: [0, -1.0, 0], kind: 'static' },
]
