import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Search, X } from 'lucide-react'
import { RadarChart } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import ModelLinks from '../components/ModelLinks'
import { getClusterColor, getTopNByProfile, modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Metric comparison config ─────────────────────────────────────────────────

interface MetricConfig {
  key: keyof LLMModel
  label: string
  higherIsBetter: boolean
  format: (v: number) => string
}

const COMPARE_METRICS: MetricConfig[] = [
  { key: 'mmlu_score',        label: 'MMLU',         higherIsBetter: true,  format: (v) => v.toFixed(1) },
  { key: 'humaneval_score',   label: 'HumanEval',    higherIsBetter: true,  format: (v) => v.toFixed(1) },
  { key: 'math_score',        label: 'MATH',         higherIsBetter: true,  format: (v) => v.toFixed(1) },
  { key: 'capability_score',  label: 'Capability',   higherIsBetter: true,  format: (v) => v.toFixed(3) },
  { key: 'efficiency_score',  label: 'Efficiency',   higherIsBetter: true,  format: (v) => v.toFixed(3) },
  { key: 'tokens_per_second', label: 'Speed (TPS)',  higherIsBetter: true,  format: (v) => v.toFixed(0) },
  { key: 'latency_ms',        label: 'Latency',      higherIsBetter: false, format: (v) => `${v.toFixed(0)}ms` },
  { key: 'cost_input_per_1m', label: 'Cost/1M',      higherIsBetter: false, format: (v) => `$${v.toFixed(4)}` },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function ComparisonPage() {
  const defaultSelected = getTopNByProfile('balanced', 2).map((m) => m.model_name)
  const [selectedModels, setSelectedModels] = useState<string[]>(defaultSelected)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [maxWarn, setMaxWarn] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedModelData: LLMModel[] = selectedModels
    .map((name) => modelsData.find((m) => m.model_name === name))
    .filter((m): m is LLMModel => m !== undefined)

  const searchResults: LLMModel[] = searchQuery
    ? modelsData
        .filter(
          (m) =>
            m.model_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedModels.includes(m.model_name)
        )
        .slice(0, 8)
    : []

  function addModel(name: string) {
    if (selectedModels.length >= 4) {
      setMaxWarn(true)
      setTimeout(() => setMaxWarn(false), 2000)
    } else {
      setSelectedModels((prev) => [...prev, name])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  function removeModel(name: string) {
    setSelectedModels((prev) => prev.filter((m) => m !== name))
  }

  // Winner table helpers
  function getWinner(metric: MetricConfig): string | null {
    if (selectedModelData.length < 2) return null
    const vals = selectedModelData.map((m) => m[metric.key] as number)
    const best = metric.higherIsBetter ? Math.max(...vals) : Math.min(...vals)
    const winners = selectedModelData.filter((m) => (m[metric.key] as number) === best)
    return winners.length === 1 ? winners[0].model_name : null
  }

  const winCounts: Record<string, number> = {}
  selectedModels.forEach((n) => { winCounts[n] = 0 })
  COMPARE_METRICS.forEach((metric) => {
    const w = getWinner(metric)
    if (w) winCounts[w] = (winCounts[w] ?? 0) + 1
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Model Comparison</h1>
        <p className="text-sm text-muted mt-1">Select up to 4 models to compare side by side</p>
      </div>

      {/* ── Model Selector ── */}
      <div ref={containerRef} className="relative z-30 mb-2">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5
                       text-primary text-sm placeholder:text-muted
                       focus:outline-none focus:ring-1 focus:ring-[#457B9D]/50 focus:border-[#457B9D]/50"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full max-w-md top-full mt-1 bg-card
                          border border-border rounded-xl shadow-2xl backdrop-blur-sm
                          max-h-64 overflow-y-auto">
            {searchResults.map((m) => (
              <div
                key={m.model_name}
                className="flex items-center justify-between px-4 py-3
                           hover:bg-border/50 cursor-pointer
                           border-b border-border/30 last:border-b-0 text-primary text-sm"
                onClick={() => addModel(m.model_name)}
              >
                <span>{m.model_name}</span>
                <ClusterBadge label={m.cluster_label} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {maxWarn && (
        <p className="text-xs text-[#E63946] mb-2">Maximum 4 models</p>
      )}

      {/* Selected chips */}
      {selectedModels.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedModelData.map((m) => (
            <div
              key={m.model_name}
              className="flex items-center gap-2 bg-card border border-border
                         rounded-full pl-2 pr-1 py-1.5 max-w-[200px]"
            >
              <ClusterBadge label={m.cluster_label} size="sm" />
              <span className="text-sm text-primary truncate">{m.model_name}</span>
              <button
                type="button"
                title={`Remove ${m.model_name}`}
                onClick={() => removeModel(m.model_name)}
                className="ml-1 flex-shrink-0 w-5 h-5 flex items-center justify-center
                           rounded-full hover:bg-[#E63946]/20 text-muted hover:text-[#E63946]
                           transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20">
          <GitCompare size={40} className="text-[#2A2D3A]" />
          <p className="text-muted text-sm">Select at least one model to begin</p>
          <p className="text-faint text-xs">Use the search above to find models</p>
        </div>
      )}

      {/* ── Radar Chart ── */}
      {selectedModels.length >= 2 && (
        <div className="bg-card rounded-xl p-6 border border-border mt-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Benchmark Comparison</h2>
          <RadarChart
            models={selectedModelData}
            metrics={['mmlu_score', 'humaneval_score', 'math_score', 'hellaswag_score', 'arc_score']}
            height={380}
          />
        </div>
      )}

      {/* ── Metric Cards ── */}
      {selectedModels.length >= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {selectedModelData.map((m) => (
            <motion.div
              key={m.model_name}
              className="bg-card rounded-xl p-5 border border-border"
              style={{ borderTopColor: getClusterColor(m.cluster_label), borderTopWidth: 4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="font-bold text-primary text-sm">{m.model_name}</div>
              <div className="text-xs text-muted mt-0.5">{m.organization}</div>
              <div className="mt-2">
                <ClusterBadge label={m.cluster_label} size="sm" />
              </div>

              <p className="text-xs text-muted uppercase tracking-wider mt-4 mb-2">
                Performance Scores
              </p>
              <div className="space-y-2">
                <MetricBar label="Capability" value={m.capability_score} color={getClusterColor(m.cluster_label)} />
                <MetricBar label="Efficiency" value={m.efficiency_score} color="#E9C46A" />
                <MetricBar label="Speed"      value={m.speed_score}      color="#2A9D8F" />
              </div>

              <p className="text-xs text-muted uppercase tracking-wider mt-4 mb-2">Raw Metrics</p>
              <div className="space-y-1">
                {[
                  ['MMLU',        m.mmlu_score.toFixed(1)],
                  ['HumanEval',   m.humaneval_score.toFixed(1)],
                  ['TPS',         m.tokens_per_second.toFixed(0)],
                  ['Latency',     `${m.latency_ms.toFixed(0)}ms`],
                  ['Cost/1M',     `$${m.cost_input_per_1m}`],
                  ['Context',     `${m.context_window_k}K`],
                  ['Params',      `${m.parameter_size_b}B`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs text-muted">{k}</span>
                    <span className="text-xs text-primary font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <ModelLinks modelName={m.model_name} size="sm" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Winner Table ── */}
      {selectedModels.length >= 2 && (
        <div className="bg-card rounded-xl p-6 border border-border mt-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Head-to-Head: Who Wins Where?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 bg-card">
                  <th className="text-left text-xs text-muted uppercase py-2 pr-4">Metric</th>
                  {selectedModelData.map((m) => (
                    <th
                      key={m.model_name}
                      className="text-xs text-muted uppercase py-2 px-2 text-center"
                    >
                      {m.model_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_METRICS.map((metric) => {
                  const winner = getWinner(metric)
                  return (
                    <tr key={metric.key} className="border-t border-border">
                      <td className="text-muted font-medium py-2 pr-4 text-xs">{metric.label}</td>
                      {selectedModelData.map((m) => {
                        const isWinner = winner === m.model_name
                        return (
                          <td key={m.model_name} className="py-2 px-2 text-center">
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded ${
                                isWinner
                                  ? 'bg-[#E9C46A]/15 text-[#E9C46A] font-bold'
                                  : 'text-primary'
                              }`}
                            >
                              {metric.format(m[metric.key] as number)}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-border">
                  <td className="text-xs text-muted font-bold py-2 pr-4">Wins</td>
                  {selectedModelData.map((m) => (
                    <td key={m.model_name} className="text-center py-2 px-2">
                      <span className="text-sm font-bold text-[#E9C46A]">
                        {winCounts[m.model_name] ?? 0}
                      </span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
