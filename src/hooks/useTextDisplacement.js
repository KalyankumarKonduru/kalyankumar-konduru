import { useEffect } from 'react'
import gsap from 'gsap'
import { characterScreen } from '../utils/animationState'

const INFLUENCE_RADIUS = 150 // px — how close the character needs to be
const PUSH_STRENGTH = 80     // px — maximum displacement at zero distance
const SPRING_DELAY = 500     // ms — hang time before letters spring back

export default function useTextDisplacement(sectionId, containerRef) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = null
    let chars = []
    const letterState = new Map()
    let overflowUnlocked = false
    let hasDisplaced = false

    function refreshChars() {
      chars = Array.from(container.querySelectorAll('.char'))
    }

    // Watch for dynamically rendered char elements
    const observer = new MutationObserver(refreshChars)
    observer.observe(container, { childList: true, subtree: true })
    refreshChars()

    // Remove overflow:hidden from ancestors so displaced letters aren't clipped
    function unlockOverflow() {
      if (overflowUnlocked) return
      overflowUnlocked = true
      chars.forEach((el) => {
        let node = el.parentElement
        while (node && node !== container) {
          const ov = getComputedStyle(node).overflow
          if (ov === 'hidden' || ov === 'clip') {
            node.style.overflow = 'visible'
          }
          node = node.parentElement
        }
      })
    }

    function tick() {
      const { x, y, moving } = characterScreen
      const now = performance.now()

      // Active displacement: only when character is moving
      if (moving && x > -9000) {
        // Quick bounds check — skip if character is far from this section
        const sRect = container.getBoundingClientRect()
        const near =
          x > sRect.left - INFLUENCE_RADIUS &&
          x < sRect.right + INFLUENCE_RADIUS &&
          y > sRect.top - INFLUENCE_RADIUS &&
          y < sRect.bottom + INFLUENCE_RADIUS

        if (near) {
          for (let i = 0; i < chars.length; i++) {
            const el = chars[i]
            let s = letterState.get(el)
            if (!s) {
              s = { hit: false, hitTime: 0, springing: false, tween: null }
              letterState.set(el, s)
            }

            // Subtract current GSAP displacement to find rest position
            const gx = gsap.getProperty(el, 'x') || 0
            const gy = gsap.getProperty(el, 'y') || 0
            const rect = el.getBoundingClientRect()
            const restX = rect.left + rect.width / 2 - gx
            const restY = rect.top + rect.height / 2 - gy

            const ddx = restX - x
            const ddy = restY - y
            const dist = Math.sqrt(ddx * ddx + ddy * ddy)

            if (dist < INFLUENCE_RADIUS && dist > 0.1) {
              unlockOverflow()
              hasDisplaced = true

              // Kill any spring-back tween
              if (s.tween) { s.tween.kill(); s.tween = null }
              s.springing = false

              const force = Math.pow(1 - dist / INFLUENCE_RADIUS, 2)
              const nx = ddx / dist
              const ny = ddy / dist

              gsap.set(el, {
                x: nx * force * PUSH_STRENGTH,
                y: ny * force * PUSH_STRENGTH,
                rotation: (ddx > 0 ? 1 : -1) * force * 25,
                opacity: 0.3 + 0.7 * (1 - force),
              })

              s.hit = true
              s.hitTime = now
            }
          }
        }
      }

      // Spring-back pass: letters return after SPRING_DELAY
      if (hasDisplaced) {
        let anyHit = false
        letterState.forEach((s, el) => {
          if (s.hit && !s.springing && now - s.hitTime > SPRING_DELAY) {
            s.springing = true
            s.tween = gsap.to(el, {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'elastic.out(1, 0.4)',
              onComplete() {
                s.hit = false
                s.springing = false
                s.tween = null
              },
            })
          }
          if (s.hit) anyHit = true
        })
        if (!anyHit) hasDisplaced = false
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      letterState.forEach((s) => { if (s.tween) s.tween.kill() })
      letterState.clear()
      chars.forEach((el) => gsap.set(el, { clearProps: 'x,y,rotation,opacity' }))
    }
  }, [sectionId, containerRef])
}
