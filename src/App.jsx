import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Lookbook from './pages/Lookbook'

export default function App() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  useEffect(() => {
    // On back/forward the browser restores the previous scroll position itself
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/lookbook" element={<Lookbook />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
    </MotionConfig>
  )
}
