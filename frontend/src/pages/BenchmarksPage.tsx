import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import ModelLinks from '../components/ModelLinks'
import { getClusterColor, modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Config ───────────────────────────────────────────────────────────────────

interface BenchmarkTab {
  key: keyof LLMModel
  label: string
}

const BENCHMARK_TABS: BenchmarkTab[] = [
  { key: 'mmlu_score',       label: 'MMLU'      },
  { key: 'humaneval_score',  label: 'HumanEval' },
  { key: 'math_score',       label: 'MATH'      },
  { key: 'hellaswag_score',  label: 'HellaSwag' },
  { key: 'arc_score',        label: 'ARC'       },
  { key: 'capability_score', label: 'Overall'   },
]

const ALL_COLS: { key: keyof LLMModel; label: string }[] = [
  { key: 'model_name',       label: 'Model'      },
  { key: 'cluster_label',    label: 'Cluster'    },
  { key: 'mmlu_score',       label: 'MMLU'       },
  { key: 'humaneval_score',  label: 'HumanEval'  },
  { key: 'math_score',       label: 'MATH'       },
  { key: 'hellaswag_score',  label: 'HellaSwag'  },
  { key: 'arc_score',        label: 'ARC'        },
  { key: 'capability_score', label: 'Overall'    },
]

const NUMERIC_COLS: Array<keyof LLMModel> = [
  'mmlu_score', 'humaneval_score', 'math_score',
  'hellaswag_score', 'arc_score', 'capability_score',
]

const HISTOGRAM_BUCKETS = [
  { label: '40–50', min: 40, max: 50 },
  { label: '50–60', min: 50, max: 60 },
  { label: '60–70', min: 60, max: 70 },
  { label: '70–80', min: 70, max: 80 },
  { label: '80–90', min: 80, max: 90 },
  { label: '90–100', min: 90, max: 101 },
]

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  labelStyle: { color: 'var(--text-primary)' },
}

const MEDALS = ['🥇', '🥈', '🥉']

// ── Component ────────────────────────────────────────────────────────────────

