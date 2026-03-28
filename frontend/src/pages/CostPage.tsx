import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, CheckCircle, DollarSign, TrendingUp, Trophy } from 'lucide-react'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import ModelLinks from '../components/ModelLinks'
import StatCard from '../components/StatCard'
import { getClusterColor, modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS_PER_MONTH = 30
const OSS_FALLBACK_COST = 0.80 // $/1M tokens estimated hosting cost if no effective_cost_per_1m

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCost(cost: number): string {
  if (cost < 0.01) return '<$0.01'
  if (cost < 1)    return `$${cost.toFixed(2)}`
  if (cost < 1000) return `$${cost.toFixed(0)}`
  if (cost < 10000) return `$${(cost / 1000).toFixed(1)}K`
  return `$${(cost / 1000).toFixed(0)}K`
}

function computeMonthlyCostFor(
  model: LLMModel,
  dailyRequests: number,
  avgInputTokens: number,
  avgOutputTokens: number,
): number {
  if (model.is_open_source) {
    const effectiveCost = model.effective_cost_per_1m > 0 ? model.effective_cost_per_1m : OSS_FALLBACK_COST
    const totalTokens = dailyRequests * (avgInputTokens + avgOutputTokens) * DAYS_PER_MONTH
    return (totalTokens / 1_000_000) * effectiveCost
  }
  const outputRate = model.cost_output_per_1m > 0 ? model.cost_output_per_1m : model.cost_input_per_1m * 3
  const inputCost  = (dailyRequests * avgInputTokens  * DAYS_PER_MONTH / 1_000_000) * model.cost_input_per_1m
  const outputCost = (dailyRequests * avgOutputTokens * DAYS_PER_MONTH / 1_000_000) * outputRate
  return inputCost + outputCost
}

// ── Slider + presets ──────────────────────────────────────────────────────────

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  color: string
  badge: string
  presets: { label: string; value: number }[]
  helper?: string
  onChange: (v: number) => void
}

