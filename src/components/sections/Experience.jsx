import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '../ui/TextReveal'
import useTextDisplacement from '../../hooks/useTextDisplacement'

gsap.registerPlugin(ScrollTrigger)

const TIMELINE = [
  {
    year: '2021',
    title: 'Associate Software Engineer',
    type: 'Professional — Accenture',
    phase: 'The Foundation',
    narrative:
      'Took my first step into professional engineering and immediately started building — automating customer onboarding with Go and AWS Lambda, crafting React interfaces, and introducing Redis caching that cut API response times in half. This was where I discovered my obsession with making systems faster and smarter.',
  },
  {
    year: '2022',
    title: 'Software Engineer',
    type: 'Professional — Accenture',
    phase: 'The Ascent',
    narrative:
      'Grew from writing code to leading it — owning a 4-person team, architecting Node.js integration layers, and shipping Spring Boot microservices across high-traffic production systems. Learned that great engineering is as much about people and process as it is about the code itself.',
  },
  {
    year: '2023',
    title: 'Software Engineer',
    type: 'Professional — Accenture',
    phase: 'The Expansion',
    narrative:
      'Scaled distributed backends across AWS, MongoDB, and DynamoDB, engineering systems built to handle real production pressure without breaking. Deepened my ownership of architecture decisions and code review culture that shaped how entire product lines shipped.',
  },
  {
    year: '2024',
    title: 'Graduate Researcher & Builder',
    type: 'Academic — Purdue University',
    phase: 'The Reinvention',
    narrative:
      'Returned to the fundamentals with a Master\'s at Purdue — channeling theory into craft by building accessible component libraries, a Next.js storefront that scored 98.5 on Lighthouse, and a Go-powered GraphQL API with sub-100ms responses. This chapter was about unlearning habits and rebuilding stronger.',
  },
  {
    year: '2025',
    title: 'Software Engineer Intern',
    type: 'Professional — Medical Informatics Engineering',
    phase: 'The Convergence',
    narrative:
      'Everything I\'d learned converged into one defining stretch — writing a custom Kubernetes autoscaler in Go, designing a clinical AI chatbot for real-time patient data, and shipping full-stack applications with Redis-optimized performance. This is where craft met impact at scale.',
  },
]

/* ── single timeline node ── */
function TimelineNode({ year, title, type, phase, narrative, index, total }) {
  const nodeRef = useRef(null)
  const dotRef = useRef(null)
  const isLast = index === total - 1

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* card entrance */
      gsap.from(nodeRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: nodeRef.current,
          start: 'top 88%',
          once: true,
        },
      })

      /* dot pulse on enter */
      gsap.fromTo(
        dotRef.current,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.6,
          ease: 'back.out(2.5)',
          scrollTrigger: {
            trigger: nodeRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div ref={nodeRef} className="relative grid grid-cols-[1fr] md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-10">
      {/* ── left column (even = content, odd = empty on desktop) ── */}
      <div
        className={`${
          index % 2 === 0 ? 'md:text-right' : 'md:order-3 md:text-left'
        } pb-4 md:pb-0`}
      >
        {index % 2 === 0 ? (
          <NodeContent
            year={year}
            title={title}
            type={type}
            phase={phase}
            narrative={narrative}
            align="right"
          />
        ) : (
          <div className="hidden md:block" />
        )}
      </div>

      {/* ── centre spine ── */}
      <div className="hidden md:flex flex-col items-center">
        <div ref={dotRef} className="relative z-10">
          <div className="w-4 h-4 rounded-full border-2 border-accent/50 bg-[#060606] group-hover:border-accent transition-colors duration-500" />
          <div className="absolute inset-[-3px] rounded-full bg-accent/10 animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-accent/20 via-white/[0.04] to-transparent min-h-[120px]" />
        )}
      </div>

      {/* ── right column (odd = content, even = empty on desktop) ── */}
      <div
        className={`${
          index % 2 !== 0 ? '' : 'md:order-3 hidden md:block'
        }`}
      >
        {index % 2 !== 0 ? (
          <NodeContent
            year={year}
            title={title}
            type={type}
            phase={phase}
            narrative={narrative}
            align="left"
          />
        ) : (
          <div className="hidden md:block" />
        )}
      </div>

      {/* ── mobile: always show content (below spine) ── */}
      {index % 2 !== 0 && (
        <div className="md:hidden">
          {/* already rendered above for mobile via the grid */}
        </div>
      )}
    </div>
  )
}

function NodeContent({ year, title, type, phase, narrative, align }) {
  return (
    <div
      className={`group p-6 md:p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.025] hover:border-white/[0.08] transition-all duration-700 ${
        align === 'right' ? 'md:mr-2' : 'md:ml-2'
      }`}
      data-cursor-hover
    >
      {/* phase label */}
      <span className="inline-block font-display text-[10px] font-semibold tracking-[0.35em] uppercase text-accent/40 mb-4">
        {phase}
      </span>

      {/* year */}
      <div className="font-display text-5xl md:text-6xl font-bold text-white/[0.04] leading-none mb-3 select-none">
        {year}
      </div>

      {/* title */}
      <h3 className="font-display text-lg md:text-xl font-bold text-white/80 group-hover:text-white transition-colors duration-500 tracking-[-0.01em]">
        {title}
      </h3>

      {/* type */}
      <span className="font-body text-xs text-accent/50 tracking-wide mt-1 block">
        {type}
      </span>

      {/* narrative */}
      <p className="font-body text-sm md:text-[15px] text-white/25 leading-[1.85] mt-5 group-hover:text-white/35 transition-colors duration-500">
        {narrative}
      </p>
    </div>
  )
}

/* ── main section ── */
export default function Experience() {
  const sectionRef = useRef(null)
  const spineRef = useRef(null)

  useTextDisplacement('experience', sectionRef)

  /* animate the spine line growing downward */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (spineRef.current) {
        gsap.from(spineRef.current, {
          scaleY: 0,
          transformOrigin: 'top center',
          duration: 1.8,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            once: true,
          },
        })
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* ── header ── */}
        <div className="text-center mb-20 md:mb-32">
          <TextReveal
            as="span"
            className="font-display text-[10px] font-semibold tracking-[0.4em] uppercase text-accent/40"
          >
            The Evolution
          </TextReveal>

          <TextReveal
            as="h2"
            className="font-display text-4xl md:text-6xl font-bold leading-[1.05] text-white/90 tracking-[-0.03em] mt-6"
            delay={0.1}
          >
            My Career &amp; Experience
          </TextReveal>

          <TextReveal
            as="p"
            className="font-body text-white/20 text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed"
            delay={0.2}
          >
            Five years distilled into defining moments — each chapter a leap in scale, ownership, and technical ambition.
          </TextReveal>
        </div>

        {/* ── timeline ── */}
        <div className="relative">
          {/* background spine (mobile) */}
          <div
            ref={spineRef}
            className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/15 via-white/[0.04] to-transparent pointer-events-none"
          />

          <div className="space-y-6 md:space-y-0">
            {TIMELINE.map((entry, i) => (
              <TimelineNode
                key={entry.year}
                {...entry}
                index={i}
                total={TIMELINE.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

