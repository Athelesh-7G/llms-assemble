import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // FIX 1: faster spring configs
  const springConfig = { damping: 20, stiffness: 800, mass: 0.2 }
  const trailSpringX = useSpring(cursorX, springConfig)
  const trailSpringY = useSpring(cursorY, springConfig)

  const outerSpringX = useSpring(cursorX, { damping: 22, stiffness: 600, mass: 0.3 })
  const outerSpringY = useSpring(cursorY, { damping: 22, stiffness: 600, mass: 0.3 })

  useEffect(() => {
    // FIX 3: class-based cursor:none — no JSX style tag, no blink
    document.body.classList.add("custom-cursor-active")

    return () => {
      document.body.classList.remove("custom-cursor-active")
      document.body.style.cursor = ""
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const onLeave = () => setIsVisible(false)
    const onEnter = () => setIsVisible(true)

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.tagName === "A" ||
        target.tagName === "BUTTON"
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    window.addEventListener("mouseenter", onEnter)
    window.addEventListener("mouseover", onMouseOver)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("mouseenter", onEnter)
      window.removeEventListener("mouseover", onMouseOver)
    }
  }, [cursorX, cursorY, isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* FIX 2: blue theme — Outer slow ring */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: outerSpringX,
          y: outerSpringY,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          border: "1.5px solid rgba(69, 123, 157, 0.8)",
          backgroundColor: "rgba(69, 123, 157, 0.04)",
          pointerEvents: "none",
          zIndex: 9998,
          mixBlendMode: "normal",
          boxShadow: isHovering
            ? "0 0 20px rgba(42,157,143,0.4), 0 0 40px rgba(42,157,143,0.15)"
            : "0 0 15px rgba(69,123,157,0.3), 0 0 30px rgba(69,123,157,0.1)",
        }}
        animate={{
          width: isHovering ? 56 : 40,
          height: isHovering ? 56 : 40,
          borderColor: isHovering
            ? "rgba(42, 157, 143, 0.9)"
            : "rgba(69, 123, 157, 0.8)",
          backgroundColor: isHovering
            ? "rgba(42, 157, 143, 0.12)"
            : "rgba(69, 123, 157, 0.04)",
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Inner dot — follows cursor exactly */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
        }}
        animate={{
          width: isHovering ? 6 : 8,
          height: isHovering ? 6 : 8,
          backgroundColor: isHovering ? "#2A9D8F" : "#457B9D",
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Glow trail */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: trailSpringX,
          y: trailSpringY,
          translateX: "-50%",
          translateY: "-50%",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(69,123,157,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 9997,
        }}
      />
    </>
  )
}
