import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m, MotionConfig } from 'framer-motion'
import i18n from './i18n'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'

const Catalog = lazy(() => import('./pages/Catalog'))
const Product = lazy(() => import('./pages/Product'))
const Lookbook = lazy(() => import('./pages/Lookbook'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Shared route table; mounted at both "/" (Ukrainian) and "/en" (English)
function SiteRoutes() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="catalog" element={<Catalog />} />
      <Route path="product/:id" element={<Product />} />
      <Route path="lookbook" element={<Lookbook />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const isEn = location.pathname === '/en' || location.pathname.startsWith('/en/')
  const lang = isEn ? 'en' : 'uk'

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    // On back/forward the browser restores the previous scroll position itself
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [location.pathname, navigationType])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <ErrorBoundary>
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Suspense fallback={<div className="pt-32 min-h-svh" aria-hidden="true" />}>
                    <Routes location={location}>
                      <Route path="/en/*" element={<SiteRoutes />} />
                      <Route path="/*" element={<SiteRoutes />} />
                    </Routes>
                  </Suspense>
                </m.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
