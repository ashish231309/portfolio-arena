import { useEffect } from 'react'

/**
 * Per-route document metadata (T27 + U24).
 *
 * Two behaviours matter here:
 *  1. Calling it with no arguments is a no-op. The home page is the one route
 *     whose title and description are already written out in index.html — the
 *     rich, hand-written copy a crawler or a link preview reads. Overwriting
 *     that with a shorter runtime string made the site strictly worse, so '/'
 *     leaves the static tags alone.
 *  2. Canonical and og:url follow the route. They are resolved from
 *     window.location.origin rather than a build-time constant, so a preview
 *     deployment, a custom domain and localhost each get a correct absolute URL
 *     without any configuration. The static tags in index.html cover the
 *     non-JavaScript crawlers.
 *  3. U24: per-route title/description also update og:title, og:description,
 *     twitter:title and twitter:description so link shares on social platforms
 *     carry the right preview for /projects, /contact, etc., not the home copy.
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    const canonical = document.querySelector('link[rel="canonical"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const twTitle = document.querySelector('meta[name="twitter:title"]')
    const twDesc = document.querySelector('meta[name="twitter:description"]')

    const prevTitle = document.title
    const prevDescription = meta?.getAttribute('content') ?? null
    const prevCanonical = canonical?.getAttribute('href') ?? null
    const prevOgUrl = ogUrl?.getAttribute('content') ?? null
    const prevOgTitle = ogTitle?.getAttribute('content') ?? null
    const prevOgDesc = ogDesc?.getAttribute('content') ?? null
    const prevTwTitle = twTitle?.getAttribute('content') ?? null
    const prevTwDesc = twDesc?.getAttribute('content') ?? null

    const { origin, pathname } = window.location
    const url = `${origin}${pathname}`
    canonical?.setAttribute('href', url)
    ogUrl?.setAttribute('content', url)

    if (title || description) {
      // Route name only — the suffix is added once here, not in every caller.
      if (title) {
        document.title = `${title} · Ashish Kumar`
        ogTitle?.setAttribute('content', `${title} · Ashish Kumar`)
        twTitle?.setAttribute('content', `${title} · Ashish Kumar`)
      }
      if (description && meta) {
        meta.setAttribute('content', description)
        ogDesc?.setAttribute('content', description)
        twDesc?.setAttribute('content', description)
      }
    }

    return () => {
      document.title = prevTitle
      if (prevDescription !== null && meta) meta.setAttribute('content', prevDescription)
      if (prevCanonical !== null && canonical) canonical.setAttribute('href', prevCanonical)
      if (prevOgUrl !== null && ogUrl) ogUrl.setAttribute('content', prevOgUrl)
      if (prevOgTitle !== null && ogTitle) ogTitle.setAttribute('content', prevOgTitle)
      if (prevOgDesc !== null && ogDesc) ogDesc.setAttribute('content', prevOgDesc)
      if (prevTwTitle !== null && twTitle) twTitle.setAttribute('content', prevTwTitle)
      if (prevTwDesc !== null && twDesc) twDesc.setAttribute('content', prevTwDesc)
    }
  }, [title, description])
}
