interface SkeletonProps {
  width?: string | number
  height?: number
  className?: string
}

export default function Skeleton({ width, height, className = '' }: SkeletonProps) {
  const style: React.CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) style.height = `${height}px`

  return (
    <div
      className={`bg-[var(--border)] animate-pulse rounded ${className}`}
      style={style}
    />
  )
}
