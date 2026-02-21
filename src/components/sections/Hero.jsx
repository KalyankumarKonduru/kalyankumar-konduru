import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import useTextDisplacement from '../../hooks/useTextDisplacement'

export default function Hero({ ready }) {
  const sectionRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const metaRef = useRef(null)
  const scrollRef = useRef(null)

  useTextDisplacement('hero', sectionRef)

  useLayoutEffect(() => {
    if (!ready) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })

      tl.from(line1Ref.current.querySelectorAll('.char'), {
        yPercent: 130,
        rotateX: -50,
        opacity: 0,
        stagger: 0.035,
        duration: 1.2,
        ease: 'power4.out',
      })
      .from(line2Ref.current.querySelectorAll('.char'), {
        yPercent: 130,
        rotateX: -50,
        opacity: 0,
        stagger: 0.035,
        duration: 1.2,
        ease: 'power4.out',
      }, '-=0.9')
      .from(metaRef.current.children, {
        y: 20,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.5')
      .from(scrollRef.current, {
        opacity: 0,
        duration: 1,
      }, '-=0.3')

      gsap.to(scrollRef.current?.querySelector('.scroll-line'), {
        scaleY: 0,
        transformOrigin: 'top center',
        repeat: -1,
        yoyo: true,
        duration: 1.8,
        ease: 'power1.inOut',
      })
    })

    return () => ctx.revert()
  }, [ready])

  const renderChars = (text) =>
    text.split('').map((char, i) => (
      <span
        key={i}
        className="char inline-block"
        style={{ perspective: 600, transformStyle: 'preserve-3d' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 pb-12 overflow-hidden"
    >
      <div className="max-w-[95vw]">
        <div ref={line1Ref} className="overflow-hidden">
          <h1
            className="font-display font-bold leading-[0.88] tracking-[-0.04em] text-white"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 12rem)' }}
          >
            {renderChars('Your')}
          </h1>
        </div>

        <div ref={line2Ref} className="overflow-hidden">
          <h1
            className="font-display font-bold leading-[0.88] tracking-[-0.04em] text-white/20"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 12rem)' }}
          >
            {renderChars('Name')}
          </h1>
        </div>

        <div ref={metaRef} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 mt-8 md:mt-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-body text-sm text-white/30 tracking-wide">
              Creative Developer
            </span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/10" />
          <span className="font-body text-sm text-white/30 tracking-wide">
            Based in Your City
          </span>
          <div className="hidden md:block w-px h-4 bg-white/10" />
          <span className="font-body text-sm text-white/20 tracking-wide">
            Available for projects &mdash; 2026
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute right-6 md:right-12 bottom-12 flex flex-col items-center gap-3"
      >
        <span className="font-body text-[9px] text-white/15 tracking-[0.35em] uppercase [writing-mode:vertical-lr]">
          Scroll
        </span>
        <div className="scroll-line w-px h-12 bg-white/10" />
      </div>
    </section>
  )
}
