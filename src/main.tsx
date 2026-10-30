import '@fontsource/syne/latin-700'
import '@fontsource/hanken-grotesk/latin-400'
import '@fontsource/hanken-grotesk/latin-500'
import '@fontsource/hanken-grotesk/latin-700'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import Deck from './deck/Deck'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Deck />
  </StrictMode>,
)
