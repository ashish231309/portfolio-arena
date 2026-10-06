import { Suspense, lazy } from 'react'
import Hero from '../sections/Hero'
import Marquee from '../components/Marquee'
import { usePageMeta } from '../hooks/usePageMeta'

// Below-the-fold sections: one deferred chunk, requested right after the app
// module runs (see HomeSections.jsx for why the split exists).
const HomeSections = lazy(() => import('./HomeSections'))

/**
 * Placeholder for the deferred chunk. It reserves a viewport so the footer
 * cannot jump up into view, and it is deliberately invisible — no spinner, no
 * text — so the hero never competes with a loading state.
 */
function SectionsFallback() {
  return <div className="min-h-[100svh]" aria-hidden="true" />
}

export default function Home() {
  // Deliberately no title/description: index.html already carries the full static
  // title and description for '/', and this hook must not overwrite them (T27).
  // It still keeps canonical + og:url pointed at the current URL.
  usePageMeta()
  return (
    <>
      <Hero />
      <div className="bg-ink text-ivory dark-zone relative z-10 -my-2">
        <Marquee />
      </div>
      <Suspense fallback={<SectionsFallback />}>
        <HomeSections />
      </Suspense>
    </>
  )
}
