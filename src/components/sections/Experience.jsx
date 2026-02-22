import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '../ui/TextReveal'
import useTextDisplacement from '../../hooks/useTextDisplacement'

gsap.registerPlugin(ScrollTrigger)

const TIMELINE = [
  {
    year: 'NOW',
    title: 'Learning Something New',
    type: 'Self Development',
    phase: 'The Perpetual',
    narrative:
      'Continuously expanding my craft — exploring new paradigms in distributed systems, AI-assisted development, and creative coding. The journey never stops; every day is a new foundation for what comes next.',
  },
  {
    year: '2025',
    title: 'Software Engineer Intern',
    type: 'Medical Informatics Engineering',
    phase: 'The Convergence',
    narrative:
      "Everything I'd learned converged into one defining stretch — writing a custom Kubernetes autoscaler in Go, designing a clinical AI chatbot for real-time patient data, and shipping full-stack applications with Redis-optimized performance. This is where craft met impact at scale.",
  },
  {
    year: '2024',
    title: 'Graduate Researcher & Builder',
    type: 'Purdue University',
    phase: 'The Reinvention',
    narrative:
      "Returned to the fundamentals with a Master's at Purdue — channeling theory into craft by building accessible component libraries, a Next.js storefront that scored 98.5 on Lighthouse, and a Go-powered GraphQL API with sub-100ms responses. This chapter was about unlearning habits and rebuilding stronger.",
  },
  {
    year: '2023',
    title: 'Software Engineer',
    type: 'Accenture',
    phase: 'The Expansion',
    narrative:
      'Scaled distributed backends across AWS, MongoDB, and DynamoDB, engineering systems built to handle real production pressure without breaking. Deepened my ownership of architecture decisions and code review culture that shaped how entire product lines shipped.',
  },
  {
    year: '2022',
    title: 'Software Engineer',
    type: 'Accenture',
    phase: 'The Ascent',
    narrative:
      'Grew from writing code to leading it — owning a 4-person team, architecting Node.js integration layers, and shipping Spring Boot microservices across high-traffic production systems. Learned that great engineering is as much about people and process as it is about the code itself.',
  },
  {
    year: '2021',
    title: 'Associate Software Engineer',
    type: 'Accenture',
    phase: 'The Foundation',
    narrative:
      'Took my first step into professional engineering and immediately started building — automating customer onboarding with Go and AWS Lambda, crafting React interfaces, and introducing Redis caching that cut API response times in half. This was where I discovered my obsession with making systems faster and smarter.',
  },
  {
    year: '2019',
    title: "Bachelor's Degree",
    type: 'Panimalar Institute of Technology',
    phase: 'The Origin',
    narrative:
      'Four years of computer science fundamentals — data structures, algorithms, operating systems, and the spark of building something from nothing. This is where curiosity became craft, and a developer was born.',
  },
]

