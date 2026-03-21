import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

// Flat-top hexagon, circumradius 35, centered in 80×80 viewport
// Perimeter = 6 × 35 = 210 — dasharray 240 covers the full path
const HEX_PATH = 'M 75,40 L 57.5,70.3 L 22.5,70.3 L 5,40 L 22.5,9.7 L 57.5,9.7 Z'
const DASH = 240

const titleContainer = {
  hidden: {},
  visible: { transition: { delayChildren: 1.2, staggerChildren: 0.05 } },
}

const letterVariant = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const TITLE = 'LLMs Assemble'

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  // Safety fallback — completes even if animation callback misfires
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[#0F1117]"
      animate={{ opacity: 0 }}
      transition={{ delay: 4.2, duration: 0.6 }}
      onAnimationComplete={() => onComplete()}
    >
      {/* Phase 1-2: Logo fades in, then border draws itself */}
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.path
          d={HEX_PATH}
          stroke="#E63946"
          strokeWidth={2}
          fill="transparent"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH}
          initial={{ strokeDashoffset: DASH }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeInOut' }}
        />
        <text
          x="40"
          y="46"
          textAnchor="middle"
          fill="#E63946"
          fontSize="16"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          LA
        </text>
      </motion.svg>

      {/* Phase 3: Title letter by letter */}
      <motion.div
        variants={titleContainer}
        initial="hidden"
        animate="visible"
        className="flex"
        aria-label={TITLE}
      >
        {TITLE.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={letterVariant}
            className="text-4xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #E63946, #457B9D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>

      {/* Phase 4: Subtitle */}
      <motion.p
        className="text-sm text-[#888] tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        LLM Evaluation Platform
      </motion.p>

      {/* Phase 5: Progress bar */}
      <div className="h-0.5 w-48 bg-[#2A2D3A] rounded mx-auto overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E63946] to-[#457B9D]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 3.0, duration: 1.0, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}
