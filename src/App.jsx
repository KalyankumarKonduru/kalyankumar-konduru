import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import Lenis from 'lenis'

import Scene from './components/canvas/Scene'
import Navbar from './components/ui/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import Marquee from './components/ui/Marquee'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Experience from './components/sections/Experience'
import Contact from './components/sections/Contact'
import { emit, on } from './utils/animationState'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

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
  const textContainerRef = useRef(null)
  const scrambleRef = useRef(null)
  const cursorRef = useRef(null)
  const barTrackRef = useRef(null)
  const fillRef = useRef(null)

  useEffect(() => {
    let scrambleDone = false
    let sittingDone = false
    let scrambleTl = null
    let cursorTl = null
    let progressTween = null
    let phase3Started = false
    let jumpFallbackTimer = null
    const unsubs = []

    function checkPhase1Complete() {
      if (scrambleDone && sittingDone) startPhase2()
    }

    // Phase 1: ScrambleText resolving to "Loading..."
    function startPhase1() {
      cursorTl = gsap.timeline({ repeat: -1 })
      cursorTl
        .to(cursorRef.current, { opacity: 0, duration: 0.5, ease: 'none', delay: 0.2 })
        .to(cursorRef.current, { opacity: 1, duration: 0.5, ease: 'none', delay: 0.2 })

      scrambleTl = gsap.timeline()
      scrambleTl.to(scrambleRef.current, {
        scrambleText: {
          text: 'Loading...',
          chars: 'lowerCase',
          speed: 0.4,
        },
        duration: 2.5,
        ease: 'none',
        onComplete: () => {
          scrambleDone = true
          checkPhase1Complete()
        },
      })
    }

    // Phase 2: Fade text, show bar, character jumps to bar
    function startPhase2() {
      cursorTl?.kill()
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.3 })

      gsap.to(textContainerRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          if (textContainerRef.current) textContainerRef.current.style.display = 'none'
        },
      })

      gsap.to(barTrackRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.inOut',
        delay: 0.4,
      })

      emit('jumpToBar')

      const unsubJump = on('jumpDone', () => {
        unsubJump()
        clearTimeout(jumpFallbackTimer)
        startPhase3()
      })
      unsubs.push(unsubJump)

      jumpFallbackTimer = setTimeout(() => startPhase3(), 2000)
    }

    // Phase 3: Progress bar fills, character runs synced to it
    function startPhase3() {
      if (phase3Started) return
      phase3Started = true

      const counter = { value: 0 }
      let lastEmitted = -1

      progressTween = gsap.to(counter, {
        value: 100,
        duration: 2.5,
        ease: 'linear',
        onUpdate: () => {
          const raw = counter.value
          const rounded = Math.round(raw)
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${raw / 100})`
          if (rounded !== lastEmitted) {
            lastEmitted = rounded
            emit('loadProgress', rounded)
          }
        },
        onComplete: startPhase4,
      })
    }

    // Phase 4: Smooth fade-out
    function startPhase4() {
      gsap.to(loaderRef.current, {
        opacity: 0,
        yPercent: -5,
        duration: 0.9,
        ease: 'power4.inOut',
        delay: 0.3,
        onComplete,
      })
    }

    // Wait for character FBX parsing before starting Phase 1
    const fallback = setTimeout(startPhase1, 6000)
    const unsubReady = on('characterReady', () => {
      clearTimeout(fallback)
      startPhase1()
    })

    const unsubSitting = on('sittingDone', () => {
      sittingDone = true
      checkPhase1Complete()
    })

    return () => {
      clearTimeout(fallback)
      clearTimeout(jumpFallbackTimer)
      unsubReady()
      unsubSitting()
      unsubs.forEach((u) => u())
      scrambleTl?.kill()
      cursorTl?.kill()
      progressTween?.kill()
    }
  }, [onComplete])

  return (
    <div ref={loaderRef} className="loader">
      <div ref={textContainerRef} className="loader-scramble-container">
        <p className="loader-scramble-text">
          <span ref={scrambleRef}></span>
          <span ref={cursorRef} className="loader-scramble-cursor">|</span>
        </p>
      </div>
      <div ref={barTrackRef} className="loader-bar-track" style={{ opacity: 0 }}>
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
        <Experience />
        <Projects />
        <Contact />
      </main>
    </div>
  )
}
