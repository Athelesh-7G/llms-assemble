import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calculator,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import ModelLinks from '../components/ModelLinks'
import { modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Cost computation ──────────────────────────────────────────────────────────
// Confirmed field names from models.json / LLMModel type:
//   cost_input_per_1m     : number  (e.g. 5.0, 0.15, 10.0)
//   cost_output_per_1m    : number  (e.g. 15.0, 0.6, 30.0)
//   effective_cost_per_1m : number  (blended rate, e.g. 10.0, 0.375)
//   is_open_source        : boolean
//   capability_score      : number  (0–1 range)
//   cluster_label         : 'Frontier'|'Balanced'|'Efficient'|'Lightweight'

function getCost(
  m: LLMModel,
  dailyReq: number,
  inTok: number,
  outTok: number,
): number {
  const DAYS     = 30
  const totalIn  = dailyReq * inTok  * DAYS
  const totalOut = dailyReq * outTok * DAYS
  const totalAll = totalIn + totalOut

  const costIn  = m.cost_input_per_1m      ?? 0
  const costOut = m.cost_output_per_1m     ?? 0
  const costEff = m.effective_cost_per_1m  ?? 0
  const isOSS   = m.is_open_source === true

  if (isOSS) {
    const rate = costEff > 0 ? costEff : costIn > 0 ? costIn : 0.80
    return (totalAll / 1_000_000) * rate
  }
  if (costIn > 0 && costOut > 0) {
    return (totalIn / 1_000_000) * costIn + (totalOut / 1_000_000) * costOut
  }
  if (costIn > 0) {
    return (totalIn / 1_000_000) * costIn + (totalOut / 1_000_000) * (costIn * 3)
  }
  if (costEff > 0) return (totalAll / 1_000_000) * costEff
  return 0
}

// ── Format helpers ────────────────────────────────────────────────────────────

function fmt(cost: number): string {
  if (cost <= 0)      return '$0.00'
  if (cost < 0.01)    return '< $0.01'
  if (cost < 1)       return `$${cost.toFixed(2)}`
  if (cost < 1000)    return `$${Math.round(cost)}`
  if (cost < 10000)   return `$${(cost / 1000).toFixed(1)}K`
  if (cost < 1000000) return `$${Math.round(cost / 1000)}K`
  return `$${(cost / 1000000).toFixed(1)}M`
}

function fmtRate(rate: number): string {
  if (!rate || rate <= 0) return '–'
  return `$${rate.toFixed(3)}`
}

function fmtTokens(t: number): string {
  if (t >= 1_000_000_000) return `${(t / 1_000_000_000).toFixed(1)}B`
  if (t >= 1_000_000)     return `${(t / 1_000_000).toFixed(1)}M`
  return `${(t / 1000).toFixed(0)}K`
}

// ── Slider color config (pre-computed Tailwind classes — no inline styles) ───

type SliderColor = 'red' | 'blue' | 'teal' | 'gold'

const SLIDER_COLORS: Record<SliderColor, {
  badge:        string
  accent:       string
  activePreset: string
}> = {
  red:  { badge: 'bg-[#E63946]/[0.12] text-[#E63946]', accent: 'accent-[#E63946]', activePreset: 'border-[#E63946] text-[#E63946] font-bold' },
  blue: { badge: 'bg-[#457B9D]/[0.12] text-[#457B9D]', accent: 'accent-[#457B9D]', activePreset: 'border-[#457B9D] text-[#457B9D] font-bold' },
  teal: { badge: 'bg-[#2A9D8F]/[0.12] text-[#2A9D8F]', accent: 'accent-[#2A9D8F]', activePreset: 'border-[#2A9D8F] text-[#2A9D8F] font-bold' },
  gold: { badge: 'bg-[#E9C46A]/[0.12] text-[#E9C46A]', accent: 'accent-[#E9C46A]', activePreset: 'border-[#E9C46A] text-[#E9C46A] font-bold' },
}

// ── Slider component ──────────────────────────────────────────────────────────

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  colorKey: SliderColor
  presets: { label: string; value: number }[]
  helper?: string
  onChange: (v: number) => void
}

function Slider({
  label, value, min, max, step, display,
  colorKey, presets, helper, onChange,
}: SliderProps) {
  const cls = SLIDER_COLORS[colorKey]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">{label}</span>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${cls.badge}`}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${cls.accent}`}
      />
      <div className="flex gap-1 mt-2 flex-wrap">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.value)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              value === p.value
                ? cls.activePreset
                : 'border-border text-muted hover:text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {helper && <p className="text-[10px] text-muted mt-1">{helper}</p>}
    </div>
  )
}