export default function BenchmarksPage() {
  const [activeBenchmark, setActiveBenchmark] = useState<keyof LLMModel>('mmlu_score')
  const [sortCol, setSortCol] = useState<keyof LLMModel>('mmlu_score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const activeTab = BENCHMARK_TABS.find((t) => t.key === activeBenchmark) ?? BENCHMARK_TABS[0]

  // ── Sorted data for bar chart ──
  const sortedForBar = [...modelsData].sort(
    (a, b) => (b[activeBenchmark] as number) - (a[activeBenchmark] as number)
  )

  const barChartData = sortedForBar.map((m, i) => ({
    name: `${i < 3 ? MEDALS[i] + ' ' : ''}${m.model_name}`,
    value: Number((m[activeBenchmark] as number).toFixed(1)),
    color: getClusterColor(m.cluster_label),
  }))

  // ── Histogram ──
  const isOverallTab = activeTab.label === 'Overall'

  const histData = isOverallTab
    ? [
        { label: '0–20%',   count: modelsData.filter((m) => m.capability_score < 0.2).length },
        { label: '20–40%',  count: modelsData.filter((m) => m.capability_score >= 0.2 && m.capability_score < 0.4).length },
        { label: '40–60%',  count: modelsData.filter((m) => m.capability_score >= 0.4 && m.capability_score < 0.6).length },
        { label: '60–80%',  count: modelsData.filter((m) => m.capability_score >= 0.6 && m.capability_score < 0.8).length },
        { label: '80–100%', count: modelsData.filter((m) => m.capability_score >= 0.8).length },
      ]
    : HISTOGRAM_BUCKETS.map((b) => ({
        label: b.label,
        count: modelsData
          .map((m) => m[activeBenchmark] as number)
          .filter((s) => s >= b.min && s < b.max).length,
      }))

  // ── OSS vs Proprietary ──
  const ossModels = modelsData.filter((m) => m.is_open_source)
  const propModels = modelsData.filter((m) => !m.is_open_source)

  function groupStats(group: LLMModel[]) {
    const vals = group.map((m) => m[activeBenchmark] as number)
    if (vals.length === 0) return { avg: 0, max: 0, min: 0, count: 0 }
    return {
      count: vals.length,
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      max: Math.max(...vals),
      min: Math.min(...vals),
    }
  }

  const ossStats = groupStats(ossModels)
  const propStats = groupStats(propModels)

  // ── Org averages ──
  const orgMap = new Map<string, number[]>()
  modelsData.forEach((m) => {
    const org = m.organization || 'Other'
    const score = isOverallTab
      ? (m.capability_score ?? 0) * 100
      : (m[activeBenchmark] as number)
    const existing = orgMap.get(org) ?? []
    existing.push(score)
    orgMap.set(org, existing)
  })
  const orgAvgs = Array.from(orgMap.entries())
    .map(([org, vals]) => ({
      org,
      avg: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
    }))
    .filter((x) => x.avg > 0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8)

  // ── Sortable table ──
  const maxVals: Record<string, number> = {}
  NUMERIC_COLS.forEach((col) => {
    maxVals[col as string] = Math.max(...modelsData.map((m) => m[col] as number))
  })

  const sortedTable = [...modelsData].sort((a, b) => {
    const av = a[sortCol]
    const bv = b[sortCol]
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'desc' ? bv - av : av - bv
    }
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv))
  })

  function handleSort(col: keyof LLMModel) {
    if (col === sortCol) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Benchmark Analysis</h1>
        <p className="text-sm text-muted mt-1">
          Performance across 5 major evaluation frameworks
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6" style={{ WebkitOverflowScrolling: "touch" }}>
        {BENCHMARK_TABS.map((tab) => (
          <button
            key={tab.key as string}
            type="button"
            onClick={() => {
              setActiveBenchmark(tab.key)
              setSortCol(tab.key)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeBenchmark === tab.key
                ? 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30'
                : 'text-muted hover:text-primary hover:bg-border/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Bar + Distribution grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
          <h2 className="text-base font-semibold text-primary mb-4">
            Rankings — {activeTab.label}
          </h2>
          <BarChart
            data={barChartData}
            orientation="horizontal"
            height={600}
            showValues
          />
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Histogram */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h2 className="text-base font-semibold text-primary mb-3">
              Score Distribution
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBarChart data={histData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#457B9D" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* OSS vs Proprietary */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Open Source', stats: ossStats },
              { label: 'Proprietary', stats: propStats },
            ].map(({ label, stats }) => (
              <div
                key={label}
                className="bg-card rounded-lg p-4 border border-border"
              >
                <div
                  className={`text-xs font-semibold mb-1 ${
                    label === 'Open Source' ? 'text-[#2A9D8F]' : 'text-[#457B9D]'
                  }`}
                >
                  {label}
                </div>
                <div className="text-xs text-muted mb-2">{stats.count} models</div>
                {[
                  ['Avg', stats.avg.toFixed(1)],
                  ['Max', stats.max.toFixed(1)],
                  ['Min', stats.min.toFixed(1)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs text-muted">{k}</span>
                    <span className="text-sm font-mono text-primary">{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Org Comparison ── */}
      <div className="bg-card rounded-xl p-6 border border-border mb-6">
        <h2 className="text-base font-semibold text-primary mb-4">
          Organization Averages
        </h2>
        <BarChart
          data={orgAvgs.map((o) => ({ name: o.org, value: o.avg, color: '#457B9D' }))}
          orientation="horizontal"
          height={Math.max(200, orgAvgs.length * 45)}
        />
      </div>

      {/* ── Sortable Table ── */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-primary">All Models</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr>
                {ALL_COLS.map((col) => (
                  <th
                    key={col.key as string}
                    className="text-left text-xs text-muted uppercase px-4 py-3
                               cursor-pointer hover:text-primary select-none whitespace-nowrap"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortCol === col.key && (
                      <span className="ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                ))}
                <th className="text-left text-xs text-muted uppercase px-4 py-3 whitespace-nowrap">
                  Links
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTable.map((m) => (
                <tr
                  key={m.model_name}
                  className={`border-t border-border hover:bg-border/30 ${
                    m.is_open_source ? 'border-l-2 border-l-[#2A9D8F]' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 text-primary text-xs font-medium whitespace-nowrap">
                    {m.model_name}
                  </td>
                  <td className="px-4 py-2.5">
                    <ClusterBadge label={m.cluster_label} size="sm" />
                  </td>
                  {NUMERIC_COLS.map((col) => {
                    const val = m[col] as number
                    const isMax = val === maxVals[col as string]
                    return (
                      <td
                        key={col as string}
                        className={`px-4 py-2.5 text-xs font-mono text-right ${
                          isMax
                            ? 'bg-[#E9C46A]/10 text-[#E9C46A] font-semibold'
                            : 'text-primary'
                        }`}
                      >
                        {col === 'capability_score' ? val.toFixed(3) : val.toFixed(1)}
                      </td>
                    )
                  })}
                  <td className="px-4 py-2.5">
                    <ModelLinks modelName={m.model_name} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
