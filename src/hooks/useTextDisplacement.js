import { useEffect } from 'react'
import gsap from 'gsap'
import { characterScreen } from '../utils/animationState'

const INFLUENCE_RADIUS = 150 // px — how close the character needs to be
const PUSH_STRENGTH = 80     // px — maximum displacement at zero distance
const SPRING_DELAY = 500     // ms — hang time before letters spring back

// Glow / color constants
const GLOW_COLOR = '200, 168, 124'   // accent RGB for text-shadow
const TOUCH_COLOR = '#e8d5b5'        // bright accent when character "touches" text
const TOUCH_THRESHOLD = 0.5          // force level that triggers color change

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

              // --- CSS3D Renderer-style effects ---
              // Text tilts away from the character like a physical panel in 3D space
              const tiltX = -ny * force * 15   // vertical tilt
              const tiltY = nx * force * 20    // horizontal tilt

              // --- Raycasting-style glow detection ---
              // Glow intensifies as the character gets closer (simulates limb intersection)
              const glowSize = force * 25
              const glowAlpha = force * 0.8
              const glowSpread = force * 40

              gsap.set(el, {
                x: nx * force * PUSH_STRENGTH,
                y: ny * force * PUSH_STRENGTH,
                rotation: (ddx > 0 ? 1 : -1) * force * 25,
                // CSS3D perspective transforms — text rotates in 3D like a flat panel
                rotationX: tiltX,
                rotationY: tiltY,
                transformPerspective: 600,
                // Scale pop — text briefly enlarges on contact
                scale: 1 + force * 0.15,
                opacity: 0.3 + 0.7 * (1 - force),
                // Glow effect — simulates raycasting "hit" detection
                textShadow: `0 0 ${glowSize}px rgba(${GLOW_COLOR}, ${glowAlpha}), 0 0 ${glowSpread}px rgba(${GLOW_COLOR}, ${glowAlpha * 0.5})`,
                // Color shift when character "touches" text (force > threshold)
                color: force > TOUCH_THRESHOLD ? TOUCH_COLOR : '',
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
              rotationX: 0,
              rotationY: 0,
              scale: 1,
              opacity: 1,
              textShadow: `0 0 0px rgba(${GLOW_COLOR}, 0)`,
              duration: 0.9,
              ease: 'elastic.out(1, 0.4)',
              onComplete() {
                s.hit = false
                s.springing = false
                s.tween = null
                // Clear all enhanced properties
                gsap.set(el, {
                  clearProps: 'color,textShadow,transformPerspective,rotationX,rotationY,scale',
                })
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
      chars.forEach((el) => gsap.set(el, {
        clearProps: 'x,y,rotation,opacity,rotationX,rotationY,scale,textShadow,color,transformPerspective',
      }))
    }
  }, [sectionId, containerRef])
}
