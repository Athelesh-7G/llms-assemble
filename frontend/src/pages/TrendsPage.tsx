import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LineChart } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import { modelsData, monthlyData } from '../data/loader'
import type { MonthlySnapshot } from '../types/index'

// ── Config ───────────────────────────────────────────────────────────────────

interface MetricOption {
  key: keyof MonthlySnapshot
  label: string
}

const METRIC_OPTIONS: MetricOption[] = [
  { key: 'mmlu_score',        label: 'MMLU Score'     },
  { key: 'humaneval_score',   label: 'HumanEval'      },
  { key: 'math_score',        label: 'MATH Score'     },
  { key: 'hellaswag_score',   label: 'HellaSwag'      },
  { key: 'arc_score',         label: 'ARC Score'      },
  { key: 'tokens_per_second', label: 'Tokens/sec'     },
  { key: 'latency_ms',        label: 'Latency (ms)'   },
  { key: 'cost_input_per_1m', label: 'Cost/1M tokens' },
]

const MONTH_ABBR: Record<string, string> = {
  '2025-01': 'Jan', '2025-02': 'Feb', '2025-03': 'Mar',
  '2025-04': 'Apr', '2025-05': 'May', '2025-06': 'Jun',
  '2025-07': 'Jul', '2025-08': 'Aug', '2025-09': 'Sep',
  '2025-10': 'Oct', '2025-11': 'Nov', '2025-12': 'Dec',
}

const top5ByCapability = [...modelsData]
  .sort((a, b) => b.capability_score - a.capability_score)
  .slice(0, 5)
  .map((m) => m.model_name)

// ── Component ────────────────────────────────────────────────────────────────

