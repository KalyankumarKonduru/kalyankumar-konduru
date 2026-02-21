import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { on } from '../utils/animationState'

export default function useTextDisplacement(sectionId, containerRef) {
  const tlRef = useRef(null)

  useEffect(() => {
    const unsubLand = on('landOnText', ({ section }) => {
      if (section !== sectionId || !containerRef.current) return

      const chars = containerRef.current.querySelectorAll('.char')
      if (!chars.length) return

      if (tlRef.current) tlRef.current.kill()

      tlRef.current = gsap.timeline()
      tlRef.current.to(chars, {
        y: () => 20 + Math.random() * 30,
        rotation: () => (Math.random() - 0.5) * 15,
        opacity: 0.4,
        stagger: {
          each: 0.015,
          from: 'center',
        },
        duration: 0.5,
        ease: 'power3.out',
      })
    })

    const unsubPickup = on('pickupText', ({ section }) => {
      if (section !== sectionId || !containerRef.current) return

      const chars = containerRef.current.querySelectorAll('.char')
      if (!chars.length) return

      if (tlRef.current) tlRef.current.kill()

      tlRef.current = gsap.timeline()
      tlRef.current.to(chars, {
        y: 0,
        rotation: 0,
        opacity: 1,
        stagger: {
          each: 0.02,
          from: 'edges',
        },
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
      })
    })

    return () => { unsubLand(); unsubPickup() }
  }, [sectionId, containerRef])
}
