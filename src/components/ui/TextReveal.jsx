import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function TextReveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  stagger = 0.03,
  triggerStart = 'top 85%',
}) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = containerRef.current.querySelectorAll('.word-inner')

      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        stagger,
        delay,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: triggerStart,
          once: true,
        },
      })
    })

    return () => ctx.revert()
  }, [delay, stagger, triggerStart])

  const splitText = typeof children === 'string'
    ? children.split(' ').map((word, wi) => (
        <span key={wi} className="word-wrap inline-block overflow-hidden">
          <span className="word-inner inline-block">
            {word.split('').map((ch, ci) => (
              <span key={ci} className="char inline-block">{ch}</span>
            ))}
          </span>
          {'\u00A0'}
        </span>
      ))
    : children

  return (
    <Tag ref={containerRef} className={className}>
      {splitText}
    </Tag>
  )
}
