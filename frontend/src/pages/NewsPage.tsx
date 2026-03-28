import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Newspaper } from 'lucide-react'
import { NEWS_DATA } from '../data/newsData'
import type { NewsItem } from '../data/newsData'

// ── Constants ────────────────────────────────────────────────────────────────

const IMPACT_STYLES: Record<NewsItem['impact'], { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-[#E63946]/15', text: 'text-[#E63946]', dot: 'bg-[#E63946]' },
  High:     { bg: 'bg-[#E9C46A]/15', text: 'text-[#E9C46A]', dot: 'bg-[#E9C46A]' },
  Medium:   { bg: 'bg-[#457B9D]/15', text: 'text-[#457B9D]', dot: 'bg-[#457B9D]' },
}

const RANK_COLORS = ['#E9C46A', '#C0C0C0', '#CD7F32']

// ── Sub-components ───────────────────────────────────────────────────────────

function ImpactBadge({ impact }: { impact: NewsItem['impact'] }) {
  const s = IMPACT_STYLES[impact]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {impact}
    </span>
  )
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-border/60 text-muted">
      {label}
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const color = rank <= 3 ? RANK_COLORS[rank - 1] : 'var(--text-muted)'
  const size = rank <= 3 ? 'w-7 h-7 text-sm font-bold' : 'w-6 h-6 text-xs font-semibold'
  return (
    <div
      className={`flex-shrink-0 rounded-full flex items-center justify-center ${size}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {rank}
    </div>
  )
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-card rounded-xl border border-border hover:border-border/80 transition-colors"
    >
      <button
        type="button"
        className="w-full text-left p-5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Top row */}
        <div className="flex items-start gap-3">
          <RankBadge rank={item.rank} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <ImpactBadge impact={item.impact} />
              <CategoryBadge label={item.category} />
            </div>
            <h3 className="text-sm font-semibold text-primary leading-snug">{item.title}</h3>
          </div>
        </div>

        {/* Expand indicator */}
        <div className="mt-2 ml-10 text-xs text-muted">
          {expanded ? '↑ Show less' : '↓ Read more'}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 ml-10">
              <p className="text-sm text-muted leading-relaxed mb-3">{item.summary}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-border/50 text-muted font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Source */}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#457B9D] hover:text-[#457B9D]/80 transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={11} />
                {item.source}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [activeMonth, setActiveMonth] = useState(NEWS_DATA[0].month)

  const activeData = NEWS_DATA.find((d) => d.month === activeMonth) ?? NEWS_DATA[0]

  const criticalCount = activeData.stories.filter((s) => s.impact === 'Critical').length
  const highCount     = activeData.stories.filter((s) => s.impact === 'High').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Newspaper size={20} className="text-[#E63946]" />
          <h1 className="text-2xl font-bold text-primary">Top AI News 2025</h1>
        </div>
        <p className="text-sm text-muted">
          The 10 most important AI stories from each month of 2025
        </p>
      </div>

      {/* ── Month Tabs ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        {NEWS_DATA.map((d) => (
          <button
            key={d.month}
            type="button"
            onClick={() => setActiveMonth(d.month)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeMonth === d.month
                ? 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30'
                : 'text-muted hover:text-primary hover:bg-border/40'
            }`}
          >
            {d.monthLabel}
          </button>
        ))}
      </div>

      {/* ── Month Summary Bar ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMonth + '-header'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-xl border border-border p-5 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">
                {activeData.monthLabel} {activeData.year}
              </div>
              <p className="text-base font-semibold text-primary leading-snug max-w-2xl">
                {activeData.headline}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="text-center">
                <div className="text-lg font-bold text-[#E63946]">{criticalCount}</div>
                <div className="text-[10px] text-muted">Critical</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-lg font-bold text-[#E9C46A]">{highCount}</div>
                <div className="text-[10px] text-muted">High</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-lg font-bold text-primary">10</div>
                <div className="text-[10px] text-muted">Stories</div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Stories Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMonth + '-stories'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"
        >
          {activeData.stories.map((story, i) => (
            <NewsCard key={story.rank} item={story} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
