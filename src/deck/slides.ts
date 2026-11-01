// Slide content + the 3D scene state for each slide. Shared by all 10 demo designs.
// Camera: az/el in degrees around the model centre. az 0 = side view (axis left-right), az 90 = looking down the axis.
export interface Cam { az: number; el: number; dist: number; ty?: number }
export interface SceneState {
  cam: Cam
  explode: number            // 0 assembled … 1 fully exploded
  focus: string[]            // part ids lit up; everything else ghosts
  spin: number               // rotor speed, rad/s
  flow: boolean              // illustrative airflow streaks
  callouts: 'none' | 'focus' | 'all'
  labels?: string[]          // limit callouts to these parts (keeps crowded views readable)
  orbit: boolean             // idle auto-orbit
}
export interface Slide {
  id: string
  kind: 'title' | 'text' | 'part' | 'end'
  title: string
  lead?: string
  byline?: string
  points?: { h: string; t: string }[]
  facts?: [string, string][]
  notes: string
  scene: SceneState
}

const base = { explode: 0, focus: [] as string[], spin: 1.6, flow: false, callouts: 'none' as const, orbit: true }
const GEARS = ['gear-shaft', 'gear-idler', 'gear-pinion', 'gear-bevel-pinion', 'gear-bevel']

export const SLIDES: Slide[] = [
  {
    id: 'title', kind: 'title',
    title: 'Wind turbine',
    lead: 'Machine Components & Mechanisms: a case study',
    byline: 'BAU University',
    notes: 'Open on the model. It assembles itself on load; let it finish, then say what we are about to do: use a wind turbine as a real example of the course topics.',
    scene: { ...base, cam: { az: 38, el: 18, dist: 1.3 }, spin: 1.2 },
  },
  {
    id: 'purpose', kind: 'text',
    title: 'A wind turbine in brief',
    lead: 'A wind turbine takes energy from moving air and turns it into shaft rotation that a machine can use.',
    points: [
      { h: 'Rotor blades', t: 'catch the air and spin.' },
      { h: 'Stator vanes', t: 'hold still and straighten the flow.' },
      { h: 'Shaft and gears', t: 'carry the rotation to the output.' },
    ],
    notes: 'Keep this under a minute. The turbine is only the example; from here on we look at each part as a machine component or a mechanism from the course.',
    scene: { ...base, cam: { az: 28, el: 14, dist: 1.0 }, spin: 2.4, flow: true },
  },
  {
    id: 'explode', kind: 'text',
    title: 'The model, pulled apart',
    lead: 'Drag to orbit, scroll to zoom, hover the parts list to find a part.',
    notes: 'Let the audience look for a moment. Use the explode slider at the bottom. Ask: which of these parts only transmit motion, and which ones are fixed?',
    scene: { ...base, cam: { az: 24, el: 16, dist: 1.75 }, explode: 1, spin: 0.8, callouts: 'all', labels: ['blades-c', 'casing', 'shaft', 'vanes-a', 'mounts'] },
  },
  {
    id: 'mechanism', kind: 'text',
    title: 'Machine or mechanism?',
    lead: 'The course separates the two. A machine alters, transmits or directs forces. A mechanism is the part that moves the power from the source to the output.',
    points: [
      { h: 'Machine', t: 'the whole turbine: it takes energy from the wind and delivers shaft power.' },
      { h: 'Mechanism', t: 'the shaft and gear train: they move the rotation from the rotor to the output.' },
    ],
    notes: 'Use the chainsaw example from the course: the saw is the machine, the chain drive is the mechanism. Here the same split holds for the turbine.',
    scene: { ...base, cam: { az: 120, el: 20, dist: 1.4 }, focus: ['shaft', ...GEARS], spin: 1.6, callouts: 'focus', orbit: false },
  },
  {
    id: 'kinematics', kind: 'text',
    title: 'Kinematics: how fast each point moves',
    lead: 'Kinematics describes motion (position, velocity, acceleration) before we look at the forces behind it.',
    points: [
      { h: 'Linear velocity', t: 'v = r ω. A point farther from the axis moves faster, so a blade tip is quicker than the hub.' },
      { h: 'Units', t: 'ω must be in radians per second when you use v = r ω.' },
    ],
    notes: 'Ask the audience which is faster, a point at the hub or a point at the tip, before showing the formula. Both share the same ω.',
    scene: { ...base, cam: { az: 62, el: 12, dist: 0.95 }, focus: ['blades-a', 'blades-b', 'blades-c'], spin: 3.2, callouts: 'focus', orbit: false },
  },
  {
    id: 'mobility', kind: 'text',
    title: 'Mobility: how many inputs does it need?',
    lead: 'The Kutzbach criterion counts the degrees of freedom of a planar mechanism: F = 3(n − 1) − 2jp − jh.',
    points: [
      { h: 'Gear pair', t: 'frame plus two gears gives n = 3, two pin joints and one gear mesh: F = 3(2) − 4 − 1 = 1.' },
      { h: 'Meaning', t: 'F = 1 means one input, here the rotor shaft, sets the position of the whole pair.' },
    ],
    notes: 'The gear mesh counts as a higher-order joint (jh = 1). Write the count on the board before the answer.',
    scene: { ...base, cam: { az: 150, el: 22, dist: 0.9 }, focus: GEARS, spin: 1.8, callouts: 'focus', orbit: false },
  },
  {
    id: 'gears', kind: 'text',
    title: 'Gears: speed ratio and direction',
    lead: 'Teeth pass the torque between two shafts. The tooth counts set how fast the output turns.',
    points: [
      { h: 'Speed ratio', t: 'ω_out / ω_in = N_driver / N_driven. A 24-tooth gear driving a 48-tooth gear halves the speed and doubles the torque, ignoring losses.' },
      { h: 'Direction', t: 'two external gears in mesh turn in opposite directions.' },
    ],
    notes: 'Do not quote a ratio until you have counted the teeth on the actual model. Ask the audience which gear is the driver.',
    scene: { ...base, cam: { az: 150, el: 22, dist: 0.9 }, focus: GEARS, spin: 1.8, callouts: 'focus', orbit: false },
  },
  {
    id: 'gear-design', kind: 'text',
    title: 'Designing a gear pair',
    lead: 'Mating gears must share the same pressure angle and diametral pitch, or the teeth will not mesh smoothly.',
    points: [
      { h: 'Standard pressure angles', t: '14.5°, 20° or 25°.' },
      { h: 'Centre distance', t: 'for external gears, c = r1 + r2, the sum of the two pitch radii.' },
    ],
    notes: 'Use the course example: two external 4-pitch gears with 14 and 42 teeth. Work out the centre distance on the board.',
    scene: { ...base, cam: { az: 96, el: 18, dist: 0.9 }, focus: ['gear-shaft', 'gear-pinion'], spin: 1.2, callouts: 'focus', orbit: false },
  },
  {
    id: 'shaft', kind: 'text',
    title: 'The shaft: moments and equilibrium',
    lead: 'The rotor produces a moment about the shaft axis. Static force analysis finds the forces the shaft and its bearings must carry.',
    points: [
      { h: 'Moment', t: 'M = F × d, where d is the perpendicular distance from the line of the force to the reference point.' },
      { h: 'Equilibrium', t: 'with small accelerations (under 0.25 g), ΣF = 0 and ΣM = 0 about any point.' },
      { h: 'Support', t: 'bearings hold the shaft in line; keys lock the gears to it.' },
    ],
    notes: 'Draw the free-body diagram first: isolate the shaft, replace each bearing with its reaction force, and show the torque coming in from the rotor.',
    scene: { ...base, cam: { az: 10, el: 8, dist: 1.0 }, focus: ['shaft', 'hubs'], spin: 2.0, callouts: 'focus', orbit: false },
  },
  {
    id: 'transmission', kind: 'text',
    title: 'Other ways to carry power',
    lead: 'When the shafts are far apart, a gear pair is not the only choice. Belts and chains carry the rotation over a distance.',
    points: [
      { h: 'Belts', t: 'v = r ω sets the belt speed; the ideal range is 1,000 to 6,500 ft/min. Belts can slip.' },
      { h: 'Chains', t: 'ideal speed below 2,500 ft/min; the lubrication method depends on the speed.' },
      { h: 'Gears', t: 'exact ratio from the tooth counts and no slip, but they need precise shaft alignment.' },
    ],
    notes: 'Compare the three in one table on the board: ratio accuracy, speed range, and what each one needs.',
    scene: { ...base, cam: { az: 120, el: 20, dist: 1.5 }, focus: ['shaft', ...GEARS], spin: 1.6, callouts: 'focus', orbit: false },
  },
  {
    id: 'part-static', kind: 'part',
    title: 'Casing and vanes: the frame',
    lead: 'The parts that never turn form the fixed frame of the mechanism.',
    facts: [
      ['Course term', 'Frame: the fixed link every other link is measured against'],
      ['Job', 'Steer the flow and hold the bearings and shaft in line'],
      ['Count', '44 vanes, 3 rings, 2 casing pieces'],
      ['Load', 'Air force on the vanes; bolt loads on the casing'],
    ],
    notes: 'A mechanism is a group of links with one link fixed. Here the casing is that fixed link, and the vanes are fixed to it.',
    scene: { ...base, cam: { az: 30, el: 28, dist: 1.5 }, explode: 0.7, focus: ['vanes-a', 'vanes-b', 'rings', 'casing', 'mounts'], callouts: 'focus', labels: ['vanes-a', 'casing', 'mounts'], spin: 1.0, orbit: false },
  },
  {
    id: 'part-rotor', kind: 'part',
    title: 'Rotor: a rotating link',
    lead: 'Three blade rings on their hubs, turning about one fixed axis.',
    facts: [
      ['Course term', 'Rotating link on a revolute (pin) joint'],
      ['Kinematics', 'v = r ω at the rim; at = r α and an = ω² r for acceleration'],
      ['Count', '62 blades in 3 rings'],
      ['Design concern', 'Balance at speed: uneven mass causes vibration'],
    ],
    notes: 'Use the rim of a ring as the point of interest: velocity from v = r ω, then the normal and tangential acceleration.',
    scene: { ...base, cam: { az: 50, el: 14, dist: 1.0 }, explode: 0.45, focus: ['blades-a', 'blades-b', 'blades-c', 'hubs'], callouts: 'focus', labels: ['blades-a', 'blades-b', 'blades-c'], spin: 2.2, orbit: false },
  },
  {
    id: 'part-drive', kind: 'part',
    title: 'Shaft and gear train',
    lead: 'Where the rotation leaves the machine, and the course topics that size it.',
    facts: [
      ['Course topics', 'Velocity ratio, train value, shaft design, bearings'],
      ['Count', '1 shaft, 5 gear-train pieces'],
      ['Loads', 'Torsion and bending in the shaft; tooth contact in the gears'],
      ['Design check', 'Shaft diameter, bearing support, tooth strength'],
    ],
    notes: 'Link to the course: shaft design for combined torsion and bending, then gear tooth bending and contact stress.',
    scene: { ...base, cam: { az: 120, el: 20, dist: 1.5 }, explode: 0.6, focus: ['shaft', ...GEARS], callouts: 'focus', spin: 1.6, orbit: false },
  },
  {
    id: 'end', kind: 'end',
    title: 'Questions?',
    lead: 'Thank you.',
    byline: 'BAU University',
    notes: 'Leave the model assembled and turning. Offer to explode any part again on request, and ask which course topic the audience wants to go deeper on.',
    scene: { ...base, cam: { az: 36, el: 16, dist: 1.05 }, spin: 1.4 },
  },
]
