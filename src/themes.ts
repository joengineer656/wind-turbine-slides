// Obsidian: black stage, lit metal, one ice-blue accent.
export interface Theme {
  colors: { rotor: string; stator: string; drive: string; static: string }
  accent: string
  metal: number
  rough: number
  light: { key: string; fill: string; rim: string; env: number; exposure: number }
  shadow: { color: string; opacity: number }
}

export const THEME: Theme = {
  colors: { rotor: '#c9ced6', stator: '#7d8590', drive: '#e8c9a0', static: '#4a5059' },
  accent: '#6fd0ff',
  metal: 0.85,
  rough: 0.28,
  light: { key: '#ffffff', fill: '#5a7da8', rim: '#6fd0ff', env: 1.1, exposure: 1.0 },
  shadow: { color: '#000', opacity: 0.6 },
}
