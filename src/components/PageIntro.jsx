import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { container } from './Section'
import { MaskLines, Fade } from './Reveal'

/** Editorial page header for standalone routes. */
export default function PageIntro({ index, title, lede, accent = 'indigo', crumb, id }) {
  const lines = Array.isArray(title) ? title : [title]
  return (
    <div className={`${container} pt-36 md:pt-44 pb-[clamp(2.5rem,6vh,4rem)]`}>
      <Fade y={10} duration={0.5}>
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.24em] uppercase text-muted">
          <Link to="/" data-cursor="link" className="inline-flex items-center gap-1 underline-slide">
            <ChevronLeft size={13} aria-hidden="true" /> Home
          </Link>
          <span className="h-px w-8 bg-ink/20" aria-hidden="true" />
          <span>§{index}</span>
          <span>{crumb}</span>
        </div>
      </Fade>
      <MaskLines
        as="h1"
        id={id}
        lines={lines}
        delay={0.06}
        className="mt-5 font-display font-bold tracking-mega leading-[1.0] text-[clamp(2.5rem,7vw,5.6rem)]"
      />
      {lede && (
        <Fade delay={0.3} y={14}>
          <p className="mt-6 max-w-[56ch] text-[clamp(1rem,1.1vw,1.12rem)] leading-relaxed text-muted">{lede}</p>
        </Fade>
      )}
      <span
        className={`block mt-8 h-[3px] w-24 rounded-full ${
          { indigo: 'bg-indigo', cyan: 'bg-cyan', coral: 'bg-coral', lime: 'bg-lime', cobalt: 'bg-cobalt' }[accent] || 'bg-indigo'
        }`}
        aria-hidden="true"
      />
    </div>
  )
}
