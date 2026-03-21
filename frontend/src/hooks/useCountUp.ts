import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration: number = 1200): number {
  const [current, setCurrent] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) {
      setCurrent(0)
      return
    }

    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setCurrent(Math.round(eased * target))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration])

  return current
}
