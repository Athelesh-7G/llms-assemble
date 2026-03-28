import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpDown,
  BarChart2,
  BookOpen,
  BrainCircuit,
  Calculator,
  Code2,
  Filter,
  GitCompare,
  LayoutDashboard,
  Network,
  Newspaper,
  Scale,
  Server,
  Sparkles,
  Table2,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import ClusterBadge from '../components/ClusterBadge'
import WorkflowDiagram from '../components/WorkflowDiagram'

// ── Phase Step Card ───────────────────────────────────────────────────────────

interface PhaseStepProps {
  icon: React.ElementType
  step: string
  title: string
  text: string
  iconBg: string
  iconColor: string
}

function PhaseStep({ icon: Icon, step, title, text, iconBg, iconColor }: PhaseStepProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <div>
          <div className="text-[10px] text-muted uppercase tracking-wider">{step}</div>
          <div className="text-sm font-semibold text-primary">{title}</div>
        </div>
      </div>
      <p className="text-xs text-muted leading-relaxed">{text}</p>
    </div>
  )
}

// ── Page Row (Phase 5) ────────────────────────────────────────────────────────

interface PageRowProps {
  icon: React.ElementType
  label: string
  description: string
  path: string
  accent: string
}

function PageRow({ icon: Icon, label, description, path, accent }: PageRowProps) {
  const navigate = useNavigate()
  return (
    <motion.button
      type="button"
      onClick={() => navigate(path)}
      className="bg-card border border-border rounded-xl p-4 text-left w-full hover:border-[#E63946]/50 transition-colors"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
          <Icon size={15} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-primary">{label}</div>
          <div className="text-xs text-muted">{description}</div>
        </div>
      </div>
    </motion.button>
  )
}

// ── Finding Card ──────────────────────────────────────────────────────────────

interface FindingCardProps {
  stat: string
  statColor: string
  title: string
  text: string
}

function FindingCard({ stat, statColor, title, text }: FindingCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className={`text-4xl font-black mb-2 ${statColor}`}>{stat}</div>
      <div className="text-sm font-semibold text-primary mb-2">{title}</div>
      <p className="text-xs text-muted leading-relaxed">{text}</p>
    </div>
  )
}

// ── Design Decision Card ──────────────────────────────────────────────────────

interface DesignDecisionProps {
  title: string
  rationale: string
  alternative?: string
  accent: string
}

function DesignDecision({ title, rationale, accent }: DesignDecisionProps) {
  return (
    <div className={`bg-card border-l-4 rounded-xl p-5 border border-border ${accent}`}>
      <div className="text-sm font-semibold text-primary mb-2">{title}</div>
      <p className="text-xs text-muted leading-relaxed">{rationale}</p>
    </div>
  )
}

// ── Correlation cell colour helper ────────────────────────────────────────────

function corrCellClass(v: number): string {
  if (v >= 0.95) return 'bg-[#E63946]/70 text-white font-semibold'
  if (v >= 0.55) return 'bg-[#E9C46A]/40 text-[#E9C46A] font-medium'
  if (v >= 0.20) return 'bg-[#E9C46A]/15 text-[#E9C46A]'
  if (v >= -0.15) return 'text-muted'
  if (v >= -0.45) return 'bg-[#2A9D8F]/20 text-[#2A9D8F]'
  return 'bg-[#2A9D8F]/50 text-[#2A9D8F] font-medium'
}

// ── Static data ───────────────────────────────────────────────────────────────

