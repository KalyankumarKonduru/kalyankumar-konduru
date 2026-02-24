/**
 * TextProxies — Invisible Proxy Method for 3D/2D text interaction
 *
 * Creates invisible 3D box meshes whose positions perfectly track 2D DOM text
 * elements via getBoundingClientRect() → screenToWorld conversion.
 *
 * Each frame:
 *  1. Updates proxy positions to match scrolled DOM text
 *  2. AABB-checks the character's world position against each proxy
 *  3. Raycasts from the character in cardinal directions for early detection
 *  4. Emits 'textProxyCollision' events so other systems can react
 */
import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { characterWorldPos, characterScreen, emit } from '../../utils/animationState'

const COLLISION_PADDING = 0.3   // world-unit margin around proxy boxes
const RAY_DISTANCE = 2.5       // raycast reach for pre-detection
const PROXY_Z = 0.5            // Z plane for proxies (matches character Z)

// Reusable objects to avoid per-frame allocations
const _ndc = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _charPos = new THREE.Vector3()
const _rayDirs = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
]

function screenToWorld(sx, sy, camera, w, h, out) {
  _ndc.set((sx / w) * 2 - 1, -(sy / h) * 2 + 1, 0.5)
  _ndc.unproject(camera)
  _dir.copy(_ndc).sub(camera.position).normalize()
  const t = (PROXY_Z - camera.position.z) / _dir.z
  out.copy(camera.position).addScaledVector(_dir, t)
}

const _center = new THREE.Vector3()
const _tl = new THREE.Vector3()
const _br = new THREE.Vector3()

export default function TextProxies() {
  const { camera, gl } = useThree()
  const [domElements, setDomElements] = useState([])
  const meshRefs = useRef([])
  const collisionMap = useRef(new Map())
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  // Collect major text elements once DOM sections are mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      const selectors = [
        '#hero h1',
        '#about h2',
        '#about p',
        '#experience h2',
        '#projects h2',
        '#contact h1',
        '#contact h2',
      ]
      const els = []
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          els.push({ element: el, id: `${sel}-${els.length}` })
        })
      })
      setDomElements(els)
      meshRefs.current = els.map(() => null)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useFrame(() => {
    if (domElements.length === 0) return

    const w = gl.domElement.clientWidth
    const h = gl.domElement.clientHeight
    if (w === 0 || h === 0) return

    const charX = characterWorldPos.x
    const charY = characterWorldPos.y
    const charZ = characterWorldPos.z
    const isActive = characterScreen.moving && charX > -9000

    // --- Sync proxy positions to DOM & run AABB collision ---
    for (let i = 0; i < domElements.length; i++) {
      const mesh = meshRefs.current[i]
      const { element, id } = domElements[i]
      if (!mesh || !element) continue

      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue

      screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2, camera, w, h, _center)
      screenToWorld(rect.left, rect.top, camera, w, h, _tl)
      screenToWorld(rect.right, rect.bottom, camera, w, h, _br)

      const w3 = Math.abs(_br.x - _tl.x)
      const h3 = Math.abs(_tl.y - _br.y)

      mesh.position.copy(_center)
      mesh.scale.set(w3, h3, 0.3)

      if (!isActive) continue

      // AABB overlap
      const halfW = w3 / 2 + COLLISION_PADDING
      const halfH = h3 / 2 + COLLISION_PADDING
      const overlapping =
        charX > _center.x - halfW && charX < _center.x + halfW &&
        charY > _center.y - halfH && charY < _center.y + halfH &&
        Math.abs(charZ - PROXY_Z) < 1.0

      let st = collisionMap.current.get(id)
      if (!st) { st = { colliding: false }; collisionMap.current.set(id, st) }

      if (overlapping && !st.colliding) {
        st.colliding = true
        emit('textProxyCollision', { element, id, type: 'enter' })
      } else if (!overlapping && st.colliding) {
        st.colliding = false
        emit('textProxyCollision', { element, id, type: 'exit' })
      }
    }

    // --- Raycasting for early detection ---
    if (isActive) {
      _charPos.set(charX, charY, charZ)
      const activeMeshes = meshRefs.current.filter(Boolean)
      if (activeMeshes.length === 0) return

      for (const dir of _rayDirs) {
        raycaster.set(_charPos, dir)
        raycaster.far = RAY_DISTANCE
        const hits = raycaster.intersectObjects(activeMeshes, false)
        if (hits.length > 0) {
          const idx = meshRefs.current.indexOf(hits[0].object)
          if (idx >= 0 && domElements[idx]) {
            const proximity = 1 - hits[0].distance / RAY_DISTANCE
            emit('textProxyNear', {
              element: domElements[idx].element,
              id: domElements[idx].id,
              proximity,
            })
          }
        }
      }
    }
  })

  // Meshes are "visible" for the raycaster but render nothing (fully transparent)
  return (
    <>
      {domElements.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
