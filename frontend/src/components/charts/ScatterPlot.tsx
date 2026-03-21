import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface ScatterPlotPoint {
  x: number
  y: number
  size: number
  name: string
  color: string
  cluster: string
}

interface ScatterPlotProps {
  data: ScatterPlotPoint[]
  xLabel: string
  yLabel: string
  title?: string
  logX?: boolean
  height?: number
  /** Show permanent labels for top N models by y-value. Default 5. */
  highlightTop?: number
  /** Show quadrant reference areas (for latency vs cost chart). */
  showQuadrants?: boolean
  onSelect?: (name: string) => void
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export default function ScatterPlot({
  data,
  xLabel,
  yLabel,
  title,
  logX = false,
  height = 400,
  highlightTop = 5,
  showQuadrants = false,
  onSelect,
}: ScatterPlotProps) {
  if (data.length === 0) return null

  const sizes = data.map((d) => d.size)
  const minSize = Math.min(...sizes)
  const maxSize = Math.max(...sizes)
  const sizeRange = maxSize - minSize || 1

  const medianX = median(data.map((d) => d.x))
  const medianY = median(data.map((d) => d.y))
  const minX = Math.min(...data.map((d) => d.x))
  const maxX = Math.max(...data.map((d) => d.x))
  const minY = Math.min(...data.map((d) => d.y))
  const maxY = Math.max(...data.map((d) => d.y))

  // Top N models by y-value get permanent labels
  const topNNames = new Set(
    [...data].sort((a, b) => b.y - a.y).slice(0, highlightTop).map((d) => d.name)
  )

  const renderDot = (props: unknown) => {
    const { cx, cy, payload } = props as {
      cx: number
      cy: number
      payload: ScatterPlotPoint
    }
    const normalised = (payload.size - minSize) / sizeRange
    const r = 4 + normalised * 14  // max radius 18
    const isHighlighted = topNNames.has(payload.name)
    const shortName = payload.name.split(' ').slice(0, 2).join(' ')
    const approxWidth = shortName.length * 5.5 + 8

    return (
      <g key={payload.name}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={payload.color}
          fillOpacity={0.75}
          stroke={payload.color}
          strokeWidth={1}
          className={onSelect ? 'cursor-pointer' : ''}
          onClick={() => onSelect?.(payload.name)}
        />
        {isHighlighted && (
          <>
            <rect
              x={cx - approxWidth / 2}
              y={cy - 26}
              width={approxWidth}
              height={14}
              fill="var(--bg-card)"
              fillOpacity={0.9}
              rx={2}
            />
            <text
              x={cx}
              y={cy - 15}
              fill="var(--text-primary)"
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
            >
              {shortName}
            </text>
          </>
        )}
      </g>
    )
  }

  return (
    <div>
      {title && <p className="text-sm font-semibold text-primary mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 30, right: 40, left: 10, bottom: 40 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            scale={logX ? 'log' : 'auto'}
            domain={logX ? ['auto', 'auto'] : undefined}
            name={xLabel}
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickCount={5}
            label={{ value: xLabel, position: 'insideBottom', offset: -8, fill: 'var(--text-muted)' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickCount={6}
            width={70}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-muted)' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload as ScatterPlotPoint
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                  <div className="font-semibold text-sm text-primary mb-1">{p.name}</div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        p.cluster === 'Frontier'    ? 'bg-[#E63946]' :
                        p.cluster === 'Balanced'    ? 'bg-[#457B9D]' :
                        p.cluster === 'Efficient'   ? 'bg-[#2A9D8F]' :
                        p.cluster === 'Lightweight' ? 'bg-[#E9C46A]' :
                                                      'bg-border'
                      }`}
                    />
                    <span className="text-xs text-muted">{p.cluster}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {xLabel}: <span className="text-primary">{p.x.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {yLabel}: <span className="text-primary">{p.y.toFixed(2)}</span>
                  </div>
                </div>
              )
            }}
          />
          {showQuadrants && (
            <>
              <ReferenceArea
                x1={minX} x2={medianX} y1={medianY} y2={maxY}
                fill="#2A9D8F" fillOpacity={0.04}
                label={{ value: 'Cheap + Fast \u2713', position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <ReferenceArea
                x1={medianX} x2={maxX} y1={medianY} y2={maxY}
                fill="#E9C46A" fillOpacity={0.04}
                label={{ value: 'Expensive + Fast', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <ReferenceArea
                x1={minX} x2={medianX} y1={minY} y2={medianY}
                fill="#888888" fillOpacity={0.02}
                label={{ value: 'Cheap + Slow', position: 'insideBottomLeft', fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <ReferenceArea
                x1={medianX} x2={maxX} y1={minY} y2={medianY}
                fill="#E63946" fillOpacity={0.04}
                label={{ value: 'Expensive + Slow \u2717', position: 'insideBottomRight', fill: 'var(--text-muted)', fontSize: 11 }}
              />
            </>
          )}
          <ReferenceLine x={medianX} stroke="var(--border)" strokeDasharray="4 4" />
          <ReferenceLine y={medianY} stroke="var(--border)" strokeDasharray="4 4" />
          <Scatter data={data} shape={renderDot} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
