import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart2,
  Calculator,
  ChevronDown,
  ExternalLink,
  GitCompare,
  LayoutDashboard,
  Network,
  Newspaper,
  Scale,
  Sparkles,
  Table2,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import ParticleCanvas from '../components/ParticleCanvas'
import CustomCursor from '../components/CustomCursor'
import { modelsData } from '../data/loader'

// ── Config ────────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onEnter: () => void
}

const FEATURES = [
  { icon: LayoutDashboard, title: 'Overview',    desc: 'KPIs, top models, cluster summary'  },
  { icon: GitCompare,      title: 'Compare',     desc: 'Radar charts, side-by-side stats'   },
  { icon: BarChart2,       title: 'Benchmarks',  desc: 'MMLU, HumanEval, MATH deep-dive'   },
  { icon: TrendingUp,      title: 'Trends',      desc: '2025 monthly evolution charts'      },
  { icon: Network,         title: 'Clusters',    desc: 'K-Means groupings via PCA'          },
  { icon: Scale,           title: 'Tradeoffs',   desc: 'Cost vs capability scatter plots'   },
  { icon: Trophy,          title: 'Rankings',    desc: 'Live weight-adjustable ranking'     },
  { icon: Table2,          title: 'Explorer',    desc: 'Filter, sort, export full dataset'  },
  { icon: Newspaper,       title: 'Top News',      desc: '120 AI stories — Jan–Dec 2025'      },
  { icon: Sparkles,        title: 'Find My Model', desc: '5-question wizard to your perfect LLM' },
  { icon: Calculator,      title: 'Cost Calc',     desc: 'Live monthly API cost for 40 models'   },
]