const PHASE2_STEPS: PhaseStepProps[] = [
  {
    icon: Filter,
    step: 'Step 1',
    title: 'Missing Value Imputation',
    iconBg: 'bg-[#E9C46A]/15',
    iconColor: 'text-[#E9C46A]',
    text: 'Benchmark scores with missing values are filled using the median of models in the same architecture family (Transformer vs MoE). This preserves structural patterns without introducing bias from global averages.',
  },
  {
    icon: ArrowUpDown,
    step: 'Step 2',
    title: 'Min-Max Normalisation',
    iconBg: 'bg-[#457B9D]/15',
    iconColor: 'text-[#457B9D]',
    text: 'All scores normalised to 0-1. Latency and cost are inverted so higher always means better across every dimension - making cross-metric comparison and composite scoring straightforward.',
  },
  {
    icon: Calculator,
    step: 'Step 3',
    title: 'Composite Capability Score',
    iconBg: 'bg-[#2A9D8F]/15',
    iconColor: 'text-[#2A9D8F]',
    text: 'Capability = MMLU×0.25 + HumanEval×0.25 + MATH×0.20 + HellaSwag×0.15 + ARC×0.15. Weights reflect task importance in real production deployments, balancing general knowledge, coding, and reasoning.',
  },
  {
    icon: Zap,
    step: 'Step 4',
    title: 'Efficiency Score',
    iconBg: 'bg-[#E63946]/15',
    iconColor: 'text-[#E63946]',
    text: 'Efficiency = capability / log₂(params+2). A 60th-percentile capability floor prevents tiny low-quality models from gaming the metric. Models below the floor receive a 0.5× penalty. Re-normalised to 0-1.',
  },
]

const CORR_LABELS = ['Capability', 'Parameters', 'Cost', 'Speed', 'Efficiency']
const CORR_DATA = [
  [ 1.00,  0.61,  0.72, -0.28,  0.54],
  [ 0.61,  1.00,  0.73, -0.51, -0.19],
  [ 0.72,  0.73,  1.00, -0.35, -0.26],
  [-0.28, -0.51, -0.35,  1.00,  0.22],
  [ 0.54, -0.19, -0.26,  0.22,  1.00],
]

const CLUSTER_ROWS = [
  { label: 'Frontier',    models: 6,  avgCap: '0.91', bar: 'w-[91%]', bestFor: 'Research, complex reasoning' },
  { label: 'Balanced',    models: 14, avgCap: '0.82', bar: 'w-[82%]', bestFor: 'Production workloads'        },
  { label: 'Efficient',   models: 12, avgCap: '0.74', bar: 'w-[74%]', bestFor: 'Cost-sensitive apps'         },
  { label: 'Lightweight', models: 8,  avgCap: '0.61', bar: 'w-[61%]', bestFor: 'Real-time, edge inference'   },
]

const RANKING_PROFILES = [
  {
    name: 'Balanced',
    segments: [
      { label: 'Capability', w: 'w-[40%]', pct: '40%', color: 'bg-[#E63946]' },
      { label: 'Efficiency', w: 'w-[20%]', pct: '20%', color: 'bg-[#2A9D8F]' },
      { label: 'Cost',       w: 'w-[20%]', pct: '20%', color: 'bg-[#E9C46A]' },
      { label: 'Speed',      w: 'w-[20%]', pct: '20%', color: 'bg-[#457B9D]' },
    ],
  },
  {
    name: 'Research',
    segments: [
      { label: 'Capability', w: 'w-[70%]', pct: '70%', color: 'bg-[#E63946]' },
      { label: 'Efficiency', w: 'w-[15%]', pct: '15%', color: 'bg-[#2A9D8F]' },
      { label: 'Cost',       w: 'w-[8%]',  pct: '8%',  color: 'bg-[#E9C46A]' },
      { label: 'Speed',      w: 'w-[7%]',  pct: '7%',  color: 'bg-[#457B9D]' },
    ],
  },
  {
    name: 'Cost-Sensitive',
    segments: [
      { label: 'Capability', w: 'w-[20%]', pct: '20%', color: 'bg-[#E63946]' },
      { label: 'Efficiency', w: 'w-[25%]', pct: '25%', color: 'bg-[#2A9D8F]' },
      { label: 'Cost',       w: 'w-[40%]', pct: '40%', color: 'bg-[#E9C46A]' },
      { label: 'Speed',      w: 'w-[15%]', pct: '15%', color: 'bg-[#457B9D]' },
    ],
  },
]

