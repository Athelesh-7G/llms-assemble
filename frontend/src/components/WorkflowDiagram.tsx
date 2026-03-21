import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface WorkflowNode {
  id: number
  x: number
  y: number
  label: string
  sublabel: string
  color: string
}

interface RowLabel {
  y: number
  text: string
  color: string
}

const NODES: WorkflowNode[] = [
  { id: 1,  x: 40,  y: 60,  label: 'HuggingFace LB',      sublabel: 'MMLU · HellaSwag · ARC',        color: '#E9C46A' },
  { id: 2,  x: 210, y: 60,  label: 'Artificial Analysis',  sublabel: 'Latency · TPS (API)',            color: '#E9C46A' },
  { id: 3,  x: 380, y: 60,  label: 'Vendor Pricing',       sublabel: 'OpenAI · Anthropic · Google',   color: '#E9C46A' },
  { id: 4,  x: 550, y: 60,  label: 'BigCode LB',           sublabel: 'HumanEval pass@1',              color: '#E9C46A' },
  { id: 5,  x: 720, y: 60,  label: 'Model Cards',          sublabel: 'Params · Context · Release',    color: '#E9C46A' },
  { id: 6,  x: 380, y: 200, label: 'data_collector.py',    sublabel: '40 models · 480 rows',          color: '#457B9D' },
  { id: 7,  x: 180, y: 340, label: 'Missing Values',       sublabel: 'Median imputation',             color: '#2A9D8F' },
  { id: 8,  x: 380, y: 340, label: 'Normalisation',        sublabel: 'Min-max · log1p',               color: '#2A9D8F' },
  { id: 9,  x: 600, y: 340, label: 'Feature Engineering',         sublabel: 'Capability · Efficiency',       color: '#2A9D8F' },
  { id: 10, x: 380, y: 480, label: 'Exploratory Data Analysis', sublabel: 'Correlations · Distributions',  color: '#E9C46A' },
  { id: 11, x: 380, y: 620, label: 'modeling.py',          sublabel: 'K-Means · PCA · Ranking',       color: '#E63946' },
  { id: 12, x: 80,  y: 760, label: 'models.json',          sublabel: '40 entries',                    color: '#888888' },
  { id: 13, x: 250, y: 760, label: 'monthly.json',         sublabel: '480 snapshots',                 color: '#888888' },
  { id: 14, x: 420, y: 760, label: 'clusters.json',        sublabel: '4 groups',                      color: '#888888' },
  { id: 15, x: 590, y: 760, label: 'rankings.json',        sublabel: '4 profiles',                    color: '#888888' },
  { id: 16, x: 760, y: 760, label: 'correlations.json',    sublabel: '11×11 matrix',                  color: '#888888' },
  { id: 17, x: 380, y: 900, label: 'React Frontend',       sublabel: '8 Interactive Pages',           color: '#E63946' },
]

const EDGES: [number, number][] = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 7], [6, 8], [6, 9],
  [7, 10], [8, 10], [9, 10],
  [10, 11],
  [11, 12], [11, 13], [11, 14], [11, 15], [11, 16],
  [12, 17], [13, 17], [14, 17], [15, 17], [16, 17],
]

const ROW_LABELS: RowLabel[] = [
  { y: 96,  text: 'Sources',  color: '#E9C46A' },
  { y: 236, text: 'Collection',  color: '#457B9D' },
  { y: 376, text: 'Preparation',  color: '#2A9D8F' },
  { y: 516, text: 'Analysis', color: '#E9C46A' },
  { y: 656, text: 'Modelling',    color: '#E63946' },
  { y: 796, text: 'Export',   color: '#888888' },
  { y: 936, text: 'Presentation', color: '#E63946' },
]

const nodeMap = new Map(NODES.map((n) => [n.id, n]))

export default function WorkflowDiagram() {
  const [themeKey, setThemeKey] = useState(0)

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeKey((k) => k + 1))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const isDark      = document.documentElement.getAttribute('data-theme') !== 'light'
  const bgCard      = isDark ? '#1E2029' : '#FFFFFF'
  const borderClr   = isDark ? '#2A2D3A' : '#CBD0DC'
  const textPrimary = isDark ? '#EAEAEA' : '#0D0F1A'
  const textMuted   = isDark ? '#888888' : '#4A5168'

  return (
    <svg
      key={themeKey}
      viewBox="-160 0 1100 1000"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Pipeline workflow diagram"
    >
      <defs>
        <marker
          id="arrowhead"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={textMuted} />
        </marker>
        <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Row labels with colored dot indicators */}
      {ROW_LABELS.map(({ y, text, color }) => (
        <g key={text}>
          <circle cx={-62} cy={y} r={4} fill={color} />
          <text
            x={-54}
            y={y}
            fontSize={12}
            fontWeight="700"
            fill={textPrimary}
            fontFamily="Inter, sans-serif"
            dominantBaseline="middle"
          >
            {text}
          </text>
        </g>
      ))}

      {/* Edges — rendered before nodes so nodes appear on top */}
      {EDGES.map(([fromId, toId]) => {
        const from = nodeMap.get(fromId)
        const to   = nodeMap.get(toId)
        if (!from || !to) return null
        const cx   = from.x + (from.id === 10 ? 100 : 80)
        const cy   = from.y + 36
        const cx2  = to.x   + (to.id === 10 ? 100 : 80)
        const cy2  = to.y   + 36
        const midY = (cy + cy2) / 2
        return (
          <path
            key={`${fromId}-${toId}`}
            d={`M ${cx},${cy} C ${cx},${midY} ${cx2},${midY} ${cx2},${cy2}`}
            stroke={borderClr}
            strokeWidth={1.5}
            fill="none"
            markerEnd="url(#arrowhead)"
            opacity={0.6}
          />
        )
      })}

      {/* Nodes */}
      {NODES.map((node, index) => (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
          >
            <title>{node.label}: {node.sublabel}</title>
            <rect
              width={node.id === 10 ? 200 : 160}
              height={72}
              rx={10}
              fill={bgCard}
              stroke={node.color}
              strokeWidth={1.5}
              filter="url(#node-shadow)"
            />
            <rect x={0} y={0} width={4} height={72} rx={2} fill={node.color} />
            <circle cx={16} cy={36} r={5} fill={node.color} opacity={0.9} />
            <text
              x={28}
              y={26}
              fontSize={11}
              fontWeight="600"
              fill={textPrimary}
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
            >
              {node.label}
            </text>
            <text
              x={28}
              y={50}
              fontSize={9.5}
              fill={isDark ? "rgba(234,234,234,0.75)" : "rgba(13,15,26,0.70)"}
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
            >
              {node.sublabel}
            </text>
          </motion.g>
        </g>
      ))}
    </svg>
  )
}