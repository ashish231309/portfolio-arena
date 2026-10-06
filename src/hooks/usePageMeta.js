import { useEffect } from 'react'

/**
 * Per-route document metadata (T27).
 *
 * Two behaviours matter here:
 *  1. Calling it with no arguments is a no-op. The home page is the one route
 *     whose title and description are already written out in index.html — the
 *     rich, hand-written copy a crawler or a link preview reads. Overwriting that
 *     with a shorter runtime string made the site strictly worse, so '/' leaves
 *     the static tags alone.
 *  2. Canonical and og:url follow the route. They are resolved from
 *     window.location.origin rather than a build-time constant, so a preview
 *     deployment, a custom domain and localhost each get a correct absolute URL
 *     without any configuration. The static tags in index.html cover the
 *     non-JavaScript crawlers.
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    const canonical = document.querySelector('link[rel="canonical"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')

    const prevTitle = document.title
    const prevDescription = meta?.getAttribute('content') ?? null
    const prevCanonical = canonical?.getAttribute('href') ?? null
    const prevOgUrl = ogUrl?.getAttribute('content') ?? null

    const { origin, pathname } = window.location
    const url = `${origin}${pathname}`
    canonical?.setAttribute('href', url)
    ogUrl?.setAttribute('content', url)

    if (title || description) {
      // Route name only — the suffix is added once here, not in every caller.
      document.title = title ? `${title} · Ashish Kumar` : document.title
      if (description && meta) meta.setAttribute('content', description)
    }

    return () => {
      document.title = prevTitle
      if (prevDescription !== null && meta) meta.setAttribute('content', prevDescription)
      if (prevCanonical !== null && canonical) canonical.setAttribute('href', prevCanonical)
      if (prevOgUrl !== null && ogUrl) ogUrl.setAttribute('content', prevOgUrl)
    }
  }, [title, description])
}
