import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2,
  BookOpen,
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  DollarSign,
  GitCompare,
  Network,
  Scale,
  Table2,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import { BarChart } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import ModelLinks from '../components/ModelLinks'
import {
  clustersData,
  getClusterColor,
  getOSSModels,
  getTopNByProfile,
  modelsData,
  monthlyData,
} from '../data/loader'
import StatCard from '../components/StatCard'

// ── Helper: Pearson correlation ──────────────────────────────────────────────

function pearsonR(xs: number[], ys: number[]): number {
  const n = xs.length
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0)
  const denX = Math.sqrt(xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0))
  const denY = Math.sqrt(ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0))
  return denX === 0 || denY === 0 ? 0 : num / (denX * denY)
}

// ── Computed values ──────────────────────────────────────────────────────────

const top5 = getTopNByProfile('balanced', 5)
const topModel = top5[0]
const bestValue = [...modelsData].sort(
  (a, b) => b.cost_efficiency_ratio - a.cost_efficiency_ratio
)[0]
const fastest = [...modelsData].sort(
  (a, b) => b.tokens_per_second - a.tokens_per_second
)[0]
const ossCount = getOSSModels().length

// Standout models
const bestCoding = [...modelsData].sort((a, b) => b.humaneval_score - a.humaneval_score)[0]
const mostEfficient = [...modelsData].sort((a, b) => b.efficiency_score - a.efficiency_score)[0]

// OSS vs Proprietary avg efficiency
const ossModels = getOSSModels()
const propModels = modelsData.filter((m) => !m.is_open_source)
const avgOssEff = ossModels.reduce((a, m) => a + m.efficiency_score, 0) / ossModels.length
const avgPropEff = propModels.reduce((a, m) => a + m.efficiency_score, 0) / propModels.length
const avgOssCap = ossModels.reduce((a, m) => a + m.capability_score, 0) / ossModels.length
const avgPropCap = propModels.reduce((a, m) => a + m.capability_score, 0) / propModels.length
const topOss = [...ossModels].sort((a, b) => b.capability_score - a.capability_score).slice(0, 3)
const topProp = [...propModels].sort((a, b) => b.capability_score - a.capability_score).slice(0, 3)

// Cost trend Jan → Dec
function avgCostForMonth(month: string): number {
  const rows = monthlyData.filter(
    (s) => s.month === month && s.cost_input_per_1m !== null && s.cost_input_per_1m > 0
  )
  if (rows.length === 0) return 0
  const sum = rows.reduce((a, s) => a + (s.cost_input_per_1m ?? 0), 0)
  return sum / rows.length
}
const janCost = avgCostForMonth('2025-01')
const decCost = avgCostForMonth('2025-12')
const costDropPct = janCost > 0 ? ((janCost - decCost) / janCost) * 100 : 0

// Pearson r: parameter_size_b vs mmlu_score
const paramR = pearsonR(
  modelsData.map((m) => m.parameter_size_b),
  modelsData.map((m) => m.mmlu_score)
)

// Frontier convergence
const sorted = [...modelsData].sort((a, b) => b.capability_score - a.capability_score)
const gapPct =
  sorted.length >= 3
    ? ((sorted[0].capability_score - sorted[2].capability_score) /
        sorted[0].capability_score) *
      100
    : 0

// ── Insight card data ────────────────────────────────────────────────────────

const insights = [
  {
    icon: <Cpu size={18} />,
    color: '#2A9D8F',
    title: 'Open Source Efficiency',
    text: `Open-source models average ${(avgOssEff * 100).toFixed(1)}% efficiency vs ${(avgPropEff * 100).toFixed(1)}% for proprietary models.`,
  },
  {
    icon: <TrendingDown size={18} />,
    color: '#E9C46A',
    title: 'Cost Compression',
    text: `Average API cost dropped ${costDropPct.toFixed(1)}% over 2025 as competition intensified.`,
  },
  {
    icon: <BrainCircuit size={18} />,
    color: '#457B9D',
    title: 'Parameters ≠ Performance',
    text: `Correlation between parameter count and MMLU: ${paramR.toFixed(2)}. Efficient architectures outperform larger models.`,
  },
  {
    icon: <Target size={18} />,
    color: '#E63946',
    title: 'Frontier Convergence',
    text: `Top 3 models are within ${gapPct.toFixed(1)}% capability of each other. The frontier is converging.`,
  },
]

// ── Quick nav config ─────────────────────────────────────────────────────────

