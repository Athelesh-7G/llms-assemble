import { useEffect, useRef } from "react"

const ACCENT_COLORS = ["#E63946", "#457B9D", "#2A9D8F", "#E9C46A"]
const NODE_COUNT = 90
const CONNECTION_DIST = 200
const PULSE_SPEED = 0.014

const LLM_LABELS = [
  "GPT-5", "Claude 4", "Gemini 3", "Llama 4",
  "Grok 4", "DeepSeek", "Qwen3", "Mistral",
  "GPT-4o", "Gemini 2.5", "Phi-3", "Command R+",
  "Mixtral", "Llama 3.1", "Claude 3.5", "GPT-5 mini",
  "DeepSeek R1", "Qwen3 235B", "Grok 3", "Gemma 3",
]

const BADGE_TEXTS = [
  "MMLU 93.0", "HumanEval 95", "MATH 88",
  "ARC 97.5", "HellaSwag 96", "TPS 280",
  "128K ctx", "1M ctx", "$0.14/1M",
  "671B MoE", "405B", "reasoning",
  "open source", "frontier", "multimodal",
]

interface Node {
  x: number; y: number
  vx: number; vy: number
  radius: number; color: string
  pulse: number; pulseDir: number
  label?: string
}

interface DataPulse {
  ax: number; ay: number
  bx: number; by: number
  t: number; speed: number; color: string
}

interface Badge {
  x: number; y: number
  vy: number; vx: number
  text: string
  alpha: number
  color: string
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse     = useRef({ x: -999, y: -999 })
  const nodes     = useRef<Node[]>([])
  const pulses    = useRef<DataPulse[]>([])
  const badges    = useRef<Badge[]>([])
  const frame     = useRef(0)
  const tick      = useRef(0)

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

