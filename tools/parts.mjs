// Grouping of the 127 STEP instances into presentable components.
// Rule fields: product (STEP name), zMin/zMax filter on mesh centroid Z (mm, rotor axis).
// spin: part of the rotating assembly. dir: explode direction in STEP coords (x,y,z), unit-ish.
// axis (default z) and ratio (default 1): a spinning part turns about `axis` at ratio x the shaft angle.
// pivot: 'center' turns it about its own bounding-box centre, otherwise about the origin.
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
  // Gear train: one STEP instance per gear. Each turns about its own axis through its own centre (pivot: 'center').
  // ratio: speed relative to the main shaft. Meshing gears turn opposite ways, and speed scales inversely with
  // pitch radius (from the STEP bounding boxes): on-shaft 27 mm, idler 37 mm, pinion 12 mm, bevel pinion 18 mm, bevel gear 30 mm.
  // The bevel gear is not a clean disc, so its axis is unreliable: it stays still (spin: false).
  { id: 'gear-shaft',        label: 'Gear on shaft',  spin: true, match: n => n === 'Cut-Extrude20[2]',
    dir: [0.9, -0.9, -0.1], kind: 'drive', axis: [0, 0, 1], pivot: 'center', ratio: 1 },
  { id: 'gear-idler',        label: 'Idler gear',     spin: true, match: n => n === 'Save Bodies1[92]',
    dir: [0.9, -0.9, -0.1], kind: 'drive', axis: [0, 0, 1], pivot: 'center', ratio: -0.73 },
  { id: 'gear-pinion',       label: 'Small pinion',   spin: true, match: n => n === 'Save Bodies1[105]',
    dir: [0.9, -0.9, -0.1], kind: 'drive', axis: [0, 0, 1], pivot: 'center', ratio: 2.25 },
  { id: 'gear-bevel-pinion', label: 'Bevel pinion',   spin: true, match: n => n === 'Save Bodies1[82]',
    dir: [0.9, -0.9, -0.1], kind: 'drive', axis: [1, 0, 0], pivot: 'center', ratio: 1.47 },
  { id: 'gear-bevel',        label: 'Bevel gear',     spin: false, match: n => n === 'Save Bodies1[111]',
    dir: [0.9, -0.9, -0.1], kind: 'drive', axis: [0, 0, 1], pivot: 'center', ratio: -0.9 },
  { id: 'casing',   label: 'Outer casing',      spin: false, match: n => n === 'Cut-Extrude26' || n === 'Split3[3]',
    dir: [0.6, 0.5, 0.25], kind: 'static' },
  { id: 'mounts',   label: 'Pedestal mounts',   spin: false, match: n => n === 'Save Bodies1[31]' || n === 'Save Bodies3[2]',
    dir: [0, -1.0, 0], kind: 'static' },
]
