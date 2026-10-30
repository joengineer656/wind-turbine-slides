import fs from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const occt = await require('occt-import-js')()
const buf = fs.readFileSync(process.argv[2])
const res = occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'millimeter', linearDeflection: 1.5, angularDeflection: 0.5 })
console.log('success', res.success, 'meshes', res.meshes.length)
res.meshes.forEach((m, i) => {
  const p = m.attributes.position.array
  const mn = [1e9,1e9,1e9], mx = [-1e9,-1e9,-1e9], c=[0,0,0]
  for (let k = 0; k < p.length; k += 3) for (let a = 0; a < 3; a++) { mn[a]=Math.min(mn[a],p[k+a]); mx[a]=Math.max(mx[a],p[k+a]); c[a]+=p[k+a] }
  const n = p.length/3
  console.log(i, JSON.stringify(m.name), 'tris', m.index.array.length/3,
    'min', mn.map(v=>v.toFixed(0)).join(','), 'max', mx.map(v=>v.toFixed(0)).join(','),
    'size', mx.map((v,a)=>(v-mn[a]).toFixed(0)).join('x'), 'ctr', c.map(v=>(v/n).toFixed(0)).join(','))
})
