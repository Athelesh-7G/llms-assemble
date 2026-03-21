import { motion } from 'framer-motion'
import { ScatterPlot } from '../components/charts'
import type { ScatterPlotPoint } from '../components/charts'
import { getClusterColor, modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

function toScatterPoints(
  xKey: keyof LLMModel,
  yKey: keyof LLMModel,
  sizeKey: keyof LLMModel
): ScatterPlotPoint[] {
  return modelsData
    .filter((m) => {
      const x = m[xKey]
      const y = m[yKey]
      return x != null && y != null && !Number.isNaN(x) && !Number.isNaN(y)
    })
    .map((m) => ({
      x: m[xKey] as number,
      y: m[yKey] as number,
      size: m[sizeKey] as number,
      name: m.model_name,
      color: getClusterColor(m.cluster_label),
      cluster: m.cluster_label,
    }))
}

type AccentColor = 'red' | 'blue' | 'teal' | 'gold'

const BORDER_CLASS: Record<AccentColor, string> = {
  red:  'border-l-[#E63946]',
  blue: 'border-l-[#457B9D]',
  teal: 'border-l-[#2A9D8F]',
  gold: 'border-l-[#E9C46A]',
}

interface ChartCardProps {
  title: string
  subtitle: string
  insightText: string
  accent: AccentColor
  children: React.ReactNode
}

function ChartCard({ title, subtitle, insightText, accent, children }: ChartCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h2 className="text-base font-semibold text-primary mb-1">{title}</h2>
      <p className="text-xs text-faint mb-4">{subtitle}</p>
      {children}
      <div className={`bg-base rounded-lg p-3 mt-4 text-xs text-muted leading-relaxed border-l-4 ${BORDER_CLASS[accent]}`}>
        {insightText}
      </div>
    </div>
  )
}


export default function TradeoffsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Tradeoff Analysis</h1>
        <p className="text-sm text-muted mt-1">
          Which AI model should you choose? Here's the real picture.
        </p>
      </div>

      {/* ── How to read guide ── */}
      <div className="flex items-center gap-6 mb-6 text-xs text-muted bg-card border border-border rounded-lg px-4 py-2.5 flex-wrap">
        <span>🔵 <b className="text-primary">Dot color</b> = cluster tier</span>
        <span>⭕ <b className="text-primary">Dot size</b> = parameter count or context window (varies per chart)</span>
        <span>📍 <b className="text-primary">Labels</b> = top 6 notable models</span>
        <span>- - <b className="text-primary">Dashed lines</b> = median values</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Chart 1 */}
        <ChartCard
          title="Are expensive models actually better?"
          subtitle="Each dot is one AI model. Bottom-left = best value zone."
          accent="red"
          insightText="Models in the bottom-left corner give you great performance without a huge price tag. The best value options like Claude Haiku and GPT-4o mini cost 20-50x less than top models but still score 85-90% on major tests."
        >
          <ScatterPlot
            data={toScatterPoints('effective_cost_per_1m', 'capability_score', 'parameter_size_b')}
            xLabel="Cost per 1M tokens (USD, log scale)"
            yLabel="Capability Score"
            logX
            height={360}
            highlightTop={6}
          />
        </ChartCard>

        {/* Chart 2 */}
        <ChartCard
          title="Which models are both fast AND powerful?"
          subtitle="Top-right = powerful AND fast. Most models must trade one for the other."
          accent="blue"
          insightText="Faster models tend to be less powerful, and more powerful models tend to be slower. But some models beat this tradeoff — they deliver strong performance AND fast responses."
        >
          <ScatterPlot
            data={toScatterPoints('capability_score', 'tokens_per_second', 'context_window_k')}
            xLabel="Capability Score"
            yLabel="Tokens per Second"
            height={360}
            highlightTop={6}
          />
        </ChartCard>

        {/* Chart 3 */}
        <ChartCard
          title="Do bigger models always win?"
          subtitle="Bigger models score higher — but the gap shrinks as size increases."
          accent="teal"
          insightText="Bigger is not always better. Some models with far fewer parameters perform just as well as giant ones. This means the quality of training matters more than raw model size."
        >
          <ScatterPlot
            data={toScatterPoints('parameter_size_b', 'mmlu_score', 'capability_score')}
            xLabel="Parameter Count (Billions, log scale)"
            yLabel="MMLU Score"
            logX
            height={360}
            highlightTop={6}
          />
        </ChartCard>

        {/* Chart 4 */}
        <ChartCard
          title="Which models are fast AND affordable?"
          subtitle="Bottom-left corner = fast AND cheap. That is the deployment sweet spot."
          accent="gold"
          insightText="The top-left corner is the sweet spot — fast responses AND low cost. Models like Gemini Flash and Claude Haiku sit there, making them ideal for building responsive AI products on a budget."
        >
          <ScatterPlot
            data={toScatterPoints('latency_ms', 'effective_cost_per_1m', 'capability_score')}
            xLabel="Latency (ms)"
            yLabel="Cost per 1M tokens (USD)"
            height={360}
            highlightTop={6}
            showQuadrants
          />
        </ChartCard>
      </div>
    </motion.div>
  )
}