    function initNodes() {
      nodes.current = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: i < LLM_LABELS.length ? 7 + Math.random() * 4 : 2 + Math.random() * 2,
        color: ACCENT_COLORS[i % ACCENT_COLORS.length],
        pulse: Math.random(),
        pulseDir: Math.random() > 0.5 ? 1 : -1,
        label: i < LLM_LABELS.length ? LLM_LABELS[i] : undefined,
      }))
      pulses.current = []
      badges.current = Array.from({ length: 12 }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.12 - Math.random() * 0.15,
        text: BADGE_TEXTS[Math.floor(Math.random() * BADGE_TEXTS.length)],
        alpha: 0.15 + Math.random() * 0.25,
        color: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)],
      }))
    }
    initNodes()

    function spawnPulse() {
      const ns = nodes.current
      if (ns.length < 2) return
      const a = ns[Math.floor(Math.random() * ns.length)]
      const b = ns[Math.floor(Math.random() * ns.length)]
      if (a === b) return
      const dx = b.x - a.x, dy = b.y - a.y
      if (Math.sqrt(dx * dx + dy * dy) > CONNECTION_DIST) return
      pulses.current.push({
        ax: a.x, ay: a.y,
        bx: b.x, by: b.y,
        t: 0,
        speed: PULSE_SPEED + Math.random() * 0.01,
        color: a.color,
      })
    }

    function drawGlow(x: number, y: number, r: number, color: string, alpha: number) {
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r * 3.5)
      g.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, "0"))
      g.addColorStop(1, color + "00")
      ctx!.beginPath()
      ctx!.arc(x, y, r * 3.5, 0, Math.PI * 2)
      ctx!.fillStyle = g
      ctx!.fill()
    }

    function loop() {
      const W = canvas!.width, H = canvas!.height
      ctx!.clearRect(0, 0, W, H)

      tick.current++

      // Spawn 2 pulses every ~45 frames
      if (tick.current % 45 === 0) { spawnPulse(); spawnPulse() }

      const ns = nodes.current

      // Subtle background dot grid
      ctx!.fillStyle = "rgba(255,255,255,0.025)"
      for (let gx = 0; gx < W; gx += 60) {
        for (let gy = 0; gy < H; gy += 60) {
          ctx!.beginPath()
          ctx!.arc(gx, gy, 0.8, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      // Draw floating benchmark badges
      for (const b of badges.current) {
        b.x += b.vx
        b.y += b.vy
        if (b.y < -20) { b.y = canvas!.height + 20; b.x = Math.random() * canvas!.width }
        if (b.x < -80) { b.x = canvas!.width + 80 }
        if (b.x > canvas!.width + 80) { b.x = -80 }

        ctx!.font = "bold 10px Inter, monospace"
        ctx!.textAlign = "center"
        const tw = ctx!.measureText(b.text).width
        ;(ctx! as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(
          b.x - tw / 2 - 6, b.y - 9, tw + 12, 18, 9
        )
        ctx!.fillStyle = b.color + Math.round(b.alpha * 0.4 * 255).toString(16).padStart(2, "0")
        ctx!.strokeStyle = b.color + Math.round(b.alpha * 255).toString(16).padStart(2, "0")
        ctx!.lineWidth = 0.8
        ctx!.fill()
        ctx!.stroke()
        ctx!.fillStyle = b.color + Math.round(b.alpha * 255).toString(16).padStart(2, "0")
        ctx!.fillText(b.text, b.x, b.y + 3)
      }

      // Draw edges between nearby nodes
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[i].x - ns[j].x
          const dy = ns[i].y - ns[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > CONNECTION_DIST) continue
          const alpha = (1 - dist / CONNECTION_DIST) * 0.35

          const grad = ctx!.createLinearGradient(ns[i].x, ns[i].y, ns[j].x, ns[j].y)
          grad.addColorStop(0, ns[i].color + Math.round(alpha * 255).toString(16).padStart(2, "0"))
          grad.addColorStop(1, ns[j].color + Math.round(alpha * 255).toString(16).padStart(2, "0"))
          ctx!.beginPath()
          ctx!.moveTo(ns[i].x, ns[i].y)
          ctx!.lineTo(ns[j].x, ns[j].y)
          ctx!.strokeStyle = grad
          ctx!.lineWidth = alpha * 2.5
          ctx!.stroke()
        }
      }

      // Draw data pulses
      pulses.current = pulses.current.filter(p => {
        p.t += p.speed
        if (p.t > 1) return false
        const px = p.ax + (p.bx - p.ax) * p.t
        const py = p.ay + (p.by - p.ay) * p.t
        drawGlow(px, py, 4, p.color, 0.5)
        ctx!.beginPath()
        ctx!.arc(px, py, 4, 0, Math.PI * 2)
        ctx!.fillStyle = p.color + "FF"
        ctx!.fill()
        return true
      })

      // Draw nodes
      for (const n of ns) {
        // Mouse repulsion
        const dx = n.x - mouse.current.x
        const dy = n.y - mouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120 && dist > 0) {
          const f = (120 - dist) / 120 * 0.25
          n.vx += (dx / dist) * f
          n.vy += (dy / dist) * f
        }

        // Damping + speed cap
        n.vx *= 0.98; n.vy *= 0.98
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (spd > 1.2) { n.vx = n.vx / spd * 1.2; n.vy = n.vy / spd * 1.2 }

        n.x += n.vx; n.y += n.vy
        if (n.x < 0) { n.x = 0; n.vx *= -1 }
        if (n.x > W) { n.x = W; n.vx *= -1 }
        if (n.y < 0) { n.y = 0; n.vy *= -1 }
        if (n.y > H) { n.y = H; n.vy *= -1 }

        // Pulse glow
        n.pulse += n.pulseDir * 0.018
        if (n.pulse > 1) { n.pulse = 1; n.pulseDir = -1 }
        if (n.pulse < 0) { n.pulse = 0; n.pulseDir = 1 }

        // Outer glow
        drawGlow(n.x, n.y, n.radius, n.color, 0.25 + n.pulse * 0.25)

        // Node dot
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx!.fillStyle = n.color + "CC"
        ctx!.fill()

        // Inner bright core
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.radius * 0.45, 0, Math.PI * 2)
        ctx!.fillStyle = "#FFFFFF" + Math.round((0.5 + n.pulse * 0.5) * 255).toString(16).padStart(2, "0")
        ctx!.fill()

        // Label for named nodes
        if (n.label) {
          ctx!.font = "bold 10px Inter, sans-serif"
          ctx!.fillStyle = "#FFFFFF99"
          ctx!.textAlign = "center"
          ctx!.fillText(n.label, n.x, n.y - n.radius - 5)
        }
      }

      frame.current = requestAnimationFrame(loop)
    }
    loop()

    const onMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect()
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouse.current = { x: -999, y: -999 } }
    const onResize = () => { resize(); initNodes() }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frame.current)
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