const PAGE_ROWS: PageRowProps[] = [
  { icon: LayoutDashboard, label: 'Overview',           description: 'Platform summary at a glance',          path: '/',           accent: 'bg-[#E63946]'  },
  { icon: GitCompare,      label: 'Compare Models',     description: 'Side-by-side across all metrics',       path: '/compare',    accent: 'bg-[#457B9D]'  },
  { icon: BarChart2,       label: 'Benchmark Analysis', description: 'Deep dive into each eval suite',        path: '/benchmarks', accent: 'bg-[#E9C46A]'  },
  { icon: TrendingUp,      label: '2025 Trends',        description: 'Monthly performance evolution',         path: '/trends',     accent: 'bg-[#2A9D8F]'  },
  { icon: Network,         label: 'Cluster Explorer',   description: 'PCA-based model groupings',             path: '/clusters',   accent: 'bg-[#457B9D]'  },
  { icon: Scale,           label: 'Tradeoff Analysis',  description: 'Cost, speed, and capability maps',      path: '/tradeoffs',  accent: 'bg-[#E9C46A]'  },
  { icon: Trophy,          label: 'Live Rankings',      description: 'Weighted composite scoring',            path: '/rankings',   accent: 'bg-[#E63946]'  },
  { icon: Table2,          label: 'Data Explorer',      description: 'Filter and sort every model',           path: '/explorer',   accent: 'bg-[#2A9D8F]'  },
  { icon: Newspaper,       label: 'Top News',           description: '120 curated AI stories from 2025',      path: '/news',       accent: 'bg-[#E9C46A]'  },
  { icon: Sparkles,        label: 'Find My Model',      description: '5-question wizard for LLM matching',     path: '/quiz',       accent: 'bg-[#E63946]'  },
  { icon: Calculator,      label: 'Cost Calculator',    description: 'Live API cost comparison across 40 models', path: '/cost',    accent: 'bg-[#2A9D8F]'  },
]

const FINDINGS: FindingCardProps[] = [
  {
    stat:      '5×',
    statColor: 'text-[#E63946]',
    title:     'Cost efficiency gap',
    text:      'Mid-tier models deliver 85-90% of frontier capability at one-fifth the cost. For most production use cases, the expensive frontier models are not necessary.',
  },
  {
    stat:      '~18%',
    statColor: 'text-[#2A9D8F]',
    title:     'API cost dropped in 2025',
    text:      'Average API costs fell ~18% through 2025 as competition intensified. What cost $5/1M tokens in January cost under $4 by December.',
  },
  {
    stat:      'r=0.6',
    statColor: 'text-[#457B9D]',
    title:     'Parameters predict performance moderately',
    text:      'Correlation between parameter count and MMLU score is 0.6 - meaningful but not deterministic. Architecture quality and training data matter as much as raw model size.',
  },
]

const DESIGN_DECISIONS: DesignDecisionProps[] = [
  {
    title:       'Static JSON over runtime API',
    rationale:   'All data is pre-computed and exported as JSON at build time. The frontend reads it at bundle time - zero network calls, instant loads, and deployment anywhere. Data refresh is monthly, so a live backend adds cost without benefit.',
    alternative: 'A live Python/FastAPI backend - rejected due to operational overhead and deployment complexity for a monthly-refresh dataset.',
    accent:      'border-l-[#E63946]',
  },
  {
    title:       'K-Means with k=4 over hierarchical clustering',
    rationale:   'K-Means with k=4 is deterministic, fast, and its output maps cleanly to four industry-recognised tiers: Frontier, Balanced, Efficient, Lightweight. Silhouette score (0.34) confirms meaningful separation.',
    alternative: 'Hierarchical clustering - rejected because dendrograms are hard to communicate at an expo and the cut-point selection is subjective.',
    accent:      'border-l-[#457B9D]',
  },
  {
    title:       'Four weight profiles instead of one score',
    rationale:   'One composite score cannot serve all use cases. Four named profiles (Balanced, Research, Production, Cost-Sensitive) let users apply the ranking that matches their actual constraints. The leaderboard reorders in real time.',
    alternative: 'A single universal score - rejected because it implies one model can be best for all use cases, which the data shows is false.',
    accent:      'border-l-[#2A9D8F]',
  },
]

