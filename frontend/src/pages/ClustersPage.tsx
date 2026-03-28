import { motion } from 'framer-motion'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CorrelationHeatmap } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import { clustersData, correlationsData, getClusterColor, modelsData } from '../data/loader'

const CLUSTER_ORDER = ['Frontier', 'Balanced', 'Efficient', 'Lightweight'] as const

const CLUSTER_COLORS: Record<string, string> = {
  Frontier:    '#E63946',
  Balanced:    '#457B9D',
  Efficient:   '#2A9D8F',
  Lightweight: '#E9C46A',
}

const CLUSTER_CARD_CLASSES: Record<string, { border: string; bg: string; text: string }> = {
  Frontier:    { border: 'border-[#E63946]/25', bg: 'bg-[#E63946]/5',  text: 'text-[#E63946]' },
  Balanced:    { border: 'border-[#457B9D]/25', bg: 'bg-[#457B9D]/5',  text: 'text-[#457B9D]' },
  Efficient:   { border: 'border-[#2A9D8F]/25', bg: 'bg-[#2A9D8F]/5',  text: 'text-[#2A9D8F]' },
  Lightweight: { border: 'border-[#E9C46A]/25', bg: 'bg-[#E9C46A]/5',  text: 'text-[#E9C46A]' },
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export default function ClustersPage() {
  // ── Cluster profile radar data ──
  const clusterNames = ['Frontier', 'Balanced', 'Efficient', 'Lightweight']

  const radarData = [
    { metric: 'Capability' },
    { metric: 'Speed'      },
    { metric: 'Efficiency' },
    { metric: 'Cost Value' },
    { metric: 'Context'    },
  ].map((row) => {
    const out: Record<string, unknown> = { metric: row.metric }
    clusterNames.forEach((cn) => {
      const ms = modelsData.filter((m) => m.cluster_label === cn)
      if (!ms.length) { out[cn] = 0; return }
      if (row.metric === 'Capability')
        out[cn] = +(avg(ms.map((m) => m.capability_score)) * 100).toFixed(1)
      else if (row.metric === 'Speed')
        out[cn] = +(avg(ms.map((m) => m.speed_score ?? 0)) * 100).toFixed(1)
      else if (row.metric === 'Efficiency')
        out[cn] = +(avg(ms.map((m) => m.efficiency_score ?? 0)) * 100).toFixed(1)
      else if (row.metric === 'Cost Value')
        out[cn] = +(avg(ms.map((m) => Math.max(0, 1 - (m.cost_norm ?? 0)))) * 100).toFixed(1)
      else if (row.metric === 'Context')
        out[cn] = +(avg(ms.map((m) => Math.min((m.context_window_k ?? 8) / 10, 100)))).toFixed(1)
    })
    return out
  })

  const clusterCounts = clusterNames.reduce((acc, cn) => {
    acc[cn] = modelsData.filter((m) => m.cluster_label === cn).length
    return acc
  }, {} as Record<string, number>)

  // Build grouped bar data for feature comparison
  const featureData = [
    { dimension: 'Capability' },
    { dimension: 'Efficiency' },
    { dimension: 'Speed' },
    { dimension: 'Cost (inv)' },
  ].map((row, i) => {
    const keys = ['avg_capability', 'avg_efficiency', 'avg_speed', 'avg_cost'] as const
    const entry: Record<string, string | number> = { dimension: row.dimension }
    clustersData.forEach((c) => {
      entry[c.label] = parseFloat((c[keys[i]] as number).toFixed(4))
    })
    return entry
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Model Clusters</h1>
        <p className="text-sm text-muted mt-1">
          Structural groupings discovered through unsupervised learning on capability,
          efficiency, cost, and speed dimensions
        </p>
      </div>

      {/* ── Cluster Profile Radar ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-primary">Cluster Profiles — Average Capabilities</h2>
        <p className="text-sm text-muted mt-1 mb-6">
          How each tier performs across all evaluation dimensions
        </p>
        <ResponsiveContainer width="100%" height={380}>
          <RechartsRadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickCount={4}
            />
            {clusterNames.map((cn) => (
              <Radar
                key={cn}
                name={`${cn} (${clusterCounts[cn] ?? 0})`}
                dataKey={cn}
                stroke={CLUSTER_COLORS[cn]}
                fill={CLUSTER_COLORS[cn]}
                fillOpacity={0.10}
                strokeWidth={2}
              />
            ))}
            <Legend
              formatter={(value) => (
                <span className="text-primary text-xs">{value}</span>
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {clusterNames.map((cn) => {
            const cc = CLUSTER_CARD_CLASSES[cn] ?? { border: 'border-border', bg: 'bg-card', text: 'text-primary' }
            return (
              <div key={cn} className={`rounded-lg p-3 border ${cc.border} ${cc.bg}`}>
                <div className={`text-xs font-bold ${cc.text}`}>{cn}</div>
                <div className="text-lg font-mono font-bold text-primary mt-1">{clusterCounts[cn] ?? 0}</div>
                <div className="text-xs text-muted">models</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Cluster Profile Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {CLUSTER_ORDER.map((label) => {
          const cluster = clustersData.find((c) => c.label === label)
          if (!cluster) return null
          const color = getClusterColor(label)
          return (
            <motion.div
              key={label}
              className="bg-card rounded-xl border border-border overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <div className={`h-1.5 w-full ${
                label === 'Frontier'   ? 'bg-[#E63946]' :
                label === 'Balanced'   ? 'bg-[#457B9D]' :
                label === 'Efficient'  ? 'bg-[#2A9D8F]' :
                                         'bg-[#E9C46A]'
              }`} />
              <div className="p-5">
                <div className="flex items-center mb-1">
                  <span className={`font-bold text-lg ${
                    label === 'Frontier'   ? 'text-[#E63946]' :
                    label === 'Balanced'   ? 'text-[#457B9D]' :
                    label === 'Efficient'  ? 'text-[#2A9D8F]' :
                                             'text-[#E9C46A]'
                  }`}>
                    {label}
                  </span>
                  <span className="text-xs bg-border px-2 py-0.5 rounded-full text-muted ml-2">
                    {cluster.models.length}
                  </span>
                </div>
                <p className="text-xs text-faint mb-4">{cluster.use_case}</p>

                <div className="space-y-2">
                  <MetricBar label="Capability" value={cluster.avg_capability} color={color} showValue />
                  <MetricBar label="Efficiency" value={cluster.avg_efficiency} color="#E9C46A" showValue />
                  <MetricBar label="Speed"      value={cluster.avg_speed}      color="#2A9D8F" showValue />
                  <MetricBar label="Cost (inv)" value={cluster.avg_cost}       color="#457B9D" showValue />
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Models</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.models.map((name) => (
                      <ClusterBadge key={name} label={name} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Feature Comparison ── */}
      <div className="bg-card rounded-xl p-6 border border-border mt-6">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Average Dimension Scores by Cluster
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <RechartsBarChart
            data={featureData}
            barCategoryGap="20%"
            barGap={2}
            margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="dimension" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis domain={[0, 1]} stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: '12px' }} />
            {CLUSTER_ORDER.map((label) => (
              <Bar
                key={label}
                dataKey={label}
                fill={getClusterColor(label)}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Correlation Heatmap ── */}
      <div className="bg-card rounded-xl p-6 border border-border mt-6">
        <h2 className="text-lg font-semibold text-primary">Feature Correlation Matrix</h2>
        <p className="text-xs text-faint mt-1 mb-4">
          Pearson correlation between key model attributes
        </p>
        <CorrelationHeatmap
          labels={correlationsData.labels}
          values={correlationsData.values}
        />
      </div>
    </motion.div>
  )
}
