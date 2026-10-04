import { useEffect } from 'react'

export function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title ? `${title} · Ashish Kumar` : 'Ashish Kumar — Computer Science Student'
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'description'
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }
    return () => {
      document.title = prevTitle
    }
  }, [title, description])
}
