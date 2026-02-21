import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  'Creative Development',
  'UI Engineering',
  'Interactive Design',
  '3D & WebGL',
  'Performance Obsessed',
  'Motion Design',
  'Full-Stack Architecture',
]

export default function Marquee() {
  const containerRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -2,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  const content = ITEMS.map((item, i) => (
    <span key={i} className="flex items-center gap-8 shrink-0">
      <span className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white/[0.03] whitespace-nowrap select-none">
        {item}
      </span>
      <span className="w-2 h-2 rounded-full bg-accent/20 shrink-0" />
    </span>
  ))

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden py-10 md:py-16 border-y border-white/[0.03]"
    >
      <div ref={trackRef} className="flex items-center gap-8 animate-marquee">
        <div className="flex items-center gap-8 shrink-0">{content}</div>
        <div className="flex items-center gap-8 shrink-0">{content}</div>
      </div>
    </div>
  )
}
