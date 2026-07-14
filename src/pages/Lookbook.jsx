import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import Reveal from '../components/Reveal'
import useDocumentTitle from '../hooks/useDocumentTitle'

const blocks = [
  { type: 'video', src: '/media/lookbook-1.mp4', poster: '/media/campaign-1.jpg', caption: 'I. Presence' },
  { type: 'image', src: '/media/campaign-3.jpg', caption: 'II. Stillness' },
  { type: 'video', src: '/media/lookbook-2.mp4', poster: '/media/campaign-2.jpg', caption: 'III. Contrast' },
  { type: 'image', src: '/media/campaign-4.jpg', caption: 'IV. Close' },
]

export default function Lookbook() {
  useDocumentTitle('FW26 Lookbook')
  const reduceMotion = useReducedMotion()
  return (
    <div className="pt-16">
      <div className="py-20 text-center px-6">
        <Reveal>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-[0.2em]">FW26 Lookbook</h1>
          <p className="mt-4 text-mist uppercase tracking-[0.4em] text-xs">Cinematic essentials</p>
        </Reveal>
      </div>

      <div className="space-y-6">
        {blocks.map(b => (
          <Reveal key={b.src}>
            <figure className="relative">
              {b.type === 'video' ? (
                <video
                  src={b.src} poster={b.poster}
                  autoPlay={!reduceMotion} muted loop playsInline preload="metadata"
                  className="w-full h-[80vh] object-cover"
                />
              ) : (
                <img src={b.src} alt={b.caption} loading="lazy" className="w-full h-[80vh] object-cover" />
              )}
              <figcaption className="absolute bottom-6 left-6 font-display uppercase tracking-[0.3em] text-sm mix-blend-difference">
                {b.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="py-24 text-center">
        <Reveal>
          <Link to="/catalog" className="border border-paper/40 px-10 py-4 uppercase tracking-[0.3em] text-xs hover:bg-paper hover:text-ink transition-colors">
            Shop the collection
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
