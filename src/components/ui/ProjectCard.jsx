import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectCard({ title, description, tags, index }) {
  const cardRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: index * 0.15,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          once: true,
        },
      })
    })

    return () => ctx.revert()
  }, [index])

  const handleMouseMove = (e) => {
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    gsap.to(card, {
      rotateY: x * 8,
      rotateX: -y * 8,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 800,
    })

    card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
    card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`)
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl p-8 glass glass-hover transition-all duration-300 overflow-hidden"
      data-cursor-hover
      style={{
        transformStyle: 'preserve-3d',
        background: `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(99,102,241,0.08) 0%, transparent 60%)`,
      }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <span className="text-accent/50 font-display text-sm font-medium tracking-widest">
          {String(index + 1).padStart(2, '0')}
        </span>

        <h3 className="font-display text-2xl font-bold text-white mt-3 mb-3 group-hover:text-gradient transition-all duration-300">
          {title}
        </h3>

        <p className="font-body text-white/50 text-sm leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium text-white/40 bg-white/5 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