const FRONTEND_TECH = ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'React Router v6', 'Vite']
const BACKEND_TECH  = ['Python 3.12', 'pandas', 'NumPy', 'scikit-learn', 'K-Means', 'PCA', 'scipy']

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MakingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >

      {/* ── Hero ── */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-3">
          <BookOpen size={32} className="text-[#E63946]" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-br from-[#E63946] to-[#457B9D] bg-clip-text text-transparent">
          The Making of LLMs Assemble
        </h1>
        <p className="text-sm text-muted max-w-xl mx-auto mb-6">
          A complete data science project - from raw benchmark data to an interactive evaluation platform
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['40 Models Evaluated', '480 Data Points', '4 Clusters Found', '11 Interactive Pages', '120 News Stories'].map((badge) => (
            <span
              key={badge}
              className="bg-card border border-border rounded-full px-4 py-1.5 text-sm text-primary"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── Project Overview ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              LLMs Assemble answers a real question practitioners face: which LLM should I use, and for what?
              Rather than relying on marketing claims, we built a systematic evaluation framework grounded in
              public benchmark data, measured operational metrics, and a transparent scoring methodology.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Every number traces back to a public leaderboard, an independent measurement service, or an
              official vendor pricing page. The Python backend normalises, engineers, and clusters the data,
              then exports static JSON that the React frontend reads at bundle time - no runtime API calls,
              no hidden assumptions.
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Tech Stack</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Code2 size={14} className="text-[#457B9D]" />
                  <span className="text-xs font-semibold text-primary">Frontend</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FRONTEND_TECH.map((t) => (
                    <span key={t} className="text-xs bg-border rounded px-2 py-1 text-muted">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Server size={14} className="text-[#2A9D8F]" />
                  <span className="text-xs font-semibold text-primary">Backend / Data Pipeline</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BACKEND_TECH.map((t) => (
                    <span key={t} className="text-xs bg-border rounded px-2 py-1 text-muted">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture Diagram ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">System Architecture</h2>
        <p className="text-sm text-muted mb-5">How data flows from raw sources to your browser - 7 pipeline stages, 17 nodes</p>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="overflow-x-auto -mx-2 px-2">
            <div style={{ minWidth: "600px" }}>
              <WorkflowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ── Phase 1: Data Collection ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Phase 1 - Data Collection</h2>
        <p className="text-sm text-muted mb-5">Where the numbers come from</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-muted leading-relaxed">
              Benchmark scores were sourced from five independent providers to avoid any single-source bias.
              Monthly data for all of 2025 was constructed by applying documented improvement rates to January
              baselines, with new model releases marked as NaN before their launch date. Result: 40 models ×
              12 months = 480 data points.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {[
                { src: '🤗  HuggingFace',         detail: 'MMLU · MATH · HellaSwag · ARC'  },
                { src: '💻  BigCode LB',           detail: 'HumanEval coding scores'         },
                { src: '📊  Artificial Analysis',  detail: 'Latency (ms) · Tokens/sec'       },
                { src: '💰  Vendor Pages',         detail: 'Input / output API pricing'       },
                { src: '📄  Model Cards',          detail: 'Parameter count · Context window' },
              ].map(({ src, detail }) => (
                <div key={src} className="bg-base border border-border rounded-lg px-3 py-2">
                  <div className="text-xs font-medium text-primary">{src}</div>
                  <div className="text-[10px] text-muted">{detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F1117] rounded-xl p-5 border border-border font-mono text-xs leading-6 overflow-x-auto">
            <div className="text-[#888888] text-[10px] uppercase tracking-wider mb-3">
              Sample · models.json
            </div>
            <pre className="whitespace-pre">
              <span className="text-[#888888]">{'{'}</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"model_name"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#2A9D8F]">"Claude Sonnet 4"</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"mmlu_score"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">90.2</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"humaneval_score"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">93.7</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"tokens_per_second"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">78.4</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"latency_ms"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">620</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"cost_input_per_1m"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">3.0</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"capability_score"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">0.891</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"cluster_label"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#2A9D8F]">"Frontier"</span>
              <span className="text-[#888888]">,</span>{'\n'}
              {'  '}<span className="text-[#E9C46A]">"rank_balanced"</span>
              <span className="text-[#888888]">: </span>
              <span className="text-[#457B9D]">2</span>{'\n'}
              <span className="text-[#888888]">{'}'}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── Phase 2: Data Preparation ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Phase 2 - Data Preparation</h2>
        <p className="text-sm text-muted mb-5">How raw numbers become comparable metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PHASE2_STEPS.map((step) => (
            <PhaseStep key={step.title} {...step} />
          ))}
        </div>
      </section>

      {/* ── Phase 3: EDA ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Phase 3 - Exploratory Data Analysis</h2>
        <p className="text-sm text-muted mb-5">Patterns discovered before modelling began</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* Correlation heatmap — flex-col so it stretches to match right column */}
          <div className="bg-card rounded-xl p-5 border border-border flex flex-col">
            <p className="text-xs font-semibold text-primary mb-1">Feature Correlation Matrix</p>
            <p className="text-[10px] text-muted mb-4">
              Pearson r &nbsp;·&nbsp;
              <span className="text-[#E63946]">red = strong positive</span>
              &nbsp;·&nbsp;
              <span className="text-[#2A9D8F]">teal = strong negative</span>
            </p>
            {/* flex-1 pushes table to fill remaining card height; justify-center centres it vertically */}
            <div className="flex-1 flex flex-col justify-center overflow-x-auto">
              <table className="text-[10px] w-full">
                <thead>
                  <tr>
                    <th className="pr-2 text-right text-muted font-normal text-[9px]" scope="col" aria-label="Feature" />
                    {CORR_LABELS.map((l) => (
                      <th key={l} className="text-center text-muted font-normal pb-2 text-[9px]">
                        {l.slice(0, 5)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CORR_DATA.map((row, ri) => (
                    <tr key={CORR_LABELS[ri]}>
                      <td className="pr-2 text-right text-muted py-1.5 text-[9px]">
                        {CORR_LABELS[ri].slice(0, 5)}
                      </td>
                      {row.map((v, ci) => (
                        <td
                          key={ci}
                          className={`text-center rounded py-1.5 px-1 ${corrCellClass(v)}`}
                        >
                          {v.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key observations + capability distribution */}
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary">Key observations</p>
              {[
                { color: 'bg-[#E63946]',  text: 'Cost and capability correlate (r=0.72) - but the spread is wide, meaning expensive does not always mean better.' },
                { color: 'bg-[#E9C46A]',  text: 'Parameter count correlates with cost (r=0.73) - larger models cost more to host, but efficiency scores diverge sharply.' },
                { color: 'bg-[#2A9D8F]',  text: 'Speed and parameter count are negatively correlated (r=-0.51) - bigger models are consistently slower on average.' },
                { color: 'bg-[#457B9D]',  text: 'Efficiency is only weakly correlated with speed (r=0.22) - the most efficient models are not necessarily the fastest.' },
              ].map(({ color, text }) => (
                <div key={text} className="flex gap-3 items-start">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${color}`} />
                  <p className="text-xs text-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-primary mb-3">Capability score distribution</p>
              {[
                { range: '0.85 - 1.0',  pct: 'w-[25%]', count: '10 models', color: 'bg-[#E63946]' },
                { range: '0.70 - 0.85', pct: 'w-[40%]', count: '16 models', color: 'bg-[#457B9D]' },
                { range: '0.55 - 0.70', pct: 'w-[25%]', count: '10 models', color: 'bg-[#2A9D8F]' },
                { range: '< 0.55',      pct: 'w-[10%]', count: '4 models',  color: 'bg-[#E9C46A]' },
              ].map(({ range, pct, count, color }) => (
                <div key={range} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-muted w-24 flex-shrink-0">{range}</span>
                  <div className="flex-1 bg-border rounded-full h-2">
                    <div className={`${color} h-2 rounded-full ${pct}`} />
                  </div>
                  <span className="text-[10px] text-muted w-16 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Phase 4: Modelling ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Phase 4 - Modelling</h2>
        <p className="text-sm text-muted mb-5">K-Means clustering, PCA projection, and composite ranking</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clustering */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit size={16} className="text-[#E63946]" />
                <span className="text-sm font-semibold text-primary">K-Means Clustering (k=4)</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-3">
                Models are clustered across 5 normalised dimensions: capability, efficiency, cost, speed,
                and context window. Features are clipped to the 5th-95th percentile before
                StandardScaler normalisation to prevent outliers dominating cluster geometry. n_init=50
                ensures stable convergence.
              </p>
              <p className="text-xs text-muted leading-relaxed">
                PCA reduces to 2D for visualisation, retaining ~65% of variance. Cluster labels are
                assigned by composite tier score: 0.5×capability + 0.25×efficiency + 0.15×cost +
                0.10×speed. Silhouette score:{' '}
                <span className="text-primary font-medium">0.34</span>.
              </p>
            </div>

            {/* Cluster table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-border">
                    <th className="text-left text-[10px] uppercase tracking-wider text-muted px-4 py-2.5">Cluster</th>
                    <th className="text-center text-[10px] uppercase tracking-wider text-muted px-3 py-2.5">n</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-muted px-4 py-2.5">Avg Capability</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-muted px-4 py-2.5">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {CLUSTER_ROWS.map((row) => (
                    <tr key={row.label} className="border-t border-border hover:bg-border/30">
                      <td className="px-4 py-2.5">
                        <ClusterBadge label={row.label} size="sm" />
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-muted">{row.models}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-border rounded-full h-1.5">
                            <div className={`bg-[#E63946] h-1.5 rounded-full ${row.bar}`} />
                          </div>
                          <span className="text-xs font-mono text-primary w-8">{row.avgCap}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ranking profiles */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-[#E9C46A]" />
              <span className="text-sm font-semibold text-primary">Composite Ranking (4 profiles)</span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-5">
              One score cannot serve all use cases. Four weight profiles let users apply the ranking that
              matches their actual constraints. The leaderboard reorders in real time when a profile is
              selected.
            </p>
            <div className="space-y-5">
              {RANKING_PROFILES.map((profile) => (
                <div key={profile.name}>
                  <div className="text-xs font-medium text-primary mb-1.5">{profile.name}</div>
                  <div className="flex h-5 rounded overflow-hidden gap-px">
                    {profile.segments.map(({ label, w, pct, color }) => (
                      <div
                        key={label}
                        className={`${color} ${w} flex items-center justify-center`}
                        title={`${label}: ${pct}`}
                      >
                        <span className="text-[8px] text-white/80 px-0.5">{pct}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {profile.segments.map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                        <span className="text-[9px] text-muted">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Phase 5: Platform ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Phase 5 - Platform</h2>
        <p className="text-sm text-muted mb-5">8 interactive pages - click any to navigate there</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PAGE_ROWS.map((row) => (
            <PageRow key={row.path} {...row} />
          ))}
        </div>
      </section>

      {/* ── Phase 6: Validation & Key Findings ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Phase 6 - Validation &amp; Key Findings</h2>
        <p className="text-sm text-muted mb-5">What the data actually revealed</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FINDINGS.map((f) => (
            <FindingCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Design Decisions ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-primary mb-1">Key Design Decisions</h2>
        <p className="text-sm text-muted mb-5">Three choices that shaped the architecture</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DESIGN_DECISIONS.map((d) => (
            <DesignDecision key={d.title} {...d} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
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