// ── KPI card config (pre-computed color classes — no inline styles) ───────────

interface KpiCardConfig {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  iconClass: string
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CostPage() {
  const [dailyRequests,   setDailyRequests]   = useState(10000)
  const [avgInputTokens,  setAvgInputTokens]  = useState(500)
  const [avgOutputTokens, setAvgOutputTokens] = useState(200)
  const [budgetLimit,     setBudgetLimit]     = useState(0)
  const [showOSSOnly,     setShowOSSOnly]     = useState(false)
  const [sortBy,          setSortBy]          = useState<'cost' | 'capability' | 'value'>('cost')

  const totalTokens = dailyRequests * (avgInputTokens + avgOutputTokens) * 30

  const computedData = useMemo(() => {
    const filtered = showOSSOnly
      ? modelsData.filter((m) => m.is_open_source === true)
      : modelsData

    return filtered
      .map((m) => {
        const monthly  = getCost(m, dailyRequests, avgInputTokens, avgOutputTokens)
        const capScore = m.capability_score ?? 0
        const within   = budgetLimit === 0 || monthly <= budgetLimit
        const value    = monthly > 0.001
          ? (capScore * 10000) / monthly
          : capScore * 10000
        return { m, monthly, within, value, capScore }
      })
      .sort((a, b) => {
        if (sortBy === 'cost')       return a.monthly - b.monthly
        if (sortBy === 'capability') return b.capScore - a.capScore
        if (sortBy === 'value')      return b.value - a.value
        return 0
      })
  }, [dailyRequests, avgInputTokens, avgOutputTokens, budgetLimit, showOSSOnly, sortBy])

  const cheapest     = [...computedData].sort((a, b) => a.monthly - b.monthly)[0]
  const bestValue    = [...computedData].sort((a, b) => b.value - a.value)[0]
  const withinBudget = computedData.filter((d) => d.within)
  const bestInBudget = [...withinBudget].sort((a, b) => b.capScore - a.capScore)[0]
  const withinCount  = withinBudget.length

  const kpiCards: KpiCardConfig[] = [
    {
      icon: <DollarSign size={20} />,
      label: 'Cheapest Option',
      value: cheapest?.m.model_name ?? '–',
      sub: cheapest ? fmt(cheapest.monthly) + '/month' : '–',
      iconClass: 'text-[#2A9D8F]',
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Best Value',
      value: bestValue?.m.model_name ?? '–',
      sub: 'Best capability per dollar',
      iconClass: 'text-[#E9C46A]',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Within Budget',
      value: String(withinCount),
      sub: `of ${computedData.length} models`,
      iconClass: 'text-[#457B9D]',
    },
    {
      icon: <Trophy size={20} />,
      label: 'Best in Budget',
      value: bestInBudget?.m.model_name ?? (budgetLimit === 0 ? 'Set a budget' : 'None'),
      sub: budgetLimit === 0 ? 'Set a budget limit above' : 'Highest capability',
      iconClass: 'text-[#E63946]',
    },
  ]

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 sm:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#E63946]/10">
          <Calculator className="text-[#E63946]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">API Cost Calculator</h1>
          <p className="text-sm text-muted mt-0.5">
            Calculate your exact monthly API spend across all {modelsData.length} models
          </p>
        </div>
      </div>

      {/* ── Sliders ── */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-primary mb-1">Your Usage</h2>
        <p className="text-xs text-muted mb-6">Adjust to match your expected API usage pattern</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Slider
            label="Daily API Requests"
            value={dailyRequests}
            min={100} max={1000000} step={100}
            display={dailyRequests >= 1000 ? `${(dailyRequests / 1000).toFixed(0)}K` : String(dailyRequests)}
            colorKey="red"
            onChange={setDailyRequests}
            presets={[
              { label: '100',  value: 100 },
              { label: '1K',   value: 1000 },
              { label: '10K',  value: 10000 },
              { label: '100K', value: 100000 },
              { label: '1M',   value: 1000000 },
            ]}
          />
          <Slider
            label="Avg Input Tokens"
            value={avgInputTokens}
            min={50} max={100000} step={50}
            display={avgInputTokens >= 1000 ? `${(avgInputTokens / 1000).toFixed(0)}K` : String(avgInputTokens)}
            colorKey="blue"
            onChange={setAvgInputTokens}
            helper={`~${Math.round(avgInputTokens / 750)} pages`}
            presets={[
              { label: '128',  value: 128 },
              { label: '500',  value: 500 },
              { label: '2K',   value: 2000 },
              { label: '8K',   value: 8000 },
              { label: '32K',  value: 32000 },
            ]}
          />
          <Slider
            label="Avg Output Tokens"
            value={avgOutputTokens}
            min={50} max={8000} step={50}
            display={String(avgOutputTokens)}
            colorKey="teal"
            onChange={setAvgOutputTokens}
            presets={[
              { label: '100', value: 100 },
              { label: '200', value: 200 },
              { label: '500', value: 500 },
              { label: '1K',  value: 1000 },
              { label: '4K',  value: 4000 },
            ]}
          />
          <Slider
            label="Monthly Budget"
            value={budgetLimit}
            min={0} max={10000} step={10}
            display={budgetLimit === 0 ? 'No Limit' : `$${budgetLimit}`}
            colorKey="gold"
            onChange={setBudgetLimit}
            helper="Models over budget shown in red"
            presets={[
              { label: 'No Limit', value: 0 },
              { label: '$50',      value: 50 },
              { label: '$200',     value: 200 },
              { label: '$500',     value: 500 },
              { label: '$2K',      value: 2000 },
            ]}
          />
        </div>

        {/* Token summary */}
        <div className="mt-6 bg-border/20 rounded-lg px-4 py-2.5 text-center">
          <span className="text-xs text-muted">
            Total monthly tokens:{' '}
            <span className="font-mono font-bold text-primary">
              {fmtTokens(totalTokens)}
            </span>
            {' '}({dailyRequests.toLocaleString()} req/day × {(avgInputTokens + avgOutputTokens).toLocaleString()} tokens avg)
          </span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-3 ${card.iconClass}`}>
              {card.icon}
              <span className="text-xs font-medium text-muted">{card.label}</span>
            </div>
            <div
              className="text-lg font-bold text-primary leading-tight truncate"
              title={card.value}
            >
              {card.value}
            </div>
            <div className="text-xs text-muted mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Sort + Filter row ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(['cost', 'capability', 'value'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSortBy(s)}
            className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
              sortBy === s
                ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30 font-semibold'
                : 'bg-card border-border text-muted hover:text-primary'
            }`}
          >
            Sort by {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted">Open Source only</span>
          <button
            type="button"
            title="Toggle Open Source only"
            aria-label={`Open Source only: ${showOSSOnly ? 'on' : 'off'}`}
            onClick={() => setShowOSSOnly((v) => !v)}
            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${
              showOSSOnly ? 'bg-[#2A9D8F]' : 'bg-border'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              showOSSOnly ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-border/30">
                {['#', 'Model', 'Cluster', 'Monthly Cost', 'Input /1M', 'Output /1M', 'Capability', 'Links'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computedData.map(({ m, monthly, within, capScore }, idx) => {
                const overBudget = budgetLimit > 0 && !within
                return (
                  <tr
                    key={m.model_name}
                    className={`border-b border-border/50 transition-colors hover:bg-border/20 ${
                      overBudget ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 text-xs text-muted font-mono">{idx + 1}</td>

                    {/* Model name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary whitespace-nowrap">
                          {m.model_name}
                        </span>
                        {m.is_open_source && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#2A9D8F]/15 text-[#2A9D8F] rounded font-semibold">
                            OSS
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cluster */}
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-border/50 text-muted whitespace-nowrap">
                        {m.cluster_label}
                      </span>
                    </td>

                    {/* Monthly cost */}
                    <td className="px-4 py-3">
                      <div className={`font-mono font-bold text-sm ${overBudget ? 'text-[#E63946]' : 'text-[#2A9D8F]'}`}>
                        {fmt(monthly)}
                      </div>
                      {overBudget && (
                        <div className="text-[9px] text-[#E63946] font-semibold">over budget</div>
                      )}
                    </td>

                    {/* Input rate */}
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {m.is_open_source ? '~$0.80' : fmtRate(m.cost_input_per_1m)}
                    </td>

                    {/* Output rate */}
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {m.is_open_source ? '~$0.80' : fmtRate(m.cost_output_per_1m)}
                    </td>

                    {/* Capability bar — width is per-row dynamic, inline style unavoidable */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-border/30 rounded-full h-1.5 min-w-[60px]">
                          <div
                            className="h-1.5 rounded-full bg-[#457B9D]"
                            style={{ width: `${capScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted w-8 text-right">
                          {(capScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-4 py-3">
                      <ModelLinks modelName={m.model_name} size="sm" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
