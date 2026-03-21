import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getClusterColor } from '../../data/loader'
import type { LLMModel } from '../../types/index'

interface ClusterScatterProps {
  models: LLMModel[]
  height?: number
  onSelect?: (name: string) => void
}

interface DotPoint {
  x: number
  y: number
  name: string
  cluster: string
}

const CLUSTER_ORDER = ['Frontier', 'Balanced', 'Efficient', 'Lightweight'] as const

// Custom dot shape
function ClusterDot(props: Record<string, unknown>) {
  const { cx, cy, payload, onClick } = props as {
    cx: number
    cy: number
    payload: DotPoint
    onClick?: (name: string) => void
  }
  const color = getClusterColor(payload.cluster)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={7}
      fill={color}
      fillOpacity={0.8}
      stroke="var(--bg-base)"
      strokeWidth={1}
      style={onClick ? { cursor: 'pointer' } : undefined}
      onClick={() => onClick?.(payload.name)}
    />
  )
}

export default function ClusterScatter({
  models,
  height = 420,
  onSelect,
}: ClusterScatterProps) {
  // Filter out models missing PCA coords
  const valid = models.filter(
    (m) => m.pca_x != null && m.pca_y != null
  )

  // Group by cluster
  const groups = CLUSTER_ORDER.map((label) => ({
    label,
    color: getClusterColor(label),
    points: valid
      .filter((m) => m.cluster_label === label)
      .map((m): DotPoint => ({
        x: m.pca_x,
        y: m.pca_y,
        name: m.model_name,
        cluster: m.cluster_label,
      })),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
        <CartesianGrid stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="x"
          name="PC1"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)' }}
          label={{ value: 'PC1', position: 'insideBottom', offset: -10, fill: 'var(--text-faint)' }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="PC2"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)' }}
          label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: 'var(--text-faint)' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={({ payload }) => {
            if (!payload?.length) return null
            const p = payload[0].payload as DotPoint
            return (
              <div className="bg-card border border-[var(--border)] rounded-lg p-2 text-xs text-primary">
                <div className="font-semibold">{p.name}</div>
                <div className="text-muted mt-0.5">{p.cluster}</div>
              </div>
            )
          }}
        />
        <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px' }} />
        <ReferenceLine x={0} stroke="var(--border)" strokeDasharray="4 4" />
        <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />

        {groups.map(({ label, color, points }) => (
          <Scatter
            key={label}
            name={label}
            data={points}
            fill={color}
            shape={(shapeProps: unknown) => (
              <ClusterDot {...(shapeProps as Record<string, unknown>)} onClick={onSelect} />
            )}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
