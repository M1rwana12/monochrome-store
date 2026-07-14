import { useState, type ImgHTMLAttributes } from 'react'

// Renders a pulsing placeholder until the image finishes loading.
// Must be placed inside a `position: relative` container.
export default function SkeletonImage({
  className = '',
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-coal animate-pulse" aria-hidden="true" />}
      <img
        {...rest}
        ref={el => {
          // Cached images can complete before React attaches the load listener
          if (el?.complete && !loaded) setLoaded(true)
        }}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  )
}
