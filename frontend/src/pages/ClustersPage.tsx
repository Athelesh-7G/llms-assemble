import { motion } from 'framer-motion'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ClusterScatter, CorrelationHeatmap } from '../components/charts'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import { clustersData, correlationsData, getClusterColor, modelsData } from '../data/loader'

const CLUSTER_ORDER = ['Frontier', 'Balanced', 'Efficient', 'Lightweight'] as const

export default function ClustersPage() {
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

      {/* ── PCA Scatter ── */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">
            Principal Component Analysis — 2D Projection
          </h2>
          <p className="text-xs text-faint mt-1">
            Dimensionality reduction of 5 clustering features into 2 principal components
          </p>
        </div>
        <ClusterScatter models={modelsData} height={480} />
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
