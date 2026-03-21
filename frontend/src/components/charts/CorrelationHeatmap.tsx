import { getBenchmarkDisplayName } from '../../data/loader'

interface CorrelationHeatmapProps {
  labels: string[]
  values: number[][]
  height?: number
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

function valueToColor(v: number): string {
  // -1 → #E63946 (red), 0 → #2A2D3A (neutral), +1 → #2A9D8F (teal)
  const red = hexToRgb('#E63946')
  const neutral = hexToRgb('#2A2D3A')
  const teal = hexToRgb('#2A9D8F')

  let r: number, g: number, b: number
  if (v < 0) {
    const t = Math.max(0, Math.min(1, -v))
    r = lerp(neutral[0], red[0], t)
    g = lerp(neutral[1], red[1], t)
    b = lerp(neutral[2], red[2], t)
  } else {
    const t = Math.max(0, Math.min(1, v))
    r = lerp(neutral[0], teal[0], t)
    g = lerp(neutral[1], teal[1], t)
    b = lerp(neutral[2], teal[2], t)
  }
  return `rgb(${r},${g},${b})`
}

function textColor(v: number): string {
  return Math.abs(v) > 0.5 ? '#EAEAEA' : '#888'
}

export default function CorrelationHeatmap({ labels, values }: CorrelationHeatmapProps) {
  const cols = labels.length

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-0.5"
        style={{ gridTemplateColumns: `auto repeat(${cols}, 36px)` }}
      >
        {/* Top-left corner */}
        <div />
        {/* Column headers */}
        {labels.map((label) => (
          <div
            key={label}
            className="flex items-end justify-center pb-1"
            style={{ height: 64 }}
          >
            <span
              className="text-[10px] text-muted whitespace-nowrap origin-bottom-left"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                display: 'block',
              }}
            >
              {getBenchmarkDisplayName(label)}
            </span>
          </div>
        ))}

        {/* Rows */}
        {labels.map((rowLabel, ri) => (
          <>
            {/* Row label */}
            <div
              key={`row-${rowLabel}`}
              className="flex items-center justify-end pr-2 text-[10px] text-muted whitespace-nowrap"
              style={{ height: 36 }}
            >
              {getBenchmarkDisplayName(rowLabel)}
            </div>

            {/* Data cells */}
            {labels.map((colLabel, ci) => {
              const v = values[ri]?.[ci] ?? 0
              const safeV = typeof v === 'number' && isFinite(v) ? v : 0
              return (
                <div
                  key={`${ri}-${ci}`}
                  className="rounded-sm flex items-center justify-center hover:ring-1 hover:ring-white/20"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: valueToColor(safeV),
                    color: textColor(safeV),
                    fontSize: 10,
                    cursor: 'default',
                  }}
                  title={`${getBenchmarkDisplayName(rowLabel)} vs ${getBenchmarkDisplayName(colLabel)}: ${safeV.toFixed(2)}`}
                >
                  {safeV.toFixed(2)}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
