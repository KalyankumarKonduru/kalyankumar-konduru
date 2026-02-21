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
              I engineer systems that scale and interfaces that feel alive.
            </TextReveal>

            <TextReveal
              as="p"
              className="font-body text-white/30 text-base md:text-lg leading-[1.85]"
              delay={0.15}
            >
              I&apos;m a full-stack software engineer with a Master&apos;s in Computer Science from Purdue University and 4+ years of professional experience shipping production software. My work lives at the intersection of robust backend architecture and polished, high-performance frontends — from designing Go-based Kubernetes autoscalers that slashed infrastructure costs by 40%, to crafting React interfaces that load 75% faster through surgical state management.
            </TextReveal>

            <TextReveal
              as="p"
              className="font-body text-white/30 text-base md:text-lg leading-[1.85]"
              delay={0.25}
            >
              I&apos;ve driven digital transformation at Accenture across healthcare and enterprise systems, built clinical AI integrations at Medical Informatics Engineering, and engineered everything from GraphQL APIs with sub-100ms response times to accessible component libraries meeting WCAG 2.1 AA standards. I think in systems, ship in sprints, and obsess over the details that separate good software from great.
            </TextReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-12 border-t border-white/[0.04]">
              <TextReveal as="div" delay={0.3}>
                <span className="font-display text-xs font-medium tracking-[0.2em] uppercase text-accent/40">Languages</span>
                <p className="font-body text-sm text-white/30 mt-3 leading-relaxed">Java, Go, JavaScript, TypeScript</p>
              </TextReveal>
              <TextReveal as="div" delay={0.35}>
                <span className="font-display text-xs font-medium tracking-[0.2em] uppercase text-accent/40">Frontend</span>
                <p className="font-body text-sm text-white/30 mt-3 leading-relaxed">React, Next.js, Redux, Tailwind CSS, Three.js</p>
              </TextReveal>
              <TextReveal as="div" delay={0.4}>
                <span className="font-display text-xs font-medium tracking-[0.2em] uppercase text-accent/40">Backend</span>
                <p className="font-body text-sm text-white/30 mt-3 leading-relaxed">Node.js, Express, Spring Boot, GraphQL, REST APIs</p>
              </TextReveal>
              <TextReveal as="div" delay={0.45}>
                <span className="font-display text-xs font-medium tracking-[0.2em] uppercase text-accent/40">Infrastructure</span>
                <p className="font-body text-sm text-white/30 mt-3 leading-relaxed">AWS, GCP, Docker, Kubernetes, Terraform</p>
              </TextReveal>
              <TextReveal as="div" delay={0.5}>
                <span className="font-display text-xs font-medium tracking-[0.2em] uppercase text-accent/40">Data</span>
                <p className="font-body text-sm text-white/30 mt-3 leading-relaxed">PostgreSQL, MongoDB, Redis, DynamoDB</p>
              </TextReveal>
              <TextReveal as="div" delay={0.55}>
                <span className="font-display text-xs font-medium tracking-[0.2em] uppercase text-accent/40">DevOps</span>
                <p className="font-body text-sm text-white/30 mt-3 leading-relaxed">GitHub Actions, CI/CD, Prometheus, Git</p>
              </TextReveal>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-12 border-t border-white/[0.04]">
              {[
                { number: '4+', label: 'Years experience' },
                { number: '3.8', label: 'GPA at Purdue' },
                { number: '<100ms', label: 'API response' },
                { number: '40%', label: 'Cost reduced' },
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
