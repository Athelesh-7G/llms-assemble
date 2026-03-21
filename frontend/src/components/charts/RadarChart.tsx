import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { getBenchmarkDisplayName } from '../../data/loader'
import type { LLMModel } from '../../types/index'

interface RadarChartProps {
  models: LLMModel[]
  metrics: string[]
  maxModels?: number
  height?: number
}

const COLORS = [
  '#E63946',
  '#457B9D',
  '#2A9D8F',
  '#E9C46A',
  '#F4A261',
  '#A8DADC',
  '#6A4C93',
  '#52B788',
]

export default function RadarChart({
  models,
  metrics,
  maxModels = 6,
  height = 400,
}: RadarChartProps) {
  const displayModels = models.slice(0, maxModels)

  // Build chart data: one entry per metric
  const chartData = metrics.map((metric) => {
    const entry: Record<string, string | number> = {
      metric: getBenchmarkDisplayName(metric),
    }
    displayModels.forEach((model) => {
      entry[model.model_name] = (model[metric as keyof LLMModel] as number) ?? 0
    })
    return entry
  })

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[40, 100]}
            tick={{ fill: 'var(--text-faint)', fontSize: 9 }}
          />
          {displayModels.map((model, i) => (
            <Radar
              key={model.model_name}
              name={model.model_name}
              dataKey={model.model_name}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {displayModels.map((model, i) => (
          <div key={model.model_name} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-muted">{model.model_name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
