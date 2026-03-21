import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'


interface BarChartProps {
  data: { name: string; value: number; color?: string }[]
  orientation: 'horizontal' | 'vertical'
  title?: string
  xLabel?: string
  yLabel?: string
  height?: number
  showValues?: boolean
}

const tooltipProps = {
  contentStyle: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "8px 12px",
  },
  labelStyle: {
    color: "var(--text-primary)",
    fontWeight: 600,
    marginBottom: "2px",
  },
  itemStyle: {
    color: "var(--text-primary)",
  },
  cursor: { fill: "var(--border)", opacity: 0.3 },
}

export default function BarChart({
  data,
  orientation,
  title,
  height = 300,
  showValues = false,
}: BarChartProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div>
      {title && <p className="text-sm font-semibold text-primary mb-2">{title}</p>}
      {isHorizontal ? (
        <div style={{ width: "100%", overflow: "visible" }}>
          <ResponsiveContainer width="100%" height={height ?? 300}>
            <RechartsBarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 65, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, (dataMax: number) => dataMax * 1.15]}
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <Tooltip {...tooltipProps} />
              <Bar
                dataKey="value"
                isAnimationActive={true}
                minPointSize={3}
                radius={[0, 4, 4, 0]}
                label={showValues ? {
                  position: "right",
                  formatter: (value: number) => value.toFixed(1),
                  fill: "var(--text-primary)",
                  fontSize: 11,
                  fontWeight: 500,
                } : false}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color ?? '#457B9D'} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height ?? 300}>
          <RechartsBarChart
            data={data}
            margin={{ top: 4, right: 16, left: 8, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="category"
              dataKey="name"
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="value" isAnimationActive={true} minPointSize={3} radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color ?? '#457B9D'} />
              ))}
              {showValues && (
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 500 }}
                  formatter={(v: number) => v.toFixed(2)}
                />
              )}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
