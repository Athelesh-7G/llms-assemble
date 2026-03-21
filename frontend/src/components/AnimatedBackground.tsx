import { useRef, useEffect } from 'react'

interface AnimatedBackgroundProps {
  variant?: 'dots' | 'grid' | 'orbs'
}

export default function AnimatedBackground({ variant: _variant = 'orbs' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs = [
      { x: 0.2, y: 0.3, r: 300, color: 'rgba(230,57,70,0.12)',   speed: 0.0003 },
      { x: 0.8, y: 0.2, r: 250, color: 'rgba(69,123,157,0.10)',  speed: 0.0004 },
      { x: 0.5, y: 0.8, r: 350, color: 'rgba(42,157,143,0.08)',  speed: 0.0002 },
      { x: 0.1, y: 0.7, r: 200, color: 'rgba(233,196,106,0.07)', speed: 0.0005 },
    ]

    const dots: { x: number; y: number; opacity: number; speed: number }[] = []
    for (let i = 0; i < 80; i++) {
      dots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.3 + 0.1,
      })
    }

    const draw = () => {
      t++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Floating orbs
      orbs.forEach((orb, i) => {
        const cx = (orb.x + Math.sin(t * orb.speed + i) * 0.08) * canvas.width
        const cy = (orb.y + Math.cos(t * orb.speed + i) * 0.06) * canvas.height
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r)
        grad.addColorStop(0, orb.color)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, orb.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Subtle dot grid
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Floating upward particles
      dots.forEach((dot) => {
        dot.y -= dot.speed
        if (dot.y < -5) dot.y = canvas.height + 5
        ctx.fillStyle = `rgba(255,255,255,${dot.opacity})`
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