/* ── row activation helpers (direct DOM, no React re-renders) ── */
function activateRow(row) {
  if (!row) return
  const phase = row.querySelector('.tl-phase')
  const title = row.querySelector('.tl-title')
  const org = row.querySelector('.tl-org')
  const year = row.querySelector('.tl-year')
  const desc = row.querySelector('.tl-desc')
  const card = row.querySelector('.tl-card')

  if (phase) gsap.to(phase, { color: '#c8a87c', textShadow: '0 0 16px rgba(200,168,124,0.5)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (title) gsap.to(title, { color: 'rgba(255,255,255,0.9)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (org) gsap.to(org, { color: 'rgba(200,168,124,0.7)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (year) gsap.to(year, { color: 'rgba(255,255,255,0.12)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (desc) gsap.to(desc, { color: 'rgba(255,255,255,0.55)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (card) gsap.to(card, { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', duration: 0.6, ease: 'power2.out', overwrite: true })
}

function deactivateRow(row) {
  if (!row) return
  const phase = row.querySelector('.tl-phase')
  const title = row.querySelector('.tl-title')
  const org = row.querySelector('.tl-org')
  const year = row.querySelector('.tl-year')
  const desc = row.querySelector('.tl-desc')
  const card = row.querySelector('.tl-card')

  if (phase) gsap.to(phase, { color: 'rgba(255,255,255,0.2)', textShadow: 'none', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (title) gsap.to(title, { color: 'rgba(255,255,255,0.45)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (org) gsap.to(org, { color: 'rgba(200,168,124,0.25)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (year) gsap.to(year, { color: 'rgba(255,255,255,0.04)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (desc) gsap.to(desc, { color: 'rgba(255,255,255,0.2)', duration: 0.6, ease: 'power2.out', overwrite: true })
  if (card) gsap.to(card, { borderColor: 'rgba(255,255,255,0.03)', backgroundColor: 'rgba(255,255,255,0)', duration: 0.6, ease: 'power2.out', overwrite: true })
}

/* ── main section ── */
export default function Experience() {
  const sectionRef = useRef(null)
  const timelineRef = useRef(null)
  const sphereRef = useRef(null)
  const progressLineRef = useRef(null)
  const rowRefs = useRef([])

  /* mobile refs */
  const mobileContainerRef = useRef(null)
  const mobileSphereRef = useRef(null)
  const mobileProgressLineRef = useRef(null)
  const mobileRowRefs = useRef([])

  const activeIndexRef = useRef(-1)

  useTextDisplacement('experience', sectionRef)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        /* ── desktop ── */
        '(min-width: 768px)': function () {
          const timeline = timelineRef.current
          const sphere = sphereRef.current
          const progressLine = progressLineRef.current
          if (!timeline || !sphere || !progressLine) return

          /* sphere traversal — scrub-driven */
          gsap.fromTo(
            sphere,
            { top: '0%' },
            {
              top: '100%',
              ease: 'none',
              scrollTrigger: {
                trigger: timeline,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.3,
              },
            },
          )

          /* progress line fill */
          gsap.fromTo(
            progressLine,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: timeline,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.3,
              },
            },
          )

          /* per-row activation + entrance */
          rowRefs.current.forEach((row, i) => {
            if (!row) return

            ScrollTrigger.create({
              trigger: row,
              start: 'top center',
              end: 'bottom center',
              onToggle: ({ isActive }) => {
                if (isActive) {
                  if (activeIndexRef.current >= 0 && activeIndexRef.current !== i) {
                    deactivateRow(rowRefs.current[activeIndexRef.current])
                  }
                  activateRow(row)
                  activeIndexRef.current = i
                } else if (activeIndexRef.current === i) {
                  deactivateRow(row)
                  activeIndexRef.current = -1
                }
              },
            })

            gsap.from(row, {
              y: 40,
              opacity: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 88%',
                once: true,
              },
            })
          })
        },

        /* ── mobile ── */
        '(max-width: 767px)': function () {
          const container = mobileContainerRef.current
          const sphere = mobileSphereRef.current
          const progressLine = mobileProgressLineRef.current
          if (!container || !sphere || !progressLine) return

          gsap.fromTo(
            sphere,
            { top: '0%' },
            {
              top: '100%',
              ease: 'none',
              scrollTrigger: {
                trigger: container,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.3,
              },
            },
          )

          gsap.fromTo(
            progressLine,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: container,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.3,
              },
            },
          )

          mobileRowRefs.current.forEach((row, i) => {
            if (!row) return

            ScrollTrigger.create({
              trigger: row,
              start: 'top center',
              end: 'bottom center',
              onToggle: ({ isActive }) => {
                if (isActive) {
                  if (activeIndexRef.current >= 0 && activeIndexRef.current !== i) {
                    deactivateRow(mobileRowRefs.current[activeIndexRef.current])
                  }
                  activateRow(row)
                  activeIndexRef.current = i
                } else if (activeIndexRef.current === i) {
                  deactivateRow(row)
                  activeIndexRef.current = -1
                }
              },
            })

            gsap.from(row, {
              y: 30,
              opacity: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 90%',
                once: true,
              },
            })
          })
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-40 md:py-56 px-6 md:px-12 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
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
            Seven years distilled into defining moments — each chapter a leap in
            scale, ownership, and technical ambition.
          </TextReveal>
        </div>

        {/* ══════════════════ DESKTOP: center-line timeline ══════════════════ */}
        <div ref={timelineRef} className="hidden md:block relative">
          {/* ── vertical scroll line (absolute, centered) ── */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px pointer-events-none">
            {/* static background line */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-white/[0.06] to-transparent" />

            {/* dynamic progress line */}
            <div
              ref={progressLineRef}
              className="absolute inset-x-0 top-0 h-full origin-top"
              style={{
                transform: 'scaleY(0)',
                background:
                  'linear-gradient(to bottom, rgba(200,168,124,0.6), rgba(200,168,124,0.2))',
              }}
            />

            {/* glowing sphere */}
            <div
              ref={sphereRef}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ top: '0%' }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, #e8d5b5 0%, #c8a87c 50%, rgba(200,168,124,0.2) 80%, transparent 100%)',
                  boxShadow:
                    '0 0 10px rgba(200,168,124,0.7), 0 0 25px rgba(200,168,124,0.4), 0 0 50px rgba(200,168,124,0.15)',
                }}
              />
              <div
                className="absolute inset-[-10px] rounded-full animate-sphere-pulse"
                style={{
                  background:
                    'radial-gradient(circle, rgba(200,168,124,0.25) 0%, transparent 70%)',
                }}
              />
            </div>
          </div>

          {/* ── timeline rows ── */}
          <div className="space-y-8">
            {TIMELINE.map((entry, i) => (
              <div
                key={entry.year}
                ref={(el) => (rowRefs.current[i] = el)}
                className="grid grid-cols-[1fr_80px_1fr] items-start"
                data-cursor-hover
              >
                {/* ── left side: phase + role ── */}
                <div className="text-right pr-6 lg:pr-10 py-8 lg:py-10">
                  <span className="tl-phase font-display text-[10px] font-semibold tracking-[0.3em] uppercase text-white/20 block mb-4">
                    {entry.phase}
                  </span>
                  <h3 className="tl-title font-display text-lg lg:text-xl font-bold tracking-[-0.01em] text-white/45 leading-tight">
                    {entry.title}
                  </h3>
                  <span className="tl-org font-body text-xs tracking-wide mt-2 block text-accent/25">
                    {entry.type}
                  </span>
                </div>

                {/* ── center spacer (line passes through here) ── */}
                <div className="flex justify-center py-8 lg:py-10">
                  <div className="w-2 h-2 rounded-full border border-accent/20 bg-surface mt-1" />
                </div>

                {/* ── right side: year + story ── */}
                <div className="tl-card pl-6 lg:pl-10 py-8 lg:py-10 border border-transparent rounded-xl transition-colors duration-700">
                  <div className="tl-year font-display text-5xl lg:text-6xl font-bold text-white/[0.04] leading-none mb-3 select-none">
                    {entry.year}
                  </div>
                  <p className="tl-desc font-body text-sm lg:text-[15px] leading-[1.85] text-white/20">
                    {entry.narrative}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════ MOBILE: left-rail + stacked cards ══════════════════ */}
        <div ref={mobileContainerRef} className="md:hidden relative pl-10">
          {/* left rail line */}
          <div className="absolute left-3 top-0 bottom-0 w-px pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-white/[0.06] to-transparent" />
            <div
              ref={mobileProgressLineRef}
              className="absolute inset-x-0 top-0 h-full origin-top"
              style={{
                transform: 'scaleY(0)',
                background:
                  'linear-gradient(to bottom, rgba(200,168,124,0.6), rgba(200,168,124,0.2))',
              }}
            />
            <div
              ref={mobileSphereRef}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ top: '0%' }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, #e8d5b5 0%, #c8a87c 50%, transparent 100%)',
                  boxShadow:
                    '0 0 8px rgba(200,168,124,0.6), 0 0 16px rgba(200,168,124,0.3)',
                }}
              />
              <div
                className="absolute inset-[-6px] rounded-full animate-sphere-pulse"
                style={{
                  background:
                    'radial-gradient(circle, rgba(200,168,124,0.2) 0%, transparent 70%)',
                }}
              />
            </div>
          </div>

          {/* stacked cards */}
          {TIMELINE.map((entry, i) => (
            <div
              key={entry.year}
              ref={(el) => (mobileRowRefs.current[i] = el)}
              className="relative py-6 border-t border-white/[0.03]"
              data-cursor-hover
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="tl-phase font-display text-[10px] font-semibold tracking-[0.25em] uppercase text-white/20">
                  {entry.phase}
                </span>
                <span className="text-white/10">—</span>
                <span className="tl-year font-display text-xs font-bold text-white/25">
                  {entry.year}
                </span>
              </div>
              <h3 className="tl-title font-display text-base font-bold text-white/45 tracking-[-0.01em]">
                {entry.title}
              </h3>
              <span className="tl-org font-body text-[11px] text-accent/25 tracking-wide mt-1 block">
                {entry.type}
              </span>
              <p className="tl-desc font-body text-sm text-white/20 leading-[1.85] mt-3">
                {entry.narrative}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
