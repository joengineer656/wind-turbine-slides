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
    lead: 'Machine Component Presentation',
    byline: 'BAU University',
    notes: 'Open on the model. It assembles itself on load; let it finish, then say what we are about to study: an axial-flow turbine, taken apart part by part.',
    scene: { ...base, cam: { az: 38, el: 18, dist: 1.3 }, spin: 1.2 },
  },
  {
    id: 'purpose', kind: 'text',
    title: 'Moving air in, turning shaft out',
    lead: 'A turbine takes energy from a moving fluid and turns it into rotation that a machine can use.',
    points: [
      { h: 'Rotor blades', t: 'catch the air and spin.' },
      { h: 'Stator vanes', t: 'hold still and steer the air.' },
      { h: 'Shaft and gears', t: 'carry the rotation to the output.' },
    ],
    notes: 'Three jobs: catch, steer, carry. Every part we meet later does one of these. Keep this slide to under a minute.',
    scene: { ...base, cam: { az: 28, el: 14, dist: 1.0 }, spin: 2.4, flow: true },
  },
  {
    id: 'blades', kind: 'text',
    title: 'Air meets the blades',
    lead: 'The blades bend the airflow. The air pushes back on each blade, and that push turns the rotor.',
    points: [
      { h: 'Three rotor rings', t: 'stage A and B have 22 blades each, stage C has 18.' },
      { h: 'Twisted shape', t: 'each blade is angled to the flow so it makes a steady push.' },
    ],
    notes: 'Newton’s third law in one sentence: turning the air sideways pushes the blade the other way. The streaks are illustrative, not CFD.',
    scene: { ...base, cam: { az: 62, el: 12, dist: 0.95 }, focus: ['blades-a', 'blades-b', 'blades-c'], spin: 3.2, flow: true, callouts: 'focus' },
  },
  {
    id: 'stators', kind: 'text',
    title: 'Fixed vanes straighten the flow',
    lead: 'After each rotor ring the air is swirling. A ring of fixed vanes turns it back so the next ring gets a clean approach.',
    points: [
      { h: 'Two vane rings', t: '22 vanes each, fixed to the casing and never moving.' },
      { h: 'Why it matters', t: 'without them the later blades would see the wrong angle and lose push.' },
    ],
    notes: 'Rotor then stator, rotor then stator. This is what makes it an axial machine: the air stays on the axis.',
    scene: { ...base, cam: { az: 20, el: 24, dist: 0.95 }, focus: ['vanes-a', 'vanes-b', 'rings'], spin: 1.4, flow: true, callouts: 'focus', orbit: false },
  },
  {
    id: 'shaft', kind: 'text',
    title: 'The shaft collects the turning',
    lead: 'Every rotor hub is fixed to one shaft, so the push on all three blade rings adds up in a single rotation.',
    points: [
      { h: 'One axis', t: 'the shaft runs through the centre of every disc and ring.' },
      { h: 'Loaded in torsion', t: 'it carries all the torque, so its diameter sets how much power it can pass.' },
    ],
    notes: 'This is where the course topic shows up: shaft under torque and bending, supported at both ends.',
    scene: { ...base, cam: { az: 10, el: 8, dist: 1.0 }, focus: ['shaft', 'hubs'], spin: 2.0, callouts: 'focus', orbit: false },
  },
  {
    id: 'gears', kind: 'text',
    title: 'Gears take the power off the shaft',
    lead: 'A gear pair on the side turns the rotation toward the output and sets the speed ratio.',
    points: [
      { h: 'Two meshing gears', t: 'teeth pass the torque from one axis to another.' },
      { h: 'Speed against torque', t: 'a smaller gear driven by a larger one turns faster with less torque.' },
    ],
    notes: 'Do not quote a ratio unless you have counted the teeth on your own model. Ask the audience which gear is the driver.',
    scene: { ...base, cam: { az: 150, el: 22, dist: 0.9 }, focus: GEARS, spin: 1.8, callouts: 'focus', orbit: false },
  },
  {
    id: 'explode', kind: 'text',
    title: 'Everything, pulled apart',
    lead: 'Drag to orbit, scroll to zoom, hover the parts list to find a component.',
    notes: 'Let the audience explore for a moment. Use the explode slider at the bottom to go back and forth.',
    scene: { ...base, cam: { az: 24, el: 16, dist: 1.75 }, explode: 1, spin: 0.8, callouts: 'all', labels: ['blades-c', 'casing', 'shaft', 'vanes-a', 'mounts'] },
  },
  {
    id: 'part-rotor', kind: 'part',
    title: 'Rotor',
    lead: 'Three blade rings on their hubs.',
    facts: [
      ['Job', 'Turn moving air into torque'],
      ['Count', '62 blades in 3 rings'],
      ['Loads', 'Air pressure bending each blade, plus centrifugal pull'],
      ['Design concern', 'Blade root fit and balance at speed'],
    ],
    notes: 'Machine-component view: each blade is a cantilever under distributed load. Balance matters because the whole ring spins.',
    scene: { ...base, cam: { az: 50, el: 14, dist: 1.0 }, explode: 0.45, focus: ['blades-a', 'blades-b', 'blades-c', 'hubs'], callouts: 'focus', labels: ['blades-a', 'blades-b', 'blades-c'], spin: 2.2, orbit: false },
  },
  {
    id: 'part-static', kind: 'part',
    title: 'Stator and casing',
    lead: 'The parts that never turn.',
    facts: [
      ['Job', 'Steer the flow and hold everything in line'],
      ['Count', '44 vanes, 3 rings, 2 casing pieces'],
      ['Loads', 'Air force on vanes, bolt loads on the casing'],
      ['Design concern', 'Clearance to the spinning blades'],
    ],
    notes: 'An open casing makes assembly possible: you cannot slide a finished rotor into a closed duct.',
    scene: { ...base, cam: { az: 30, el: 28, dist: 1.5 }, explode: 0.7, focus: ['vanes-a', 'vanes-b', 'rings', 'casing', 'mounts'], callouts: 'focus', labels: ['vanes-a', 'casing', 'mounts'], spin: 1.0, orbit: false },
  },
  {
    id: 'part-drive', kind: 'part',
    title: 'Shaft and gear train',
    lead: 'Where the rotation leaves the machine.',
    facts: [
      ['Job', 'Carry torque to the output'],
      ['Count', '1 shaft, 5 gear-train pieces'],
      ['Loads', 'Torsion and bending in the shaft, tooth contact in the gears'],
      ['Design concern', 'Shaft diameter, bearing support, tooth strength'],
    ],
    notes: 'Link to the course: shaft design for combined torsion and bending, then gear tooth bending and contact stress.',
    scene: { ...base, cam: { az: 120, el: 20, dist: 1.5 }, explode: 0.6, focus: ['shaft', ...GEARS], callouts: 'focus', spin: 1.6, orbit: false },
  },
  {
    id: 'end', kind: 'end',
    title: 'Questions?',
    lead: 'Thank you.',
    byline: 'BAU University',
    notes: 'Leave the model assembled and turning. Offer to explode any part again on request.',
    scene: { ...base, cam: { az: 36, el: 16, dist: 1.05 }, spin: 1.4 },
  },
]
