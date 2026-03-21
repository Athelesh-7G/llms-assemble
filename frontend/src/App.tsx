import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Skeleton from './components/Skeleton'
import SplashScreen from './components/SplashScreen'

const HomePage       = React.lazy(() => import('./pages/HomePage'))
const ComparisonPage = React.lazy(() => import('./pages/ComparisonPage'))
const BenchmarksPage = React.lazy(() => import('./pages/BenchmarksPage'))
const TrendsPage     = React.lazy(() => import('./pages/TrendsPage'))
const ClustersPage   = React.lazy(() => import('./pages/ClustersPage'))
const TradeoffsPage  = React.lazy(() => import('./pages/TradeoffsPage'))
const RankingPage    = React.lazy(() => import('./pages/RankingPage'))
const ExplorerPage   = React.lazy(() => import('./pages/ExplorerPage'))
const MakingPage     = React.lazy(() => import('./pages/MakingPage'))

function SuspenseFallback() {
  return (
    <div className="flex flex-col gap-3 p-8 max-w-lg">
      <Skeleton width="60%" height={20} />
      <Skeleton width="80%" height={20} />
      <Skeleton width="40%" height={20} />
    </div>
  )
}

function CursorGuard() {
  const location = useLocation()
  useEffect(() => {
    document.body.classList.remove("custom-cursor-active")
  }, [location.pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"           element={<HomePage />} />
        <Route path="/compare"    element={<ComparisonPage />} />
        <Route path="/benchmarks" element={<BenchmarksPage />} />
        <Route path="/trends"     element={<TrendsPage />} />
        <Route path="/clusters"   element={<ClustersPage />} />
        <Route path="/tradeoffs"  element={<TradeoffsPage />} />
        <Route path="/rankings"   element={<RankingPage />} />
        <Route path="/explorer"   element={<ExplorerPage />} />
        <Route path="/making"     element={<MakingPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [showLanding, setShowLanding] = useState(true)

  if (showSplash) {
    return (
      <SplashScreen onComplete={() => setShowSplash(false)} />
    )
  }

  return (
    <>
      <BrowserRouter>
        <CursorGuard />
        <Layout>
          <Suspense fallback={<SuspenseFallback />}>
            <AnimatedRoutes />
          </Suspense>
        </Layout>
      </BrowserRouter>

      <AnimatePresence>
        {showLanding && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50"
          >
            <LandingPage onEnter={() => setShowLanding(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
