import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` -> dist/turbine-slides.html: one offline file (JS, CSS, fonts and the 3D model inlined)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  assetsInclude: ['**/*.glb'],
  build: { chunkSizeWarningLimit: 3000, assetsInlineLimit: 100000000 },
})
