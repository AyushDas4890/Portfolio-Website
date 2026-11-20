import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'
import Work from './pages/Work'
import NotFound from './pages/NotFound'
import { SwarmProvider } from './swarm/Swarm'
import { SmoothScroll, scrollToId, scrollToTop } from './components/SmoothScroll'

function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (pathname === '/') document.documentElement.dataset.tone = 'paper'
    if (hash) {
      // Let the page render before jumping to the anchor.
      requestAnimationFrame(() => scrollToId(hash.slice(1)))
    } else {
      scrollToTop()
    }
  }, [pathname, hash])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <SwarmProvider routeKey={pathname}>
      <a href="#main" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SwarmProvider>
  )
}
