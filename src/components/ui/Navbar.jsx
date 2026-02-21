import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let lastScroll = 0
    let isHidden = false
    const nav = navRef.current

    const handleScroll = () => {
      const currentScroll = window.scrollY
      setScrolled(currentScroll > 80)

      // Only create a tween when direction actually changes — not on every scroll tick
      if (currentScroll > lastScroll && currentScroll > 300) {
        if (!isHidden) {
          isHidden = true
          gsap.to(nav, { y: -100, duration: 0.5, ease: 'power3.inOut' })
        }
      } else {
        if (isHidden) {
          isHidden = false
          gsap.to(nav, { y: 0, duration: 0.5, ease: 'power3.inOut' })
        }
      }
      lastScroll = currentScroll
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex items-center justify-between transition-all duration-500 ${
        scrolled ? 'glass' : ''
      }`}
    >
      <a
        href="#"
        className="nav-item font-display font-bold text-sm tracking-tight text-white/80 hover:text-white transition-colors duration-300"
        data-cursor-hover
      >
        Portfolio<span className="text-accent">.</span>
      </a>

      <div className="hidden md:flex items-center gap-10">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => scrollTo(e, link.href)}
            className="nav-item font-body text-[11px] text-white/30 hover:text-white/70 transition-colors duration-300 tracking-[0.15em] uppercase"
            data-cursor-hover
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
