const listeners = new Map()

export const animState = {
  phase: 'loading',
  clip: 'lookOverShoulder',
  loadProgress: 0,
  siteReady: false,
  targetSection: 'hero',
  isSwinging: false,
  landingSection: null,
}

export function emit(event, data) {
  const cbs = listeners.get(event)
  if (cbs) cbs.forEach((cb) => cb(data))
}

export function on(event, cb) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event).add(cb)
  return () => listeners.get(event).delete(cb)
}
