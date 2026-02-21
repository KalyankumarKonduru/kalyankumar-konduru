import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import Scene from './components/canvas/Scene'
import Navbar from './components/ui/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import Marquee from './components/ui/Marquee'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import { emit, on } from './utils/animationState'

gsap.registerPlugin(ScrollTrigger)

function ScrollProgress() {
  const barRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={barRef}
      className="scroll-progress fixed top-0 left-0 right-0 h-px z-[100]"
      style={{
        transform: 'scaleX(0)',
        background: 'linear-gradient(90deg, #c8a87c, #e8d5b5)',
      }}
    />
  )
}

function Loader({ onComplete }) {
  const loaderRef = useRef(null)
  const fillRef = useRef(null)

  useEffect(() => {
    const counter = { value: 0 }
    let lastEmitted = -1
    let tween = null

    function startTween() {
      tween = gsap.to(counter, {
        value: 100,
        duration: 2.5,
        ease: 'linear',
        onUpdate: () => {
          const raw = counter.value
          const rounded = Math.round(raw)

          // Direct DOM write — zero React re-renders, GPU composited
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${raw / 100})`

          // Only emit on integer change — no event bus hammering
          if (rounded !== lastEmitted) {
            lastEmitted = rounded
            emit('loadProgress', rounded)
          }
        },
        onComplete: () => {
          gsap.to(loaderRef.current, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
            delay: 0.2,
            onComplete,
          })
        },
      })
    }

    // Wait for Character FBX parsing to finish before animating,
    // so the stutter from model parsing doesn't hit mid-tween.
    // Fall back to immediate start after 6 s in case the event never fires.
    const fallback = setTimeout(startTween, 6000)
    const unsub = on('characterReady', () => {
      clearTimeout(fallback)
      startTween()
    })

    return () => {
      clearTimeout(fallback)
      unsub()
      tween?.kill()
    }
  }, [onComplete])

  return (
    <div ref={loaderRef} className="loader">
      <div className="loader-bar-track">
        <div ref={fillRef} className="loader-bar-fill" />
      </div>
    </div>
  )
}

export default function App() {
  const [siteReady, setSiteReady] = useState(false)

  useEffect(() => {
    if (!siteReady) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [siteReady])

  const handleLoadComplete = useCallback(() => {
    setSiteReady(true)
    emit('siteReady')

    const tl = gsap.timeline({ delay: 0.1 })

    tl.from('.nav-item', {
      y: -20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: 'power3.out',
    })
  }, [])

  return (
    <div className="noise">
      <Loader onComplete={handleLoadComplete} />

      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <Scene siteReady={siteReady} />

      <main className="relative z-10">
        <Hero ready={siteReady} />
        <Marquee />
        <About />
        <Projects />
        <Contact />
      </main>
    </div>
  )
}