export default function TrendsPage() {
  const [selectedMetric, setSelectedMetric] = useState<keyof MonthlySnapshot>('mmlu_score')
  const [selectedModels, setSelectedModels] = useState<string[]>(top5ByCapability)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeLabel =
    METRIC_OPTIONS.find((o) => o.key === selectedMetric)?.label ?? ''

  const searchResults = searchQuery
    ? modelsData
        .filter(
          (m) =>
            m.model_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedModels.includes(m.model_name)
        )
        .slice(0, 8)
    : []

  function addModel(name: string) {
    if (selectedModels.length < 8) {
      setSelectedModels((prev) => [...prev, name])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  // ── Biggest improvers ──
  interface ImproverData {
    name: string
    delta: number
    clusterLabel: string
  }

  const improvers: ImproverData[] = selectedModels
    .map((name) => {
      const jan = monthlyData.find(
        (s) => s.month === '2025-01' && s.model_name === name
      )
      const dec = monthlyData.find(
        (s) => s.month === '2025-12' && s.model_name === name
      )
      const janVal = jan?.[selectedMetric] ?? null
      const decVal = dec?.[selectedMetric] ?? null
      if (janVal === null || decVal === null) return null
      const clusterLabel =
        modelsData.find((m) => m.model_name === name)?.cluster_label ?? ''
      return { name, delta: (decVal as number) - (janVal as number), clusterLabel }
    })
    .filter((x): x is ImproverData => x !== null)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)

  // ── Cost trajectory (non-OSS only) ──
  const months = Array.from(new Set(monthlyData.map((s) => s.month))).sort()
  const costTrend = months.map((month) => {
    const rows = monthlyData.filter(
      (s) =>
        s.month === month &&
        s.cost_input_per_1m !== null &&
        (s.cost_input_per_1m as number) > 0
    )
    const avg =
      rows.length > 0
        ? rows.reduce((acc, s) => acc + (s.cost_input_per_1m as number), 0) / rows.length
        : 0
    return { month, avg_cost: parseFloat(avg.toFixed(4)) }
  })

  const janCost = costTrend[0]?.avg_cost ?? 0
  const decCost = costTrend[costTrend.length - 1]?.avg_cost ?? 0
  const costDropPct = janCost > 0 ? ((janCost - decCost) / janCost) * 100 : 0

  const isLatency = selectedMetric === 'latency_ms'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">2025 Trends</h1>
        <p className="text-sm text-muted mt-1">
          How model performance and costs evolved throughout 2025
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start mb-6">
        {/* Metric selector */}
        <select
          title="Select metric"
          value={selectedMetric as string}
          onChange={(e) => setSelectedMetric(e.target.value as keyof MonthlySnapshot)}
          className="bg-card border border-border rounded-lg px-3 py-2
                     text-primary text-sm focus:outline-none focus:border-[#457B9D]"
        >
          {METRIC_OPTIONS.map((o) => (
            <option key={o.key as string} value={o.key as string}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Model multi-select */}
        <div ref={containerRef} className="relative z-30 flex-1 min-w-[200px] max-w-sm">
          <input
            className="w-full bg-card border border-border rounded-lg px-3 py-2
                       text-primary text-sm placeholder:text-muted
                       focus:outline-none focus:ring-1 focus:ring-[#457B9D]/50 focus:border-[#457B9D]/50"
            placeholder="Add model..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 w-full top-full mt-1 bg-card
                            border border-border rounded-xl shadow-2xl backdrop-blur-sm
                            max-h-48 overflow-y-auto">
              {searchResults.map((m) => (
                <div
                  key={m.model_name}
                  className="px-4 py-3 text-sm text-primary hover:bg-border/50 cursor-pointer
                             border-b border-border/30 last:border-b-0"
                  onClick={() => addModel(m.model_name)}
                >
                  {m.model_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick buttons */}
        <button
          type="button"
          onClick={() => setSelectedModels(top5ByCapability)}
          className="text-xs px-3 py-1.5 rounded border border-border
                     text-muted hover:text-primary hover:border-[#EAEAEA] transition-colors"
        >
          Top 5
        </button>
        <button
          type="button"
          onClick={() => setSelectedModels([])}
          className="text-xs px-3 py-1.5 rounded border border-border
                     text-muted hover:text-primary hover:border-[#EAEAEA] transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Selected model chips */}
      {selectedModels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedModels.map((name) => {
            const m = modelsData.find((x) => x.model_name === name)
            return (
              <div
                key={name}
                className="flex items-center gap-1.5 bg-card border border-border
                           rounded-full pl-2 pr-1 py-1 max-w-[200px]"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    m?.cluster_label === 'Frontier'   ? 'bg-[#E63946]' :
                    m?.cluster_label === 'Balanced'   ? 'bg-[#457B9D]' :
                    m?.cluster_label === 'Efficient'  ? 'bg-[#2A9D8F]' :
                    m?.cluster_label === 'Lightweight'? 'bg-[#E9C46A]' :
                                                        'bg-[#888888]'
                  }`}
                />
                <span className="text-xs text-primary truncate">{name}</span>
                <button
                  type="button"
                  title={`Remove ${name}`}
                  onClick={() => setSelectedModels((prev) => prev.filter((x) => x !== name))}
                  className="ml-1 flex-shrink-0 w-5 h-5 flex items-center justify-center
                             rounded-full hover:bg-[#E63946]/20 text-muted hover:text-[#E63946]
                             transition-colors cursor-pointer"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Main Line Chart ── */}
      <div className="bg-card rounded-xl p-6 border border-border mb-6">
        <h2 className="text-base font-semibold text-primary mb-4">
          {activeLabel} — Monthly Trend (2025)
        </h2>
        {selectedModels.length > 0 ? (
          <LineChart
            data={monthlyData}
            models={selectedModels}
            metric={selectedMetric}
            yLabel={activeLabel}
            height={400}
            showDots
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-16">
            <TrendingUp size={40} className="text-[#2A2D3A]" />
            <p className="text-muted text-sm">Select models to view trends</p>
          </div>
        )}
        <p className="text-xs text-faint mt-3">
          Models with NaN values before their release month shown as line gaps
        </p>
      </div>

      {/* ── Biggest Improvers ── */}
      <div className="bg-card rounded-xl p-6 border border-border mb-6">
        <h2 className="text-base font-semibold text-primary mb-4">
          Biggest Improvers — Jan → Dec 2025
        </h2>
        {improvers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {improvers.map((imp) => (
              <div
                key={imp.name}
                className="bg-base rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary truncate pr-2">
                    {imp.name}
                  </span>
                  <ClusterBadge label={imp.clusterLabel} size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-[#2A9D8F] flex-shrink-0" />
                  <span className="text-lg font-bold text-[#2A9D8F]">
                    {imp.delta >= 0 ? '+' : ''}
                    {isLatency
                      ? `${imp.delta.toFixed(0)}ms`
                      : imp.delta.toFixed(2)}
                  </span>
                </div>
                {/* Sparkline */}
                <LineChart
                  data={monthlyData.filter((s) => s.model_name === imp.name)}
                  models={[imp.name]}
                  metric={selectedMetric}
                  yLabel=""
                  height={60}
                  showDots={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Select models with data in both Jan and Dec 2025 to see improvers.
          </p>
        )}
      </div>

      {/* ── Cost Trajectory ── */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-base font-semibold text-primary mb-4">
          Market Cost Compression — Avg Cost/1M Tokens (2025)
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <RechartsLineChart
            data={costTrend}
            margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(v: string) => MONTH_ABBR[v] ?? v}
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(v: number) => `$${v.toFixed(3)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              formatter={(v: number) => [`$${v.toFixed(4)}`, 'Avg Cost/1M']}
              labelFormatter={(v: string) => MONTH_ABBR[v] ?? v}
            />
            <Line
              type="monotone"
              dataKey="avg_cost"
              stroke="#E9C46A"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
        <p className="text-sm text-[#2A9D8F] mt-2">
          ↓ {costDropPct.toFixed(1)}% reduction Jan–Dec 2025
        </p>
      </div>
    </motion.div>
  )
}
