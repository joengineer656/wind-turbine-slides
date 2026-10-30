import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import glbUrl from '../assets/turbine.glb?inline'
import PARTS from '../parts.generated.json'
import type { SceneState } from '../deck/slides'
import type { Theme } from '../themes'

type Meta = { label: string; kind: 'rotor' | 'stator' | 'drive' | 'static'; spin: boolean; dir: number[]; count: number; center: number[]; min: number[]; max: number[] }
const META = PARTS as Record<string, Meta>
const IDS = Object.keys(META)
const EXPLODE_DISTANCE = 0.22
export const PART_LIST = IDS.map(id => ({ id, ...META[id] })).sort((a, b) => a.center[2] - b.center[2])

// model centre in STEP coords (metres); the root group re-centres on it and turns +Z (shaft axis) onto world +X
const ALL_MIN = [0, 1, 2].map(a => Math.min(...IDS.map(i => META[i].min[a])))
const ALL_MAX = [0, 1, 2].map(a => Math.max(...IDS.map(i => META[i].max[a])))
const CENTER = ALL_MIN.map((v, a) => (v + ALL_MAX[a]) / 2)
const DEG = Math.PI / 180
const FLOOR_Y = ALL_MIN[1] - CENTER[1] - 0.003

export interface SceneProps {
  theme: Theme
  state: SceneState
  explode: number
  focus: string[]
  calloutIds: string[]
  layoutShift: number
  layoutShiftY: number
  onReady?: () => void
}

// several labels at once alternate above/below their part so neighbours don't collide
function calloutVariant(id: string, ids: string[]): 'side' | 'up' | 'down' | null {
  if (!ids.includes(id)) return null
  if (ids.length < 2) return 'side'
  const order = PART_LIST.filter(p => ids.includes(p.id)).map(p => p.id)
  return order.indexOf(id) % 2 === 0 ? 'up' : 'down'
}

function Part({ id, geometry, theme, anim, focusRef, callout }: {
  id: string; geometry: THREE.BufferGeometry; theme: Theme
  anim: React.MutableRefObject<{ explode: number; angle: number }>
  focusRef: React.MutableRefObject<string[]>; callout: 'side' | 'up' | 'down' | null
}) {
  const m = META[id]
  const outer = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const dim = useRef(0)
  const glow = useRef(0)
  const baseColor = useMemo(() => new THREE.Color(theme.colors[m.kind]), [theme, m.kind])
  const accentColor = useMemo(() => new THREE.Color(theme.accent), [theme])
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: baseColor, metalness: theme.metal, roughness: theme.rough, transparent: true, side: THREE.DoubleSide,
    emissive: accentColor, emissiveIntensity: 0,
  }), [theme, baseColor, accentColor])
  useEffect(() => () => material.dispose(), [material])

  useFrame((_, dt) => {
    const k = anim.current.explode * EXPLODE_DISTANCE
    outer.current.position.set(m.dir[0] * k, m.dir[1] * k, m.dir[2] * k)
    spin.current.rotation.z = m.spin ? anim.current.angle : 0
    const f = focusRef.current
    dim.current = THREE.MathUtils.damp(dim.current, f.length > 0 && !f.includes(id) ? 1 : 0, 6, dt)
    glow.current = THREE.MathUtils.damp(glow.current, f.includes(id) ? 1 : 0, 6, dt)
    material.opacity = THREE.MathUtils.lerp(1, 0.13, dim.current)   // everything not in focus ghosts out
    material.depthWrite = material.opacity > 0.6
    material.emissiveIntensity = glow.current * 0.3
    material.color.copy(baseColor).lerp(accentColor, glow.current * 0.4)
  })

  return (
    <group ref={outer}>
      <group ref={spin}><mesh geometry={geometry} material={material} /></group>
      {callout && (
        <Html position={m.center as [number, number, number]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`callout ${callout}`}><b>{m.label}</b>{m.count > 1 && <span>{m.count} pieces</span>}</div>
        </Html>
      )}
    </group>
  )
}

