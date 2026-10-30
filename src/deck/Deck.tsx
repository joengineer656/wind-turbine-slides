import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Scene, { PART_LIST } from '../scene/Scene'
import { SLIDES } from './slides'
import { THEME } from '../themes'

// where the model sits on content slides, opposite the copy; fractions of the screen width/height
const SHIFT_X = 0.15
const SHIFT_Y = 0.03

function useSlideIndex() {
  const read = () => Math.min(SLIDES.length - 1, Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1))
  const [i, setI] = useState(read)
  useEffect(() => { const h = () => setI(read()); window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h) }, [])
  const go = useCallback((n: number) => { const c = Math.min(SLIDES.length - 1, Math.max(0, n)); history.replaceState(null, '', `#${c + 1}`); setI(c) }, [])
  return [i, go] as const
}

export default function Deck() {
  const theme = THEME
  const [idx, go] = useSlideIndex()
  const [intro, setIntro] = useState(true)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const [userExplode, setUserExplode] = useState<number | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [notes, setNotes] = useState(false)
  const [overview, setOverview] = useState(false)
  const [hud, setHud] = useState(true)
  const slide = SLIDES[idx]
  const behindRef = useRef<HTMLSpanElement>(null)

  // size the giant background word so it spans the stage whatever typeface the theme uses
  useLayoutEffect(() => {
    const fit = () => {
      const el = behindRef.current
      if (!el) return
      el.style.fontSize = ''
      const w = el.scrollWidth, avail = el.parentElement!.clientWidth * 0.94
      const cur = parseFloat(getComputedStyle(el).fontSize)
      el.style.fontSize = `${Math.min(cur * (avail / w), innerHeight * 0.62)}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [slide.kind])

  useEffect(() => { setUserExplode(null); setPinned(null) }, [idx])
  useEffect(() => { if (!ready) return; const t = setTimeout(() => setIntro(false), 700); return () => clearTimeout(t) }, [ready])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); go(idx + 1) }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(idx - 1) }
      else if (k === 'Home') go(0)
      else if (k === 'End') go(SLIDES.length - 1)
      else if (k === 'f' || k === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()
      else if (k === 'n' || k === 'N') setNotes(v => !v)
      else if (k === 'o' || k === 'O') setOverview(v => !v)
      else if (k === 'h' || k === 'H') setHud(v => !v)
      else if (k === 'e' || k === 'E') setUserExplode(v => ((v ?? slide.scene.explode) > 0.5 ? 0 : 1))
      else if (k === 'Escape') { setOverview(false); setNotes(false); setPinned(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, go, slide])

  const explode = userExplode ?? (idx === 0 && intro ? 1 : slide.scene.explode)
  const focus = hover ? [hover] : pinned ? [pinned] : slide.scene.focus
  const calloutIds = useMemo(() => {
    const ids = slide.scene.labels ?? (slide.scene.callouts === 'all' ? PART_LIST.map(p => p.id) : slide.scene.callouts === 'focus' ? slide.scene.focus : [])
    return hover ? [...new Set([...ids, hover])] : pinned ? [...new Set([...ids, pinned])] : ids
  }, [slide, hover, pinned])
  const isHero = slide.kind === 'title' || slide.kind === 'end'

  return (
    <div className="deck" data-kind={slide.kind} data-hud={hud}>
      <div className="bg" aria-hidden />
      {slide.kind === 'title' && <div className="behind" aria-hidden><span ref={behindRef}>{slide.title}</span></div>}

      <Scene theme={theme} state={slide.scene} explode={explode} focus={focus} calloutIds={calloutIds}
        onReady={onReady} layoutShift={slide.kind === 'title' || slide.id === 'explode' ? 0 : SHIFT_X} layoutShiftY={slide.kind === 'title' ? 0.1 : slide.id === 'explode' ? 0.06 : SHIFT_Y} slideKey={slide.id} />

      <main className="slide" key={slide.id} data-kind={slide.kind} data-id={slide.id}>
        {isHero ? <h1 className="title">{slide.title}</h1> : <h2 className="title">{slide.title}</h2>}
        {slide.lead && <p className="lead">{slide.lead}</p>}
        {slide.byline && <p className="byline">{slide.byline}</p>}
        {slide.points && (
          <ul className="points">{slide.points.map(p => <li key={p.h}><strong>{p.h}</strong> {p.t}</li>)}</ul>
        )}
        {slide.facts && (
          <dl className="facts">{slide.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        )}
      </main>

      {hud && (
        <>
          <nav className="rail" aria-label="Parts">
            <small>Parts</small>
            {PART_LIST.map(p => (
              <button key={p.id} className={focus.includes(p.id) ? 'on' : ''} data-kind={p.kind}
                onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)}
                onClick={() => setPinned(v => (v === p.id ? null : p.id))}>
                <i style={{ background: theme.colors[p.kind] }} /><span>{p.label}</span>
              </button>
            ))}
          </nav>

          <footer className="hud">
            <div className="progress" role="tablist">
              {SLIDES.map((s, i) => <button key={s.id} role="tab" aria-selected={i === idx} aria-label={s.title} className={i === idx ? 'on' : i < idx ? 'done' : ''} onClick={() => go(i)} />)}
            </div>
            <span className="count">{idx + 1} / {SLIDES.length}</span>
            <label className="explode">Explode
              <input type="range" min={0} max={1} step={0.01} value={explode} onChange={e => setUserExplode(parseFloat(e.target.value))} />
            </label>
            <button className="chip" onClick={() => setNotes(v => !v)}>Notes</button>
            <button className="chip" onClick={() => setOverview(v => !v)}>Slides</button>
          </footer>
        </>
      )}

      {notes && <aside className="notes"><b>Speaker notes</b><p>{slide.notes}</p></aside>}
      {overview && (
        <div className="overview" onClick={() => setOverview(false)}>
          {SLIDES.map((s, i) => <button key={s.id} className={i === idx ? 'on' : ''} onClick={() => go(i)}><small>{i + 1}</small>{s.title}</button>)}
        </div>
      )}
    </div>
  )
}
