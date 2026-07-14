import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'

const Catalog = lazy(() => import('./pages/Catalog'))
const Product = lazy(() => import('./pages/Product'))
const Lookbook = lazy(() => import('./pages/Lookbook'))

export default function App() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  useEffect(() => {
    // On back/forward the browser restores the previous scroll position itself
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<div className="pt-32" aria-hidden="true" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/lookbook" element={<Lookbook />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