// Illustrative airflow: thin streaks sliding along the shaft axis with a slight swirl.
function Flow({ theme, on }: { theme: Theme; on: boolean }) {
  const N = 150
  const ref = useRef<THREE.InstancedMesh>(null!)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const seed = useMemo(() => Array.from({ length: N }, () => ({ r: 0.02 + Math.random() * 0.115, a: Math.random() * 6.283, z: Math.random(), s: 0.5 + Math.random() }))
    , [])
  const o = useMemo(() => new THREE.Object3D(), [])
  const PAD = 0.07
  const len = ALL_MAX[2] - ALL_MIN[2] + PAD * 2
  useFrame(({ clock }, dt) => {
    mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, on ? 0.42 : 0, 4, dt)
    ref.current.visible = mat.current.opacity > 0.01
    if (!ref.current.visible) return
    const t = clock.elapsedTime
    seed.forEach((p, i) => {
      const z = ((p.z + t * 0.16 * p.s) % 1) * len + ALL_MIN[2] - PAD
      const a = p.a + (z - ALL_MIN[2]) * 3.2
      o.position.set(Math.cos(a) * p.r, Math.sin(a) * p.r, z)
      o.rotation.set(0, 0, 0)
      o.scale.set(1, 1, 0.5 + p.s * 0.8)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <boxGeometry args={[0.0014, 0.0014, 0.05]} />
      <meshBasicMaterial ref={mat} color={theme.accent} transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  )
}

function Turbine(props: SceneProps) {
  const { theme, state, explode, focus, calloutIds } = props
  const { nodes } = useGLTF(glbUrl, false, false) as unknown as { nodes: Record<string, THREE.Mesh> }
  const anim = useRef({ explode, angle: 0 })
  const spinTarget = useRef(state.spin)
  const focusRef = useRef(focus)
  const explodeTarget = useRef(explode)
  focusRef.current = focus
  explodeTarget.current = explode
  spinTarget.current = state.spin
  const speed = useRef(state.spin)

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    anim.current.explode = THREE.MathUtils.damp(anim.current.explode, explodeTarget.current, 2.6, d)
    speed.current = THREE.MathUtils.damp(speed.current, spinTarget.current, 2, d)
    anim.current.angle -= speed.current * d
  })
  const { onReady } = props
  useEffect(() => { onReady?.() }, [onReady])

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <group position={[-CENTER[0], -CENTER[1], -CENTER[2]]}>
        {IDS.map(id => nodes[id] && (
          <Part key={id} id={id} geometry={nodes[id].geometry} theme={theme} anim={anim} focusRef={focusRef} callout={calloutVariant(id, calloutIds)} />
        ))}
        <Flow theme={theme} on={state.flow} />
      </group>
    </group>
  )
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const toPos = (c: SceneState['cam']) => new THREE.Vector3(
  c.dist * Math.cos(c.el * DEG) * Math.sin(c.az * DEG), c.dist * Math.sin(c.el * DEG) + (c.ty ?? 0), c.dist * Math.cos(c.el * DEG) * Math.cos(c.az * DEG))

function CameraRig({ state, layoutShift, layoutShiftY, slideKey }: { state: SceneState; layoutShift: number; layoutShiftY: number; slideKey: string }) {
  const { camera, size } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const tween = useRef<{ t: number; from: THREE.Vector3; to: THREE.Vector3 } | null>(null)
  const idle = useRef(true)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    tween.current = { t: 0, from: camera.position.clone(), to: toPos(state.cam) }
    c.enabled = false
  }, [slideKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    cam.setViewOffset(size.width, size.height, -size.width * layoutShift, size.height * layoutShiftY, size.width, size.height)
    return () => cam.clearViewOffset()
  }, [camera, size.width, size.height, layoutShift, layoutShiftY])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const start = () => { idle.current = false; window.clearTimeout(timer.current) }
    const end = () => { timer.current = window.setTimeout(() => { idle.current = true }, 5000) }
    c.addEventListener('start', start); c.addEventListener('end', end)
    return () => { c.removeEventListener('start', start); c.removeEventListener('end', end) }
  }, [])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    const tw = tween.current
    if (tw) {
      tw.t = Math.min(1, tw.t + dt / 1.15)
      const k = ease(tw.t)
      // interpolate in spherical space so the camera swings around the model instead of cutting through it
      const a = new THREE.Spherical().setFromVector3(tw.from), b = new THREE.Spherical().setFromVector3(tw.to)
      let dth = b.theta - a.theta
      dth = Math.atan2(Math.sin(dth), Math.cos(dth))
      const s = new THREE.Spherical(THREE.MathUtils.lerp(a.radius, b.radius, k), THREE.MathUtils.lerp(a.phi, b.phi, k), a.theta + dth * k)
      camera.position.setFromSpherical(s)
      camera.lookAt(0, 0, 0)
      if (tw.t >= 1) { tween.current = null; c.enabled = true }
    }
    c.autoRotate = state.orbit && idle.current && !tween.current
    c.autoRotateSpeed = 0.55
    c.update()
  })
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={0.35} maxDistance={3.2} target={[0, 0, 0]} />
}

function Lights({ theme }: { theme: Theme }) {
  const { light } = theme
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[2, 3, 2]} intensity={1.4 * light.exposure} color={light.key} />
      <directionalLight position={[-3, 1, -2]} intensity={0.6} color={light.fill} />
      <Environment resolution={256} environmentIntensity={light.env}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 2]} scale={[8, 3, 1]} color={light.key} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} color={light.fill} />
        <Lightformer form="ring" intensity={3} position={[4, 0, -3]} scale={4} color={light.rim} />
        <Lightformer form="rect" intensity={1.2} position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} color={light.fill} />
      </Environment>
    </>
  )
}

export default function Scene(props: SceneProps & { slideKey: string }) {
  const { theme } = props
  return (
    <Canvas className="scene" dpr={[1, 2]} camera={{ fov: 32, near: 0.05, far: 40, position: toPos(props.state.cam).toArray() }} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}>
        <Lights theme={theme} />
        <Turbine {...props} />
        <ContactShadows position={[0, FLOOR_Y, 0]} opacity={theme.shadow.opacity} scale={3} blur={2.8} far={0.6} color={theme.shadow.color} />
        <CameraRig state={props.state} layoutShift={props.layoutShift} layoutShiftY={props.layoutShiftY} slideKey={props.slideKey} />
      </Suspense>
    </Canvas>
  )
}