const FEATURE_CARDS = [
  { icon: Sparkles,     label: 'Find Your Perfect Model', value: '5 Questions',  subtitle: 'Quiz → Top 3 model recommendations',       iconBg: 'bg-[#E63946]/15', iconColor: 'text-[#E63946]', textColor: 'text-[#E63946]', path: '/quiz'     },
  { icon: Calculator,   label: 'Live Cost Calculator',    value: '40 Models',   subtitle: 'Real-time monthly API cost comparison',     iconBg: 'bg-[#457B9D]/15', iconColor: 'text-[#457B9D]', textColor: 'text-[#457B9D]', path: '/cost'     },
  { icon: Newspaper,    label: '2025 AI News',            value: '120 Stories', subtitle: 'Top 10 AI events every month of 2025',      iconBg: 'bg-[#E9C46A]/15', iconColor: 'text-[#E9C46A]', textColor: 'text-[#E9C46A]', path: '/news'     },
  { icon: ExternalLink, label: 'Direct Model Access',     value: '160 Links',   subtitle: 'Chat · API · HuggingFace · Docs per model', iconBg: 'bg-[#2A9D8F]/15', iconColor: 'text-[#2A9D8F]', textColor: 'text-[#2A9D8F]', path: '/explorer' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)
  const section2Ref = useRef<HTMLElement>(null)

  const scrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-scroll bg-[#0F1117]">
      <CustomCursor />
      <div className="hidden sm:block">
        <ParticleCanvas />
      </div>

      {/* ── Section 1: Hero ─────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center py-8 px-4">

        {/* Top pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border border-[#E63946]/40 bg-[#E63946]/10 rounded-full px-4 py-1.5 text-[10px] sm:text-xs text-[#E63946] font-semibold tracking-widest uppercase mb-8"
        >
          Data Science · 2025 · {modelsData.length} Models · 120 AI News Stories
        </motion.div>

        {/* Staggered headline — each word animates in */}
        <div className="leading-none mb-0">
          {[
            { word: 'LLMs',     sizeClass: 'text-[clamp(4rem,12vw,10rem)]', colorClass: 'text-white'         },
            { word: 'Assemble', sizeClass: 'text-[clamp(3.5rem,11vw,9rem)]', colorClass: 'gradient-text-hero' },
          ].map(({ word, sizeClass, colorClass }, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
              className={`block font-black tracking-tight leading-none ${sizeClass} ${colorClass}`}
            >
              {word}
            </motion.div>
          ))}
        </div>

        {/* Subtitle */}
        <p className="text-center mx-auto whitespace-nowrap text-[clamp(0.7rem,1.6vw,1.1rem)] text-white/80 max-w-full tracking-[0.02em] mt-3">
          Benchmark · Compare · Rank · Calculate Costs · Find Your Model · Stay Informed
        </p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-6 w-full sm:w-auto px-4 sm:px-0"
        >
          {[
            { val: `${modelsData.length}`, label: 'Models' },
            { val: '12 Months', label: 'Data' },
            { val: '4', label: 'Evaluation Profiles' },
            { val: '120', label: 'AI News Stories' },
          ].map(({ val, label }) => (
            <div
              key={label}
              className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 text-sm whitespace-nowrap w-full sm:w-auto text-center"
            >
              <span className="text-white font-semibold">{val}</span>
              <span className="text-white/40 ml-2 font-normal">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA — scroll to section 2 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          type="button"
          onClick={scrollToSection2}
          className="mt-10 w-full sm:w-auto max-w-xs mx-auto bg-[#E63946] hover:bg-[#c8102e] text-white px-10 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 btn-glow flex items-center justify-center gap-3"
        >
          Explore the Platform
          <ArrowRight size={18} />
        </motion.button>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* ── Section 2: What is this? ─────────────────────────────────────────── */}
      <section
        ref={section2Ref}
        className="relative z-10 min-h-screen flex items-center bg-[#0F1117]"
      >
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left — statement text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs text-[#E63946] uppercase tracking-widest font-semibold mb-4">
              The Problem
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white leading-tight">
              Which LLM should you use?
            </h2>
            <p className="text-white/50 text-lg mt-6 leading-relaxed">
              Every engineering team faces this question. Vendor benchmarks are biased.
              Marketing claims are vague. Community reviews are anecdotal. You need data.
            </p>
            <p className="text-white/50 text-lg mt-4 leading-relaxed">
              LLMs Assemble collects, normalises, and analyses {modelsData.length} production
              models across 5 benchmark dimensions, 3 operational metrics, and 4 composite
              scoring profiles — then presents it all in one interactive platform.
            </p>
          </motion.div>

          {/* Right — feature highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURE_CARDS.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.button
                  key={card.label}
                  type="button"
                  initial={{ opacity: 0, x: 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    window.history.pushState({}, '', card.path)
                    onEnter()
                  }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-left hover:border-white/25 hover:bg-white/[0.08] transition-all duration-200 cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                    <Icon size={18} className={card.iconColor} />
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">{card.value}</div>
                  <div className="text-xs text-white/50 mt-1 leading-snug">{card.subtitle}</div>
                  <div className={`text-xs mt-3 font-medium ${card.textColor}`}>
                    {card.label} →
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Features ──────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center py-24 bg-[#0F1117]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 px-6"
        >
          <p className="text-xs text-[#457B9D] uppercase tracking-widest font-semibold mb-4">
            What&apos;s inside
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black text-white">
            11 ways to explore LLMs
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-6 w-full">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.button
              key={title}
              type="button"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() => setActiveFeature(activeFeature === i ? null : i)}
              className={`group bg-white/[0.03] border rounded-2xl p-6 cursor-pointer transition-all duration-300 text-left ${
                activeFeature === i
                  ? 'border-[#E63946]/60 bg-[#E63946]/[0.08]'
                  : 'border-white/[0.08] hover:border-[#E63946]/40 hover:bg-[#E63946]/[0.05]'
              }`}
            >
              <Icon
                size={24}
                className={`transition-colors duration-300 ${
                  activeFeature === i
                    ? 'text-[#E63946]'
                    : 'text-white/30 group-hover:text-[#E63946]'
                }`}
              />
              <div className="text-base font-semibold text-white mt-3">{title}</div>
              <div className="text-sm text-white/40 mt-1">{desc}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Section 4: Enter CTA ─────────────────────────────────────────────── */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Large closing headline */}
          <div className="leading-none">
            <div className="block text-[clamp(2.5rem,6vw,6rem)] font-black text-white leading-none">
              Ready to find
            </div>
            <div className="block text-[clamp(2.5rem,6vw,6rem)] font-black leading-none gradient-text-hero">
              your LLM?
            </div>
          </div>

          <p className="text-xl text-white/40 mt-6">
            {modelsData.length} models. 12 months of data. One platform.
          </p>

          {/* Enter button */}
          <button
            type="button"
            onClick={onEnter}
            className="mt-12 bg-white text-[#0F1117] hover:bg-white/90 px-12 py-5 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-3"
          >
            Enter Platform
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </section>
    </div>
  )
}
