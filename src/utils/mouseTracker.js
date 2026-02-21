export const mouse = { x: 0, y: 0, clientX: 0, clientY: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    mouse.clientX = e.clientX
    mouse.clientY = e.clientY
  })
}
