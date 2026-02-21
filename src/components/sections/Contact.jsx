import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
import useTextDisplacement from '../../hooks/useTextDisplacement'

gsap.registerPlugin(ScrollTrigger)

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Dribbble', href: 'https://dribbble.com' },
]

export default function Contact() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const contentRef = useRef(null)

  useTextDisplacement('contact', sectionRef)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const chars = headingRef.current.querySelectorAll('.char')
      const contentItems = contentRef.current.children

      gsap.from(chars, {
        yPercent: 100,
        opacity: 0,
        stagger: 0.02,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          once: true,
        },
      })

      gsap.from(contentItems, {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 50%',
          once: true,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  const renderChars = (text) =>
    text.split('').map((char, i) => (
      <span key={i} className="char inline-block overflow-hidden">
        <span className="inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      </span>
    ))

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-between px-6 md:px-12 py-16 md:py-24"
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <span className="font-display text-xs font-medium tracking-[0.3em] uppercase text-accent/50">
            Get in touch
          </span>
        </div>

        <div ref={headingRef} className="mb-12 md:mb-16">
          <h2
            className="font-display font-bold leading-[0.9] tracking-[-0.04em] text-white"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)' }}
          >
            {renderChars("Let's work")}
          </h2>
          <h2
            className="font-display font-bold leading-[0.9] tracking-[-0.04em] text-white/20"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)' }}
          >
            {renderChars('together.')}
          </h2>
        </div>

        <div ref={contentRef} className="max-w-md space-y-8">
          <p className="font-body text-white/30 text-base leading-relaxed">
            Have a project in mind, a role to discuss, or just want to connect
            about ambitious ideas? I&apos;m always open.
          </p>

          <MagneticButton
            className="group inline-flex items-center gap-4 px-8 py-4 rounded-full border border-accent/30 hover:border-accent/60 hover:bg-accent/5 text-accent font-display font-medium text-sm tracking-wide transition-all duration-500"
            onClick={() => { window.location.href = 'mailto:hello@yourname.com' }}
          >
            hello@yourname.com
            <svg
              className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </MagneticButton>
        </div>
      </div>

      <footer className="pt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-t border-white/[0.04]">
        <div className="flex flex-col gap-2">
          <span className="font-body text-[10px] text-white/15 tracking-[0.2em] uppercase">
            &copy; {new Date().getFullYear()}
          </span>
          <span className="font-body text-xs text-white/25">
            Designed &amp; built with intention
          </span>
        </div>

        <div className="flex items-center gap-8">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-white/20 hover:text-accent transition-colors duration-400 tracking-wide"
              data-cursor-hover
            >
              {social.label}
            </a>
          ))}
        </div>
      </footer>
    </section>
  )
}
