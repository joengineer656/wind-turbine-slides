// STEP -> GLB. One node per component group (see parts.mjs). Output axis: STEP axes, metres.
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { Document, NodeIO } from '@gltf-transform/core'
import { GROUPS } from './parts.mjs'

const require = createRequire(import.meta.url)
const occt = await require('occt-import-js')()
const input = process.argv[2] ?? 'model/JK.STEP'
const res = occt.ReadStepFile(new Uint8Array(fs.readFileSync(input)), {
  linearUnit: 'millimeter', linearDeflection: 0.35, angularDeflection: 0.35,
})
if (!res.success) throw new Error('STEP read failed')

const S = 0.001
const buckets = new Map(GROUPS.map(g => [g.id, []]))
const orphans = []
for (const m of res.meshes) {
  const p = m.attributes.position.array
  const c = [0, 0, 0]
  for (let k = 0; k < p.length; k += 3) for (let a = 0; a < 3; a++) c[a] += p[k + a]
  c.forEach((_, a) => (c[a] /= p.length / 3))
  const g = GROUPS.find(g => g.match(m.name, c))
  ;(g ? buckets.get(g.id) : orphans).push(m)
}
if (orphans.length) console.warn('UNMATCHED', orphans.map(o => o.name))

const doc = new Document()
const buffer = doc.createBuffer()
const scene = doc.createScene('turbine')
const meta = {}
for (const g of GROUPS) {
  const meshes = buckets.get(g.id)
  if (!meshes.length) { console.warn('empty group', g.id); continue }
  const pos = [], nor = [], idx = []
  let base = 0
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]
  for (const m of meshes) {
    const p = m.attributes.position.array, n = m.attributes.normal?.array
    for (let k = 0; k < p.length; k += 3) {
      for (let a = 0; a < 3; a++) { const v = p[k + a] * S; pos.push(v); mn[a] = Math.min(mn[a], v); mx[a] = Math.max(mx[a], v) }
      if (n) nor.push(n[k], n[k + 1], n[k + 2]); else nor.push(0, 0, 1)
    }
    for (const i of m.index.array) idx.push(i + base)
    base += p.length / 3
  }
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer))
    .setMaterial(doc.createMaterial(g.id).setBaseColorFactor([0.7, 0.72, 0.75, 1]).setMetallicFactor(0.6).setRoughnessFactor(0.4).setDoubleSided(true))
  const mesh = doc.createMesh(g.id).addPrimitive(prim)
  scene.addChild(doc.createNode(g.id).setMesh(mesh))
  const center = mn.map((v, a) => (v + mx[a]) / 2)
  meta[g.id] = { label: g.label, kind: g.kind, spin: g.spin, dir: g.dir, count: meshes.length,
    tris: idx.length / 3, min: mn, max: mx, center,
    axis: g.axis ?? [0, 0, 1], ratio: g.ratio ?? 1, pivot: g.pivot === 'center' ? center : [0, 0, 0] }
  console.log(g.id.padEnd(9), String(meshes.length).padStart(3), 'inst', String(idx.length / 3).padStart(6), 'tris')
}
const glb = await new NodeIO().writeBinary(doc)
fs.mkdirSync('src/assets', { recursive: true })
fs.writeFileSync('src/assets/turbine.glb', glb)
fs.writeFileSync('src/parts.generated.json', JSON.stringify(meta, null, 1))
console.log('GLB', (glb.length / 1e6).toFixed(2), 'MB')
