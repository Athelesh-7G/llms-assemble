import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Code2,
  DollarSign,
  FlaskConical,
  Layers,
  MessageSquare,
  X,
} from 'lucide-react'
import { SensitivityHeatmap } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import ModelLinks from '../components/ModelLinks'
import { getClusterColor, modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Weights {
  capability: number
  efficiency: number
  cost: number
  speed: number
}

type RankedModel = LLMModel & { liveScore: number }

// ── Use cases ────────────────────────────────────────────────────────────────

interface UseCase {
  id: string
  label: string
  icon: React.ElementType
  description: string
  weights: Weights
  highlight: keyof LLMModel | null
}

const USE_CASES: UseCase[] = [
  {
    id: 'General',
    label: 'General Purpose',
    icon: Layers,
    description: 'Balanced across all tasks',
    weights: { capability: 0.40, efficiency: 0.20, cost: 0.20, speed: 0.20 },
    highlight: null,
  },
  {
    id: 'Coding',
    label: 'Coding & Dev',
    icon: Code2,
    description: 'Code generation, debugging, PR reviews',
    weights: { capability: 0.50, efficiency: 0.20, cost: 0.15, speed: 0.15 },
    highlight: 'humaneval_score',
  },
  {
    id: 'Agentic',
    label: 'Agentic Workflows',
    icon: Bot,
    description: 'Multi-step autonomous task execution',
    weights: { capability: 0.45, efficiency: 0.30, cost: 0.15, speed: 0.10 },
    highlight: 'capability_score',
  },
  {
    id: 'Customer',
    label: 'Customer Agents',
    icon: MessageSquare,
    description: 'Support bots, conversational AI, low latency',
    weights: { capability: 0.25, efficiency: 0.20, cost: 0.25, speed: 0.30 },
    highlight: 'speed_score',
  },
  {
    id: 'Research',
    label: 'Research',
    icon: FlaskConical,
    description: 'Deep reasoning, math, science',
    weights: { capability: 0.60, efficiency: 0.15, cost: 0.10, speed: 0.15 },
    highlight: 'math_score',
  },
  {
    id: 'Budget',
    label: 'Cost Optimised',
    icon: DollarSign,
    description: 'Maximum value per dollar',
    weights: { capability: 0.20, efficiency: 0.20, cost: 0.45, speed: 0.15 },
    highlight: 'cost_norm',
  },
]

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: Record<string, Weights> = {
  'Balanced':       { capability: 0.40, efficiency: 0.20, cost: 0.20, speed: 0.20 },
  'Research':       { capability: 0.60, efficiency: 0.15, cost: 0.10, speed: 0.15 },
  'Production':     { capability: 0.25, efficiency: 0.25, cost: 0.30, speed: 0.20 },
  'Cost-Sensitive': { capability: 0.20, efficiency: 0.20, cost: 0.45, speed: 0.15 },
}

const DIMENSION_ACCENTS: Record<keyof Weights, string> = {
  capability: 'text-[#E63946]',
  efficiency: 'text-[#2A9D8F]',
  cost:       'text-[#E9C46A]',
  speed:      'text-[#457B9D]',
}

// ── Highlight helpers ─────────────────────────────────────────────────────────

const HIGHLIGHT_TO_COL: Record<string, string> = {
  humaneval_score: 'Cap',
  capability_score: 'Cap',
  speed_score:      'Speed',
  math_score:       'Cap',
  cost_norm:        'Cost',
}

const HIGHLIGHT_DISPLAY: Record<string, string> = {
  humaneval_score: 'HumanEval',
  capability_score: 'Capability',
  speed_score:      'Speed',
  math_score:       'MATH',
  cost_norm:        'Cost Efficiency',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function presetsEqual(w: Weights, preset: Weights): boolean {
  return (
    Math.abs(w.capability - preset.capability) < 0.001 &&
    Math.abs(w.efficiency - preset.efficiency) < 0.001 &&
    Math.abs(w.cost      - preset.cost)       < 0.001 &&
    Math.abs(w.speed     - preset.speed)      < 0.001
  )
}

const TABLE_HEADERS = ['#', 'Model', 'Org', 'Cluster', 'Score', 'Cap', 'Eff', 'Speed', 'Cost', 'TPS', 'Latency', '$/1M']

// ── Component ─────────────────────────────────────────────────────────────────

export default function RankingPage() {
  const [weights, setWeights]           = useState<Weights>(PRESETS['Balanced'])
  const [activeUseCase, setActiveUseCase] = useState('General')
  const [selectedModel, setSelectedModel] = useState<RankedModel | null>(null)
  const [drawerOpen, setDrawerOpen]     = useState(false)

  const rankedModels = useMemo<RankedModel[]>(() => {
    const total = weights.capability + weights.efficiency + weights.cost + weights.speed
    const w = total > 0
      ? {
          capability: weights.capability / total,
          efficiency: weights.efficiency / total,
          cost:       weights.cost       / total,
          speed:      weights.speed      / total,
        }
      : { capability: 0.25, efficiency: 0.25, cost: 0.25, speed: 0.25 }
    return [...modelsData]
      .map((m) => ({
        ...m,
        liveScore:
          w.capability * m.capability_score +
          w.efficiency * m.efficiency_score +
          w.cost       * m.cost_norm +
          w.speed      * m.speed_score,
      }))
      .sort((a, b) => b.liveScore - a.liveScore)
  }, [weights])

  function handleSliderChange(key: keyof Weights, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }))
  }

  function openDrawer(model: RankedModel) {
    setSelectedModel(model)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setTimeout(() => setSelectedModel(null), 300)
  }

  function rankBadge(rank: number) {
    if (rank === 1) return 'bg-[#E9C46A] text-black'
    if (rank === 2) return 'bg-[#888] text-white'
    if (rank === 3) return 'bg-[#CD7F32] text-white'
    return null
  }

  const profileRanks: Array<{ label: string; rankKey: keyof LLMModel }> = [
    { label: 'Balanced',    rankKey: 'rank_balanced'          },
    { label: 'Research',    rankKey: 'rank_research_focused'  },
    { label: 'Production',  rankKey: 'rank_production_focused'},
    { label: 'Cost-Sens.',  rankKey: 'rank_cost_sensitive'    },
  ]

  const activeUC      = USE_CASES.find((uc) => uc.id === activeUseCase)
  const highlightCol  = activeUC?.highlight ? HIGHLIGHT_TO_COL[activeUC.highlight as string]  : null
  const highlightName = activeUC?.highlight ? HIGHLIGHT_DISPLAY[activeUC.highlight as string] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Live Rankings</h1>
        <p className="text-sm text-muted mt-1">
          Adjust weights to see how rankings change in real time
        </p>
      </div>

      {/* ── Use Case Selector ── */}
      <div className="bg-card rounded-xl p-4 border border-border mt-6">
        <p className="text-sm font-medium text-muted uppercase tracking-wider mb-3">Use Case</p>
        {highlightName && (
          <p className="text-xs text-[#E63946] mb-3">Optimised for: {highlightName}</p>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon
            const isActive = activeUseCase === uc.id
            return (
              <button
                key={uc.id}
                type="button"
                onClick={() => { setActiveUseCase(uc.id); setWeights(uc.weights) }}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all cursor-pointer min-w-[110px] flex-shrink-0 ${
                  isActive
                    ? 'border-[#E63946]/40 bg-[#E63946]/10 text-[#E63946]'
                    : 'border-border text-muted hover:text-primary hover:border-border'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-semibold text-center">{uc.label}</span>
                <span className="text-[10px] text-center opacity-70 leading-tight">{uc.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Weight Controls ── */}
      <div className="bg-card rounded-xl p-6 border border-border mt-4">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(PRESETS).map(([name, vals]) => {
            const isActive = presetsEqual(weights, vals)
            return (
              <button
                key={name}
                type="button"
                onClick={() => setWeights(vals)}
                className={`border rounded-lg px-4 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30'
                    : 'text-muted hover:text-primary border-border'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(Object.keys(weights) as Array<keyof Weights>).map((key) => {
            const total = weights.capability + weights.efficiency + weights.cost + weights.speed
            const pct = total > 0 ? ((weights[key] / total) * 100).toFixed(0) : '0'
            return (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-primary capitalize">{key}</span>
                  <span className={`text-sm font-mono ${DIMENSION_ACCENTS[key]}`}>
                    {pct}% of ranking
                  </span>
                </div>
                <input
                  type="range"
                  title={key}
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights[key]}
                  onChange={(e) => handleSliderChange(key, +e.target.value)}
                  className="w-full h-2 rounded-full bg-border accent-[#457B9D]"
                />
              </div>
            )
          })}
        </div>
        <p className="text-xs text-faint text-right mt-3">
          Each slider is independent. Scores shown as % contribution to final rank.
        </p>
      </div>

      {/* ── Rankings Table ── */}
      <div className="bg-card rounded-xl border border-border mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-border sticky top-0 z-10">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className={`text-xs uppercase px-4 py-3 text-left whitespace-nowrap transition-colors ${
                      h === highlightCol
                        ? 'text-[#E63946] bg-[#E63946]/5'
                        : 'text-muted'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {rankedModels.map((m, idx) => {
                  const rank = idx + 1
                  const badge = rankBadge(rank)
                  return (
                    <motion.tr
                      key={m.model_name}
                      layoutId={m.model_name}
                      transition={{ type: 'spring', stiffness: 500, damping: 50 }}
                      className="hover:bg-border/50 cursor-pointer border-b border-border/50"
                      onClick={() => openDrawer(m)}
                    >
                      <td className="px-4 py-2.5">
                        {badge ? (
                          <span className={`${badge} rounded-full w-6 h-6 flex items-center justify-center text-xs mx-auto font-bold`}>
                            {rank}
                          </span>
                        ) : (
                          <span className="text-muted text-sm text-center block">{rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-primary text-sm whitespace-nowrap">{m.model_name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">{m.organization}</td>
                      <td className="px-4 py-2.5"><ClusterBadge label={m.cluster_label} size="sm" /></td>
                      <td className="px-4 py-2.5 font-mono text-sm text-primary font-semibold">{m.liveScore.toFixed(4)}</td>
                      <td className={`px-4 py-2.5 text-xs font-mono ${highlightCol === 'Cap'   ? 'text-[#E63946] font-semibold' : 'text-muted'}`}>{m.capability_score.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">{m.efficiency_score.toFixed(3)}</td>
                      <td className={`px-4 py-2.5 text-xs font-mono ${highlightCol === 'Speed' ? 'text-[#E63946] font-semibold' : 'text-muted'}`}>{m.speed_score.toFixed(3)}</td>
                      <td className={`px-4 py-2.5 text-xs font-mono ${highlightCol === 'Cost'  ? 'text-[#E63946] font-semibold' : 'text-muted'}`}>{m.cost_norm.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">{Math.round(m.tokens_per_second)}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">{Math.round(m.latency_ms)}ms</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">${m.cost_input_per_1m.toFixed(2)}</td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sensitivity Heatmap ── */}
      <div className="bg-card rounded-xl p-6 border border-border mt-6">
        <h2 className="text-lg font-semibold text-primary">
          Rank Stability Across Weight Profiles
        </h2>
        <p className="text-xs text-faint mt-1 mb-4">
          ● = stable rank (std &lt; 2). Green = top tier, red = bottom tier.
        </p>
        <SensitivityHeatmap
          models={modelsData}
          profiles={['balanced', 'research_focused', 'production_focused', 'cost_sensitive']}
        />
      </div>

      {/* ── Drawer backdrop ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* ── Model Detail Drawer ── */}
      <AnimatePresence>
        {drawerOpen && selectedModel && (
          <motion.div
            key="drawer"
            className="fixed right-0 top-0 h-full w-full sm:w-[380px] bg-sidebar
                       border-l border-border z-50 overflow-y-auto"
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary">{selectedModel.model_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted">{selectedModel.organization}</span>
                    <ClusterBadge label={selectedModel.cluster_label} size="sm" />
                  </div>
                  <span className="text-xs bg-border px-2 py-0.5 rounded text-faint mt-2 inline-block">
                    {selectedModel.data_quality}
                  </span>
                  <div className="mt-3">
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">Quick Links</p>
                    <ModelLinks modelName={selectedModel.model_name} size="md" />
                  </div>
                </div>
                <button
                  type="button"
                  title="Close drawer"
                  onClick={closeDrawer}
                  className="text-muted hover:text-primary transition-colors mt-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Performance Scores */}
              <p className="text-xs text-muted uppercase tracking-wider mb-3">Performance Scores</p>
              <div className="space-y-2 mb-5">
                <MetricBar label="Capability" value={selectedModel.capability_score} color={getClusterColor(selectedModel.cluster_label)} />
                <MetricBar label="Efficiency" value={selectedModel.efficiency_score} color="#E9C46A" />
                <MetricBar label="Speed"      value={selectedModel.speed_score}      color="#2A9D8F" />
                <MetricBar label="Cost (inv)" value={selectedModel.cost_norm}        color="#457B9D" />
                <MetricBar label="TPS norm"   value={selectedModel.tps_norm}         color="#2A9D8F" />
                <MetricBar label="Latency inv" value={selectedModel.latency_norm}    color="#E9C46A" />
              </div>

              {/* Benchmark Scores */}
              <p className="text-xs text-muted uppercase tracking-wider mb-3">Benchmark Scores</p>
              <div className="space-y-1.5 mb-5">
                {[
                  { label: 'MMLU',       value: selectedModel.mmlu_score      },
                  { label: 'HumanEval',  value: selectedModel.humaneval_score },
                  { label: 'MATH',       value: selectedModel.math_score      },
                  { label: 'HellaSwag',  value: selectedModel.hellaswag_score },
                  { label: 'ARC',        value: selectedModel.arc_score       },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-muted">{label}</span>
                    <span className="text-xs font-mono text-primary">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Operational Details */}
              <p className="text-xs text-muted uppercase tracking-wider mb-3">Operational Details</p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 mb-5 text-xs">
                {[
                  ['TPS',          `${Math.round(selectedModel.tokens_per_second)}`],
                  ['Latency',      `${Math.round(selectedModel.latency_ms)}ms`],
                  ['Cost In/1M',   `$${selectedModel.cost_input_per_1m}`],
                  ['Cost Out/1M',  `$${selectedModel.cost_output_per_1m}`],
                  ['Context',      `${selectedModel.context_window_k}K`],
                  ['Params',       `${selectedModel.parameter_size_b}B`],
                  ['Architecture', selectedModel.architecture],
                  ['Released',     selectedModel.release_month],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-faint">{k}</span>
                    <div className="text-primary font-mono">{v}</div>
                  </div>
                ))}
              </div>

              {/* Rank Across Profiles */}
              <p className="text-xs text-muted uppercase tracking-wider mb-3">Rank Across Profiles</p>
              <div className="space-y-1.5">
                {profileRanks.map(({ label, rankKey }) => {
                  const r = selectedModel[rankKey] as number
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-muted">{label}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        r <= 5  ? 'bg-[#2A9D8F]/20 text-[#2A9D8F]' :
                        r <= 15 ? 'bg-[#E9C46A]/20 text-[#E9C46A]' :
                                  'bg-[#E63946]/20 text-[#E63946]'
                      }`}>
                        #{r}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