function SliderControl({ label, value, min, max, step, color, badge, presets, helper, onChange }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">{label}</span>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${color}20`, color }}>
          {badge}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border"
        style={{ accentColor: color }}
      />
      <div className="flex gap-1 mt-2 flex-wrap">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.value)}
            className="text-[10px] bg-border/50 rounded px-1.5 py-0.5 cursor-pointer hover:bg-[#E63946]/10 hover:text-[#E63946] text-muted transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
      {helper && <div className="text-[10px] text-muted mt-1">{helper}</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CostPage() {
  const [dailyRequests, setDailyRequests]     = useState(1000)
  const [avgInputTokens, setAvgInputTokens]   = useState(500)
  const [avgOutputTokens, setAvgOutputTokens] = useState(200)
  const [showOSSOnly, setShowOSSOnly]         = useState(false)
  const [sortBy, setSortBy]                   = useState<'cost' | 'capability' | 'value'>('cost')
  const [highlightedModel, setHighlightedModel] = useState<string | null>(null)
  const [budgetLimit, setBudgetLimit]         = useState(500)

  const totalMonthlyTokens = dailyRequests * (avgInputTokens + avgOutputTokens) * DAYS_PER_MONTH

  const computedData = useMemo(() => {
    return modelsData
      .filter((m) => !showOSSOnly || m.is_open_source)
      .map((m) => {
        const monthlyCost = computeMonthlyCostFor(m, dailyRequests, avgInputTokens, avgOutputTokens)
        return {
          model: m,
          monthlyCost,
          withinBudget: budgetLimit === 0 || monthlyCost <= budgetLimit,
          valueScore: monthlyCost > 0
            ? (m.capability_score / monthlyCost) * 1000
            : m.capability_score * 1000,
        }
      })
      .sort((a, b) => {
        if (sortBy === 'cost')       return a.monthlyCost - b.monthlyCost
        if (sortBy === 'capability') return b.model.capability_score - a.model.capability_score
        if (sortBy === 'value')      return b.valueScore - a.valueScore
        return 0
      })
  }, [dailyRequests, avgInputTokens, avgOutputTokens, showOSSOnly, sortBy, budgetLimit])

  const maxCost          = Math.max(...computedData.map((d) => d.monthlyCost), 1)
  const cheapestModel    = [...computedData].sort((a, b) => a.monthlyCost - b.monthlyCost)[0]
  const bestValueModel   = [...computedData].sort((a, b) => b.valueScore - a.valueScore)[0]
  const withinBudgetCount = computedData.filter((d) => d.withinBudget).length
  const bestInBudget     = computedData
    .filter((d) => d.withinBudget)
    .sort((a, b) => b.model.capability_score - a.model.capability_score)[0]

  function getCostBreakdown(m: LLMModel) {
    const daily   = computeMonthlyCostFor(m, dailyRequests, avgInputTokens, avgOutputTokens) / DAYS_PER_MONTH
    const weekly  = daily * 7
    const monthly = daily * DAYS_PER_MONTH
    return { daily, weekly, monthly }
  }

  function getAtScale(m: LLMModel, reqs: number) {
    return computeMonthlyCostFor(m, reqs, avgInputTokens, avgOutputTokens)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Calculator size={22} className="text-[#E63946]" />
        <div>
          <h1 className="text-2xl font-bold text-primary">API Cost Calculator</h1>
          <p className="text-sm text-muted mt-0.5">
            Calculate your exact monthly API spend across all {modelsData.length} models for your usage pattern
          </p>
        </div>
      </div>

      {/* ── Section 1: Controls ── */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="mb-6">
          <div className="text-lg font-semibold text-primary">Your Usage</div>
          <div className="text-xs text-muted mt-0.5">Adjust sliders to match your expected API usage</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SliderControl
            label="Daily API Requests"
            value={dailyRequests}
            min={100}
            max={1000000}
            step={100}
            color="#E63946"
            badge={dailyRequests.toLocaleString()}
            presets={[
              { label: '100', value: 100 },
              { label: '1K', value: 1000 },
              { label: '10K', value: 10000 },
              { label: '100K', value: 100000 },
              { label: '1M', value: 1000000 },
            ]}
            onChange={setDailyRequests}
          />
          <SliderControl
            label="Avg Input Tokens"
            value={avgInputTokens}
            min={50}
            max={100000}
            step={50}
            color="#457B9D"
            badge={avgInputTokens.toLocaleString()}
            presets={[
              { label: '128', value: 128 },
              { label: '500', value: 500 },
              { label: '2K', value: 2000 },
              { label: '8K', value: 8000 },
              { label: '32K', value: 32000 },
            ]}
            helper={`~${Math.round(avgInputTokens / 750)} pages`}
            onChange={setAvgInputTokens}
          />
          <SliderControl
            label="Avg Output Tokens"
            value={avgOutputTokens}
            min={50}
            max={8000}
            step={50}
            color="#2A9D8F"
            badge={avgOutputTokens.toLocaleString()}
            presets={[
              { label: '100', value: 100 },
              { label: '200', value: 200 },
              { label: '500', value: 500 },
              { label: '1K', value: 1000 },
              { label: '4K', value: 4000 },
            ]}
            onChange={setAvgOutputTokens}
          />
          <SliderControl
            label="Budget Limit"
            value={budgetLimit}
            min={0}
            max={10000}
            step={10}
            color="#E9C46A"
            badge={`$${budgetLimit.toLocaleString()}`}
            presets={[
              { label: '$10', value: 10 },
              { label: '$50', value: 50 },
              { label: '$200', value: 200 },
              { label: '$500', value: 500 },
              { label: '$2K', value: 2000 },
            ]}
            helper="Models over budget shown in red"
            onChange={setBudgetLimit}
          />
        </div>

        <div className="mt-5 bg-border/20 rounded-lg px-4 py-2.5 text-xs text-muted text-center">
          Total monthly tokens:{' '}
          <span className="font-mono font-semibold text-primary">
            {totalMonthlyTokens >= 1_000_000_000
              ? `${(totalMonthlyTokens / 1_000_000_000).toFixed(1)}B`
              : `${(totalMonthlyTokens / 1_000_000).toFixed(1)}M`}
          </span>
          {' '}({dailyRequests.toLocaleString()} req/day ×{' '}
          {(avgInputTokens + avgOutputTokens).toLocaleString()} tokens avg)
        </div>
      </div>

      {/* ── Section 2: KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<DollarSign size={18} />}
          value={cheapestModel?.model.model_name ?? '—'}
          label="Cheapest Option"
          color="#2A9D8F"
          subtitle={formatCost(cheapestModel?.monthlyCost ?? 0) + '/month'}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          value={bestValueModel?.model.model_name ?? '—'}
          label="Best Value"
          color="#E9C46A"
          subtitle="Best capability per dollar"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          value={withinBudgetCount}
          label="Within Budget"
          color="#457B9D"
          animateCount
          subtitle={`of ${computedData.length} models`}
        />
        <StatCard
          icon={<Trophy size={18} />}
          value={bestInBudget?.model.model_name ?? 'None'}
          label="Best in Budget"
          color="#E63946"
          subtitle="Highest benchmark scores"
        />
      </div>

      {/* ── Section 3: Filters ── */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        {(['cost', 'capability', 'value'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSortBy(s)}
            className={`px-4 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
              sortBy === s
                ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30'
                : 'bg-card border-border text-muted hover:text-primary'
            }`}
          >
            Sort by {s === 'cost' ? 'Cost' : s === 'capability' ? 'Capability' : 'Value'}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted">Open Source only</span>
          <button
            type="button"
            onClick={() => setShowOSSOnly((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              showOSSOnly ? 'bg-[#2A9D8F]' : 'bg-border'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              showOSSOnly ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* ── Section 4: Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10 border-b border-border">
              <tr>
                {['Model', 'Cluster', 'Monthly Cost', 'Cost Bar', 'Input/1M', 'Output/1M', 'Capability', 'Value Score'].map((h) => (
                  <th key={h} className="text-left text-xs text-muted uppercase px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computedData.map(({ model: m, monthlyCost, withinBudget, valueScore }) => {
                const isHighlighted = highlightedModel === m.model_name
                const barWidth = Math.max((monthlyCost / maxCost) * 100, 1)
                const clusterColor = getClusterColor(m.cluster_label)
                const breakdown = isHighlighted ? getCostBreakdown(m) : null

                return (
                  <>
                    <tr
                      key={m.model_name}
                      onClick={() => setHighlightedModel(isHighlighted ? null : m.model_name)}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-[#E63946]/5'
                          : withinBudget
                          ? 'hover:bg-border/20'
                          : 'bg-[#E63946]/3 hover:bg-[#E63946]/8'
                      }`}
                    >
                      {/* Model name */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${withinBudget ? 'text-primary' : 'text-[#E63946]/70'}`}>
                            {m.model_name}
                          </span>
                          {m.is_open_source && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#2A9D8F]/10 text-[#2A9D8F]">
                              OSS
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Cluster */}
                      <td className="px-4 py-2.5">
                        <ClusterBadge label={m.cluster_label} size="sm" />
                      </td>
                      {/* Monthly Cost */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className={`text-sm font-mono font-bold ${withinBudget ? 'text-[#2A9D8F]' : 'text-[#E63946]'}`}>
                          {formatCost(monthlyCost)}
                        </div>
                        {!withinBudget && (
                          <div className="text-[9px] text-[#E63946] font-medium">over budget</div>
                        )}
                      </td>
                      {/* Cost bar */}
                      <td className="px-4 py-2.5">
                        <div className="w-24 bg-border/30 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%`, backgroundColor: clusterColor }}
                          />
                        </div>
                      </td>
                      {/* Input/1M */}
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">
                        {m.is_open_source ? '~$0.80' : `$${m.cost_input_per_1m.toFixed(3)}`}
                      </td>
                      {/* Output/1M */}
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">
                        {m.is_open_source ? '~$0.80' : `$${m.cost_output_per_1m.toFixed(3)}`}
                      </td>
                      {/* Capability */}
                      <td className="px-4 py-2.5">
                        <div className="w-20">
                          <MetricBar label="" value={m.capability_score} color={clusterColor} />
                        </div>
                      </td>
                      {/* Value score */}
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">
                        {valueScore > 100 ? '>100' : valueScore.toFixed(1)}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isHighlighted && breakdown && (
                      <tr key={`${m.model_name}-expanded`} className="bg-card border-b border-border">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Cost breakdown */}
                            <div className="bg-border/20 rounded-xl p-4">
                              <div className="text-xs text-muted uppercase tracking-wider mb-3">Cost Breakdown</div>
                              {[
                                ['Daily',   breakdown.daily],
                                ['Weekly',  breakdown.weekly],
                                ['Monthly', breakdown.monthly],
                              ].map(([label, val]) => (
                                <div key={label as string} className="flex justify-between mb-1.5">
                                  <span className="text-xs text-muted">{label as string}</span>
                                  <span className="text-xs font-mono font-semibold text-primary">{formatCost(val as number)}</span>
                                </div>
                              ))}
                            </div>
                            {/* At scale */}
                            <div className="bg-border/20 rounded-xl p-4">
                              <div className="text-xs text-muted uppercase tracking-wider mb-3">At Scale (monthly)</div>
                              {[
                                ['10K req/day',  getAtScale(m, 10000)],
                                ['100K req/day', getAtScale(m, 100000)],
                                ['1M req/day',   getAtScale(m, 1000000)],
                              ].map(([label, val]) => (
                                <div key={label as string} className="flex justify-between mb-1.5">
                                  <span className="text-xs text-muted">{label as string}</span>
                                  <span className="text-xs font-mono font-semibold text-primary">{formatCost(val as number)}</span>
                                </div>
                              ))}
                            </div>
                            {/* Links */}
                            <div className="bg-border/20 rounded-xl p-4">
                              <div className="text-xs text-muted uppercase tracking-wider mb-3">Quick Actions</div>
                              <ModelLinks modelName={m.model_name} size="sm" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  )
}
