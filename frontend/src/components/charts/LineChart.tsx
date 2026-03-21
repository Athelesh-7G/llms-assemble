import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getClusterColor, modelsData } from '../../data/loader'
import type { MonthlySnapshot } from '../../types/index'

interface LineChartProps {
  data: MonthlySnapshot[]
  models: string[]
  metric: keyof MonthlySnapshot
  yLabel: string
  title?: string
  height?: number
  showDots?: boolean
}

const MONTH_LABELS: Record<string, string> = {
  '2025-01': 'Jan', '2025-02': 'Feb', '2025-03': 'Mar',
  '2025-04': 'Apr', '2025-05': 'May', '2025-06': 'Jun',
  '2025-07': 'Jul', '2025-08': 'Aug', '2025-09': 'Sep',
  '2025-10': 'Oct', '2025-11': 'Nov', '2025-12': 'Dec',
}

function monthFormatter(v: string): string {
  return MONTH_LABELS[v] ?? v
}

export default function LineChart({
  data,
  models,
  metric,
  yLabel,
  title,
  height = 350,
  showDots = true,
}: LineChartProps) {
  const months = Array.from(new Set(data.map((d) => d.month))).sort()

  const chartData = months.map((month) => {
    const row: Record<string, string | number | null> = { month }
    models.forEach((modelName) => {
      const snap = data.find((d) => d.month === month && d.model_name === modelName)
      row[modelName] = snap ? (snap[metric] as number | null) : null
    })
    return row
  })

  return (
    <div>
      {title && <p className="text-sm font-semibold text-primary mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={monthFormatter}
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)' }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            labelFormatter={monthFormatter}
          />
          <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px' }} />
          {models.map((modelName) => {
            const clusterLabel =
              modelsData.find((m) => m.model_name === modelName)?.cluster_label ?? ''
            return (
              <Line
                key={modelName}
                type="monotone"
                dataKey={modelName}
                stroke={getClusterColor(clusterLabel)}
                strokeWidth={2}
                dot={showDots ? { r: 3 } : false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