const QUICK_NAV = [
  { path: '/compare',    icon: GitCompare,      label: 'Compare',    desc: 'Side-by-side model analysis'       },
  { path: '/benchmarks', icon: BarChart2,        label: 'Benchmarks', desc: 'MMLU, HumanEval & more'            },
  { path: '/trends',     icon: TrendingUp,       label: 'Trends',     desc: 'Cost & performance over 2025'      },
  { path: '/clusters',   icon: Network,          label: 'Clusters',   desc: 'K-Means groupings visualised'      },
  { path: '/tradeoffs',  icon: Scale,            label: 'Tradeoffs',  desc: 'Cost vs speed vs capability'       },
  { path: '/rankings',   icon: Trophy,           label: 'Rankings',   desc: 'Best model for each use case'      },
  { path: '/explorer',   icon: Table2,           label: 'Explorer',   desc: 'Full data table with filters'      },
  { path: '/making',     icon: BookOpen,         label: 'Making',     desc: 'How this project was built'        },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Hero ── */}
      <section className="mb-10">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(90deg, #E63946, #457B9D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          LLMs Assemble
        </h1>
        <p className="text-xl text-muted mt-2">
          Quantitative evaluation of {modelsData.length} production LLMs
        </p>
        <p className="text-sm text-faint mt-3 max-w-2xl">
          Compare performance, cost, speed, and efficiency across frontier and
          open-source models. All data is sourced from public benchmarks and
          operational metrics — updated through 2025.
        </p>
      </section>

      {/* ── KPI Cards ── */}
      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={<Database size={18} />}
            value={modelsData.length}
            label="Models Evaluated"
            color="#457B9D"
            animateCount
          />
          <StatCard
            icon={<Code2 size={18} />}
            value={bestCoding?.model_name ?? 'N/A'}
            label="Best for Coding"
            color="#457B9D"
            subtitle={`HumanEval: ${bestCoding?.humaneval_score.toFixed(1)}`}
          />
          <StatCard
            icon={<Trophy size={18} />}
            value={topModel?.model_name ?? '—'}
            label="Top Ranked"
            color="#E63946"
            subtitle="Balanced profile"
          />
          <StatCard
            icon={<DollarSign size={18} />}
            value={bestValue?.model_name ?? '—'}
            label="Best Value"
            color="#2A9D8F"
            subtitle="Highest cost efficiency"
          />
          <StatCard
            icon={<Zap size={18} />}
            value={fastest?.model_name ?? '—'}
            label="Fastest (TPS)"
            color="#E9C46A"
            subtitle={fastest ? `${fastest.tokens_per_second.toFixed(0)} tok/s` : ''}
          />
          <StatCard
            icon={<Code2 size={18} />}
            value={ossCount}
            label="Open Source"
            color="#2A9D8F"
            animateCount
            subtitle={`of ${modelsData.length} models`}
          />
        </div>
      </section>

      {/* ── Top 5 Bar Chart ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Top 5 Models — Balanced Profile
        </h2>
        <div className="bg-card border border-border rounded-xl p-4">
          <BarChart
            data={top5.map((m) => ({
              name: m.model_name,
              value: Number(m.composite_balanced.toFixed(4)),
              color: getClusterColor(m.cluster_label),
            }))}
            orientation="horizontal"
            height={220}
            showValues
          />
        </div>
      </section>

      {/* ── Cluster Overview ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-primary mb-4">Model Clusters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clustersData.map((cluster) => (
            <motion.div
              key={cluster.label}
              className="bg-card rounded-xl p-4 border border-border"
              style={{ borderLeftColor: cluster.color, borderLeftWidth: 4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="font-bold text-sm" style={{ color: cluster.color }}>
                {cluster.label}
              </div>
              <div className="text-sm text-muted mt-1">{cluster.models.length} models</div>
              <div className="text-sm text-primary mt-2">
                Avg capability: {(cluster.avg_capability * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-faint mt-2">{cluster.use_case}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Key Insights ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-primary mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <motion.div
              key={ins.title}
              className="bg-card border border-border rounded-xl p-5"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: ins.color }}>{ins.icon}</span>
                <span className="text-sm font-semibold text-primary">{ins.title}</span>
              </div>
              <p className="text-sm text-muted">{ins.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Standout Models ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-primary mb-4">Standout Models</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div className="bg-card border border-border border-t-[3px] border-t-[#457B9D] rounded-xl p-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={18} className="text-[#457B9D]" />
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Best Coding</span>
            </div>
            <div className="text-sm font-bold text-primary leading-tight">{bestCoding?.model_name ?? '—'}</div>
            <div className="mt-2"><ClusterBadge label={bestCoding?.cluster_label ?? ''} size="sm" /></div>
            <div className="text-xs text-muted mt-2 font-mono">HumanEval {bestCoding?.humaneval_score.toFixed(1)}</div>
            {bestCoding && (
              <div className="mt-3 pt-3 border-t border-border">
                <ModelLinks modelName={bestCoding.model_name} size="sm" />
              </div>
            )}
          </motion.div>

          <motion.div className="bg-card border border-border border-t-[3px] border-t-[#2A9D8F] rounded-xl p-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-[#2A9D8F]" />
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Best Value</span>
            </div>
            <div className="text-sm font-bold text-primary leading-tight">{bestValue?.model_name ?? '—'}</div>
            <div className="mt-2"><ClusterBadge label={bestValue?.cluster_label ?? ''} size="sm" /></div>
            <div className="text-xs text-muted mt-2 font-mono">Efficiency ×{bestValue?.cost_efficiency_ratio.toFixed(2)}</div>
            {bestValue && (
              <div className="mt-3 pt-3 border-t border-border">
                <ModelLinks modelName={bestValue.model_name} size="sm" />
              </div>
            )}
          </motion.div>

          <motion.div className="bg-card border border-border border-t-[3px] border-t-[#E9C46A] rounded-xl p-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-[#E9C46A]" />
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Best Speed</span>
            </div>
            <div className="text-sm font-bold text-primary leading-tight">{fastest?.model_name ?? '—'}</div>
            <div className="mt-2"><ClusterBadge label={fastest?.cluster_label ?? ''} size="sm" /></div>
            <div className="text-xs text-muted mt-2 font-mono">{fastest?.tokens_per_second.toFixed(0)} tok/s</div>
            {fastest && (
              <div className="mt-3 pt-3 border-t border-border">
                <ModelLinks modelName={fastest.model_name} size="sm" />
              </div>
            )}
          </motion.div>

          <motion.div className="bg-card border border-border border-t-[3px] border-t-[#E63946] rounded-xl p-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={18} className="text-[#E63946]" />
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Most Efficient</span>
            </div>
            <div className="text-sm font-bold text-primary leading-tight">{mostEfficient?.model_name ?? '—'}</div>
            <div className="mt-2"><ClusterBadge label={mostEfficient?.cluster_label ?? ''} size="sm" /></div>
            <div className="text-xs text-muted mt-2 font-mono">Score {mostEfficient?.efficiency_score.toFixed(3)}</div>
            {mostEfficient && (
              <div className="mt-3 pt-3 border-t border-border">
                <ModelLinks modelName={mostEfficient.model_name} size="sm" />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Open Source vs Proprietary ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-primary mb-4">Open Source vs Proprietary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OSS card */}
          <div className="bg-card border border-border border-l-4 border-l-[#2A9D8F] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-[#2A9D8F]">Open Source</span>
              <span className="text-xs text-muted">{ossModels.length} models</span>
            </div>
            <div className="mb-3">
              <MetricBar label="Avg Capability" value={avgOssCap} color="#2A9D8F" />
            </div>
            <div className="mb-4">
              <MetricBar label="Avg Efficiency" value={avgOssEff} color="#2A9D8F" />
            </div>
            <div className="mb-4">
              <div className="text-xs text-muted uppercase tracking-wide mb-2">Top 3</div>
              <div className="space-y-1">
                {topOss.map((m, i) => (
                  <div key={m.model_name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted w-4">{i + 1}.</span>
                      <span className="text-xs text-primary">{m.model_name}</span>
                    </div>
                    <span className="text-xs font-mono text-muted">{(m.capability_score * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">Open-source models now match proprietary peers on many benchmarks while offering full transparency and self-hosting options.</p>
          </div>

          {/* Proprietary card */}
          <div className="bg-card border border-border border-l-4 border-l-[#457B9D] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-[#457B9D]">Proprietary</span>
              <span className="text-xs text-muted">{propModels.length} models</span>
            </div>
            <div className="mb-3">
              <MetricBar label="Avg Capability" value={avgPropCap} color="#457B9D" />
            </div>
            <div className="mb-4">
              <MetricBar label="Avg Efficiency" value={avgPropEff} color="#457B9D" />
            </div>
            <div className="mb-4">
              <div className="text-xs text-muted uppercase tracking-wide mb-2">Top 3</div>
              <div className="space-y-1">
                {topProp.map((m, i) => (
                  <div key={m.model_name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted w-4">{i + 1}.</span>
                      <span className="text-xs text-primary">{m.model_name}</span>
                    </div>
                    <span className="text-xs font-mono text-muted">{(m.capability_score * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">Proprietary models still lead on frontier capability scores and offer managed APIs with SLAs — at a higher cost.</p>
          </div>
        </div>
      </section>

      {/* ── Quick Navigation ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-primary mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_NAV.map(({ path, icon: Icon, label, desc }) => (
            <motion.button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-[#457B9D]/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15 }}
            >
              <Icon size={18} className="text-[#457B9D] mb-2" />
              <div className="text-sm font-semibold text-primary">{label}</div>
              <div className="text-xs text-muted mt-0.5 leading-snug">{desc}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Team Footer ── */}
      <footer className="border-t border-border pt-6 pb-2 text-center">
        <p className="text-sm font-medium text-primary">
          Built by Athelesh Balachandran, Barath Krishna R, Kamaleshwar K K
        </p>
        <p className="text-xs text-muted mt-1">
          Data Science Project · 2025 Data · LLMs Assemble
        </p>
      </footer>
    </motion.div>
  )
}
