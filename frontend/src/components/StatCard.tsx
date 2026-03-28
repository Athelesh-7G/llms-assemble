import React from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
  animateCount?: boolean
  subtitle?: string
}

function AnimatedValue({ value }: { value: number }) {
  const count = useCountUp(value)
  return <>{count}</>
}

export default function StatCard({
  icon,
  value,
  label,
  color,
  animateCount = false,
  subtitle,
}: StatCardProps) {
  const displayValue =
    animateCount && typeof value === 'number' ? (
      <AnimatedValue value={value} />
    ) : (
      value
    )

  return (
    <motion.div
      className="bg-card border border-[var(--border)] rounded-xl p-5"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}26` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-primary leading-tight">{displayValue}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
      {subtitle && <div className="text-xs text-primary mt-0.5">{subtitle}</div>}
    </motion.div>
  )
}
