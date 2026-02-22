export const scroll = {
  progress: 0,
  velocity: 0,
  section: 'hero',
  sectionProgress: 0,
}

const SECTIONS = ['hero', 'about', 'experience', 'projects', 'contact']

// Cache element references — queried once on first scroll, not on every tick
let cachedEls = null
function getEls() {
  if (!cachedEls) {
    cachedEls = SECTIONS.map(id => document.getElementById(id))
  }
  return cachedEls
}

function updateSection() {
  const els = getEls()
  const viewportMid = window.scrollY + window.innerHeight * 0.5
  let currentSection = 'hero'
  let currentEl = null
  let nextEl = null

  for (let i = SECTIONS.length - 1; i >= 0; i--) {
    const el = els[i]
    if (!el) continue
    if (el.offsetTop <= viewportMid) {
      currentSection = SECTIONS[i]
      currentEl = el
      nextEl = els[i + 1] ?? null
      break
    }
  }

  if (window.scrollY < window.innerHeight * 0.5 && !currentEl) {
    currentSection = 'hero'
    currentEl = els[0]
    nextEl = els[1]
  }

  scroll.section = currentSection

  if (currentEl) {
    const sectionTop = currentEl.offsetTop
    const sectionHeight = nextEl
      ? nextEl.offsetTop - sectionTop
      : currentEl.offsetHeight
    const offset = viewportMid - sectionTop
    scroll.sectionProgress = Math.max(0, Math.min(1, offset / sectionHeight))
  } else {
    scroll.sectionProgress = 0
  }
}

if (typeof window !== 'undefined') {
  let lastScroll = 0

  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    scroll.progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
    scroll.velocity = window.scrollY - lastScroll
    lastScroll = window.scrollY
    updateSection()
  }, { passive: true })
}
