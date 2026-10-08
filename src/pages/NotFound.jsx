import { Link } from 'react-router-dom'
import Section, { container } from '../components/Section'
import { MaskLines, Fade } from '../components/Reveal'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('404', 'Page not found.')
  return (
    <Section bg="ink" accent="coral" grid className="dark-zone min-h-[100svh] flex items-center" labelledBy="notfound-title">
      <div className={`${container} py-40`}>
        <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-coral">error 404 — route not found</p>
        <MaskLines
          as="h1"
          id="notfound-title"
          className="mt-5 font-display font-bold tracking-mega text-ivory text-[clamp(3rem,10vw,7rem)] leading-none"
          lines={['This page', 'never shipped.']}
        />
        <Fade delay={0.3} y={14}>
          <p className="mt-6 max-w-[44ch] text-fog">
            Maybe the link rotted, maybe I renamed something mid-build. Either way — the rest of the site works.
          </p>
          <Link
            to="/"
            data-cursor="button"
            className="mt-8 inline-flex rounded-full bg-lime px-6 py-3.5 font-body font-bold text-sm text-ink hover:bg-[#b8e356] transition-colors"
          >
            Back to home
          </Link>
        </Fade>
      </div>
    </Section>
  )
}
