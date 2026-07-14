import { Link } from 'react-router-dom'
import { m, useReducedMotion } from 'framer-motion'
import products from '../data/products.json'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'

const campaigns = ['/media/campaign-1.jpg', '/media/campaign-2.jpg', '/media/campaign-3.jpg', '/media/campaign-4.jpg']

export default function Home() {
  const featured = products.filter(p => p.isNew)
  const reduceMotion = useReducedMotion()
  return (
    <>
      <section className="relative h-svh overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/media/hero.mp4" poster="/media/hero-poster.jpg"
          autoPlay={!reduceMotion} muted loop playsInline preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        <div className="relative h-full flex flex-col items-center justify-end pb-24 text-center px-6">
          <m.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-7xl md:text-8xl tracking-[0.15em] sm:tracking-[0.2em]"
          >
            MONOCHROME
          </m.h1>
          <m.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
            className="mt-4 text-mist uppercase tracking-[0.4em] text-xs sm:text-sm"
          >
            Cinematic essentials — FW26
          </m.p>
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}>
            <Link to="/catalog" className="mt-8 inline-block border border-paper/40 px-10 py-4 uppercase tracking-[0.3em] text-xs hover:bg-paper hover:text-ink transition-colors">
              Shop the collection
            </Link>
          </m.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest mb-10">New collection</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 snap-x">
          {campaigns.map(src => (
            <img
              key={src} src={src} alt="MONOCHROME campaign" loading="lazy"
              className="h-[60vh] w-auto object-cover snap-start shrink-0"
            />
          ))}
        </div>
        <Reveal className="text-center mt-10">
          <Link to="/lookbook" className="uppercase tracking-[0.3em] text-xs border-b border-mist pb-1 hover:text-mist transition-colors">
            View lookbook
          </Link>
        </Reveal>
      </section>
    </>
  )
}
