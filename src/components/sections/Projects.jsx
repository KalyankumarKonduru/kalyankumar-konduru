import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '../ui/TextReveal'
import useTextDisplacement from '../../hooks/useTextDisplacement'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    title: 'Neural Canvas',
    category: 'AI / Creative Tool',
    description: 'Real-time AI art generation platform with WebGL visualization pipeline. Sub-100ms inference.',
    tags: ['React', 'Three.js', 'Python', 'WebGL'],
    year: '2025',
  },
  {
    title: 'Pulse Analytics',
    category: 'Data / Dashboard',
    description: 'High-performance dashboard processing 10M+ events/day with streaming architecture.',
    tags: ['TypeScript', 'D3.js', 'Go', 'PostgreSQL'],
    year: '2024',
  },
  {
    title: 'Mesh Protocol',
    category: 'Infrastructure',
    description: 'Decentralized communication layer with E2E encryption. 50k concurrent connections.',
    tags: ['Rust', 'WebRTC', 'React', 'Node.js'],
    year: '2024',
  },
  {
    title: 'Spatial Editor',
    category: 'Creative Tool / 3D',
    description: 'Browser-based 3D modeling tool with collaborative editing and procedural generation.',
    tags: ['Three.js', 'WASM', 'React', 'WebWorkers'],
    year: '2023',
  },
]

function ProjectRow({ title, category, description, tags, year, index }) {
  const rowRef = useRef(null)
  const titleRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(rowRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: index * 0.1,
        scrollTrigger: {
          trigger: rowRef.current,
          start: 'top 88%',
          once: true,
        },
      })
    })
    return () => ctx.revert()
  }, [index])

  const handleMouseEnter = () => {
    gsap.to(titleRef.current, {
      x: 16,
      duration: 0.5,
      ease: 'power3.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(titleRef.current, {
      x: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
  }

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group border-b border-white/[0.04] py-8 md:py-12 transition-colors duration-500 hover:bg-white/[0.01]"
      data-cursor-hover
    >
      <div className="grid grid-cols-12 gap-4 items-baseline px-6 md:px-12">
        <div className="col-span-1 hidden md:block">
          <span className="font-display text-xs text-white/15 tracking-wider">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="col-span-12 md:col-span-5">
          <h3
            ref={titleRef}
            className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white/70 group-hover:text-white transition-colors duration-500 tracking-[-0.02em]"
          >
            {title}
          </h3>
        </div>

        <div className="col-span-6 md:col-span-3 hidden md:block">
          <p className="font-body text-sm text-white/20 leading-relaxed group-hover:text-white/35 transition-colors duration-500">
            {description}
          </p>
        </div>

        <div className="col-span-6 md:col-span-2 hidden md:flex flex-col items-end gap-1">
          <span className="font-body text-xs text-accent/40 group-hover:text-accent/70 transition-colors duration-500 tracking-wider uppercase">
            {category}
          </span>
          <span className="font-body text-xs text-white/10">{year}</span>
        </div>

        <div className="col-span-1 hidden md:flex justify-end items-center">
          <svg
            className="w-4 h-4 text-white/0 group-hover:text-white/30 transition-all duration-500 translate-x-0 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </div>
      </div>

      <div className="md:hidden px-6 mt-3 flex items-center gap-3">
        <span className="font-body text-xs text-accent/40 tracking-wider uppercase">
          {category}
        </span>
        <span className="text-white/10">·</span>
        <span className="font-body text-xs text-white/15">{year}</span>
      </div>
    </div>
  )
}

export default function Projects() {
  const sectionRef = useRef(null)
  useTextDisplacement('projects', sectionRef)

  return (
    <section id="projects" ref={sectionRef} className="relative py-32 md:py-48">
      <div className="px-6 md:px-12 mb-16 md:mb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 md:gap-20">
          <div className="md:col-span-4">
            <TextReveal
              as="span"
              className="font-display text-xs font-medium tracking-[0.3em] uppercase text-accent/50"
            >
              Selected Work
            </TextReveal>
          </div>
          <div className="md:col-span-8">
            <TextReveal
              as="h2"
              className="font-display text-3xl md:text-5xl font-bold leading-tight text-white/90 tracking-[-0.02em]"
            >
              Projects built with obsessive attention to craft.
            </TextReveal>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.04]">
        {PROJECTS.map((project, i) => (
          <ProjectRow key={project.title} {...project} index={i} />
        ))}
      </div>
    </section>
  )
}
