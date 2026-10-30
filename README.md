# Wind turbine: 3D slides

An interactive slide deck for a Machine Component presentation at BAU University. The turbine is a real CAD model that rotates, orbits and explodes part by part, inside 11 slides.

**Live:** https://joengineer656.github.io/wind-turbine-slides/

## Using it
| Key | Does |
|---|---|
| `←` `→` / `Space` | previous / next slide |
| `E` | explode or reassemble the model |
| `F` | fullscreen |
| `N` | speaker notes |
| `O` | slide overview |
| `H` | hide the controls |

Drag to orbit and scroll to zoom. Hover the dots on the right to find a part.

## Develop
```
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/turbine-slides.html, one offline file
```

Built with Vite, React and three.js (react-three-fiber). The 3D model in `src/assets/turbine.glb` was converted from a SolidWorks STEP export by `tools/step-to-glb.mjs`, which groups the CAD bodies into the components listed in `tools/parts.mjs`. The original CAD files are not part of this repository.
