import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // quickTo creates one persistent tween per property — no allocation on mouse move
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power2.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power2.out' })

    const moveCursor = (e) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const grow = () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.3, duration: 0.3, ease: 'power2.out' })
      gsap.to(dot, { scale: 0.5, duration: 0.3, ease: 'power2.out' })
    }

    const shrink = () => {
      gsap.to(ring, { scale: 1, opacity: 0.5, duration: 0.3, ease: 'power2.out' })
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }

    const handleOver = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) grow()
    }

    const handleOut = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) shrink()
    }

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="custom-cursor fixed top-0 left-0 z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }}
      />
      <div
        ref={ringRef}
        className="custom-cursor fixed top-0 left-0 z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.5)',
          opacity: 0.5,
        }}
      />
    </>
  )
}
