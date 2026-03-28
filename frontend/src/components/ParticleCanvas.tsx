import { useEffect, useRef } from "react"

const COLORS = ["#E63946", "#457B9D", "#2A9D8F", "#E9C46A"]
const PARTICLE_COUNT = 65
const CONNECTION_DISTANCE = 180
const MOUSE_REPEL_RADIUS = 140
const MOUSE_REPEL_STRENGTH = 0.18
const MAX_SPEED = 1.0

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
}

export default function ParticleCanvas() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const mouseRef    = useRef({ x: -999, y: -999 })
  const particles   = useRef<Particle[]>([])
  const frameRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()

    function init() {
      particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x:       Math.random() * canvas!.width,
        y:       Math.random() * canvas!.height,
        vx:      (Math.random() - 0.5) * 0.5,
        vy:      (Math.random() - 0.5) * 0.5,
        radius:  Math.random() * 3.5 + 3,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.4 + 0.5,
      }))
    }
    init()

    function loop() {
      const W = canvas!.width
      const H = canvas!.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx!.clearRect(0, 0, W, H)

      const ps = particles.current

      // ── Update positions ──────────────────────────────────
      for (const p of ps) {
        // Smooth mouse repulsion
        const dx   = p.x - mx
        const dy   = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
          const force = ((MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS) ** 1.5
          p.vx += (dx / dist) * force * MOUSE_REPEL_STRENGTH
          p.vy += (dy / dist) * force * MOUSE_REPEL_STRENGTH
        }

        // Gentle drag so they don't stop
        p.vx *= 0.985
        p.vy *= 0.985

        // Minimum drift — particles never fully stop
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd < 0.15) {
          p.vx += (Math.random() - 0.5) * 0.08
          p.vy += (Math.random() - 0.5) * 0.08
        }

        // Speed cap
        if (spd > MAX_SPEED) {
          p.vx = (p.vx / spd) * MAX_SPEED
          p.vy = (p.vy / spd) * MAX_SPEED
        }

        p.x += p.vx
        p.y += p.vy

        // Soft bounce off edges
        if (p.x < p.radius)      { p.x = p.radius;      p.vx = Math.abs(p.vx) * 0.7 }
        if (p.x > W - p.radius)  { p.x = W - p.radius;  p.vx = -Math.abs(p.vx) * 0.7 }
        if (p.y < p.radius)      { p.y = p.radius;       p.vy = Math.abs(p.vy) * 0.7 }
        if (p.y > H - p.radius)  { p.y = H - p.radius;  p.vy = -Math.abs(p.vy) * 0.7 }
      }

      // ── Draw connections first (behind nodes) ─────────────
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx   = ps[i].x - ps[j].x
          const dy   = ps[i].y - ps[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > CONNECTION_DISTANCE) continue

          // Stronger opacity for closer pairs
          const t       = 1 - dist / CONNECTION_DISTANCE
          const alpha   = t * t * 0.65   // quadratic falloff — close pairs bright

          const grad = ctx!.createLinearGradient(
            ps[i].x, ps[i].y, ps[j].x, ps[j].y
          )
          const hex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0")
          grad.addColorStop(0, ps[i].color + hex(alpha * ps[i].opacity))
          grad.addColorStop(1, ps[j].color + hex(alpha * ps[j].opacity))

          ctx!.beginPath()
          ctx!.moveTo(ps[i].x, ps[i].y)
          ctx!.lineTo(ps[j].x, ps[j].y)
          ctx!.strokeStyle = grad
          ctx!.lineWidth   = t * 2.0 + 0.4
          ctx!.stroke()
        }
      }

      // ── Draw nodes on top ──────────────────────────────────
      for (const p of ps) {
        // Soft glow
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
        glow.addColorStop(0, p.color + Math.round(p.opacity * 0.45 * 255).toString(16).padStart(2, "0"))
        glow.addColorStop(1, p.color + "00")
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx!.fillStyle = glow
        ctx!.fill()

        // Node body
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx!.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, "00")
        ctx!.fill()

        // Bright inner core
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2)
        ctx!.fillStyle = "rgba(255,255,255,0.75)"
        ctx!.fill()
      }

      frameRef.current = requestAnimationFrame(loop)
    }
    loop()

    const onMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave  = () => { mouseRef.current = { x: -999, y: -999 } }
    const onResize = () => { resize(); init() }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
    />
  )
}
