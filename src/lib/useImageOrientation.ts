import { useState, useEffect } from 'react'

export function useImageOrientation(src: string) {
  const [info, setInfo] = useState<{ orientation: 'landscape' | 'portrait' | null; aspectRatio: number | null }>({
    orientation: null,
    aspectRatio: null,
  })

  useEffect(() => {
    setInfo({ orientation: null, aspectRatio: null })
    const img = new Image()
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight
      setInfo({
        orientation: img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape',
        aspectRatio: ratio,
      })
    }
    img.onerror = () => setInfo({ orientation: 'landscape', aspectRatio: 4 / 3 })
    img.src = src
  }, [src])

  return info
}
