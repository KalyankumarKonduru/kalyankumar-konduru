import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '../ui/TextReveal'
import useTextDisplacement from '../../hooks/useTextDisplacement'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    title: 'Polaris',
    category: 'Infrastructure / DevOps',
    description: 'A custom Kubernetes autoscaler written in Go that consumes live Prometheus metrics to drive real-time pod scaling across production GCP clusters — cutting infrastructure costs by 40% through automated resource right-sizing.',
    tags: ['Go', 'Kubernetes', 'Terraform', 'Prometheus', 'GCP'],
    year: '2025',
  },
  {
    title: 'GraphQL Product Search',
    category: 'Full-Stack / API',
    description: 'Production-grade search platform with a Go backend (gqlgen) and React/TypeScript frontend — featuring cursor-based pagination, real-time filtering, autocomplete, and Redis caching that reduced DB roundtrips by 60%.',
    tags: ['Go', 'GraphQL', 'React', 'TypeScript', 'Redis'],
    year: '2025',
  },
  {
    title: 'NextJS Storefront',
    category: 'E-Commerce / Frontend',
    description: 'A blazing-fast e-commerce storefront built on Next.js 14 with SSR/ISR, Redux Toolkit, and comprehensive Jest testing — deployed on Vercel with a 98.5 Lighthouse score across all audits.',
    tags: ['Next.js', 'TypeScript', 'Redux', 'Jest', 'Vercel'],
    year: '2024',
  },
  {
    title: 'Accessible UI Library',
    category: 'Design System / OSS',
    description: 'A reusable React component library engineered for WCAG 2.1 AA compliance — with focus trapping, keyboard navigation, ARIA support, and type-safe variant APIs documented in Storybook 7.',
    tags: ['React', 'TypeScript', 'Tailwind', 'Storybook', 'a11y'],
    year: '2024',
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
