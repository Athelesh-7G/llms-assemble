import { getClusterColor } from '../data/loader'

interface ClusterBadgeProps {
  label: string
  size?: 'sm' | 'md'
}

export default function ClusterBadge({ label, size = 'md' }: ClusterBadgeProps) {
  const color = getClusterColor(label)
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`rounded-full font-semibold ${sizeClasses}`}
      style={{
        backgroundColor: `${color}26`,
        color,
        border: `1px solid ${color}66`,
      }}
    >
      {label}
    </span>
  )
}
