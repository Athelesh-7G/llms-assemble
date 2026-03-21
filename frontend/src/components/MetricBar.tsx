import { motion } from 'framer-motion'

interface MetricBarProps {
  value: number
  color: string
  label: string
  showValue?: boolean
}

export default function MetricBar({ value, color, label, showValue = true }: MetricBarProps) {
  const pct = `${(value * 100).toFixed(1)}%`

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted">{label}</span>
        {showValue && <span className="text-xs text-primary font-medium">{pct}</span>}
      </div>
      <div className="w-full bg-[var(--border)] rounded-full h-[6px] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
