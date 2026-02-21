import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '../ui/TextReveal'
import useTextDisplacement from '../../hooks/useTextDisplacement'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)

  useTextDisplacement('about', sectionRef)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          once: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-40 md:py-56 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20">
          <div className="md:col-span-4">
            <TextReveal
              as="span"
              className="font-display text-xs font-medium tracking-[0.3em] uppercase text-accent/50"
            >
              About
            </TextReveal>
            <div ref={lineRef} className="h-px bg-white/[0.06] mt-8" />
          </div>

          <div className="md:col-span-8 space-y-10">
            <TextReveal
              as="h2"
              className="font-display text-3xl md:text-[2.75rem] font-bold leading-[1.15] text-white/90 tracking-[-0.02em]"
            >
              I build digital experiences that merge technical precision with creative vision.
            </TextReveal>

            <TextReveal
              as="p"
              className="font-body text-white/30 text-base md:text-lg leading-[1.85]"
              delay={0.15}
            >
              With deep expertise in full-stack development and a passion for pushing the boundaries of what the web can do, I create interfaces that are as performant as they are beautiful. Every animation is intentional. Every interaction is considered.
            </TextReveal>

            <TextReveal
              as="p"
              className="font-body text-white/30 text-base md:text-lg leading-[1.85]"
              delay={0.25}
            >
              My background spans systems architecture, real-time applications, and creative coding. I believe the best digital products feel inevitable — like they could not have been built any other way.
            </TextReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-12 border-t border-white/[0.04]">
              {[
                { number: '5+', label: 'Years' },
                { number: '40+', label: 'Projects' },
                { number: '60', label: 'FPS Min' },
                { number: '∞', label: 'Curiosity' },
              ].map((stat, i) => (
                <Stat key={stat.label} {...stat} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ number, label, index }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 25,
        opacity: 0,
        duration: 0.9,
        delay: 0.5 + index * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 92%',
          once: true,
        },
      })
    })
    return () => ctx.revert()
  }, [index])

  return (
    <div ref={ref}>
      <div className="font-display text-2xl md:text-3xl font-bold text-accent/80">
        {number}
      </div>
      <div className="font-body text-[10px] text-white/20 mt-2 tracking-[0.2em] uppercase">
        {label}
      </div>
    </div>
  )
}
