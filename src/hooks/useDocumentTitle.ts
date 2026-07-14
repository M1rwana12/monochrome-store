import { useEffect } from 'react'

export default function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — MONOCHROME` : 'MONOCHROME'
    return () => {
      document.title = 'MONOCHROME'
    }
  }, [title])
}
