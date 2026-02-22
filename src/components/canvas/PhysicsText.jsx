import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import { RigidBody, CuboidCollider, interactionGroups } from '@react-three/rapier'
import { on } from '../../utils/animationState'

const FONT_URL = '/fonts/helvetiker_bold.json'

const TRANSITION_TEXT = {
  about: 'ABOUT',
  projects: 'PROJECTS',
  contact: 'CONTACT',
  hero: 'HOME',
}

const LETTER_SIZE = 0.35
const LETTER_HEIGHT = 0.08
const LETTER_SPACING = 0.28
const FADE_SPEED = 0.5
const AUTO_FADE_DELAY = 3 // seconds before auto-fade if no collision

function PhysicsLetter({ char, position, onFaded }) {
  const rigidRef = useRef()
  const matRef = useRef()
  const hitRef = useRef(false)
  const fadeRef = useRef(1)
  const ageRef = useRef(0)

  const handleCollision = useCallback(() => {
    if (hitRef.current) return
    hitRef.current = true

    const body = rigidRef.current
    if (!body) return

    // Enable gravity + reduce damping so physics takes over
    body.setGravityScale(1, true)
    body.setLinearDamping(0.5)
    body.setAngularDamping(0.5)

    // Apply impulse + torque for dramatic scatter
    body.applyImpulse(
      { x: (Math.random() - 0.5) * 4, y: 2 + Math.random() * 3, z: (Math.random() - 0.5) * 3 },
      true,
    )
    body.applyTorqueImpulse(
      { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5, z: (Math.random() - 0.5) * 5 },
      true,
    )
  }, [])

  useFrame((_, delta) => {
    ageRef.current += delta

    // Auto-fade fallback: if never hit after AUTO_FADE_DELAY, start fading
    if (!hitRef.current && ageRef.current > AUTO_FADE_DELAY) {
      hitRef.current = true
    }

    if (!hitRef.current) return

    fadeRef.current -= delta * FADE_SPEED
    if (matRef.current) {
      matRef.current.opacity = Math.max(0, fadeRef.current)
    }
    if (fadeRef.current <= 0) {
      onFaded()
    }
  })

  return (
    <RigidBody
      ref={rigidRef}
      type="dynamic"
      gravityScale={0}
      linearDamping={10}
      angularDamping={10}
      colliders={false}
      position={position}
      collisionGroups={interactionGroups(1, [0])}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[LETTER_SIZE / 2, LETTER_SIZE / 2, LETTER_HEIGHT / 2]} />
      <Text3D
        font={FONT_URL}
        size={LETTER_SIZE}
        height={LETTER_HEIGHT}
        bevelEnabled={false}
      >
        {char}
        <meshStandardMaterial
          ref={matRef}
          color="#c8a87c"
          emissive="#c8a87c"
          emissiveIntensity={0.3}
          transparent
          opacity={1}
        />
      </Text3D>
    </RigidBody>
  )
}

export default function PhysicsText() {
  const [letters, setLetters] = useState([])

  useEffect(() => {
    const unsub = on('swingTransition', ({ to, start, end }) => {
      const text = TRANSITION_TEXT[to]
      if (!text) return

      // Position letters at the midpoint of the swing arc
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2 + 1.5 // arc peak
      const midZ = (start.z + end.z) / 2

      const totalWidth = text.length * LETTER_SPACING
      const offsetX = midX - totalWidth / 2

      const batch = text.split('').map((char, i) => ({
        id: `${to}-${Date.now()}-${i}`,
        char,
        position: [offsetX + i * LETTER_SPACING, midY, midZ],
      }))

      setLetters((prev) => [...prev, ...batch])
    })

    return unsub
  }, [])

  const removeLetter = useCallback((id) => {
    setLetters((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return (
    <>
      {letters.map((l) => (
        <PhysicsLetter
          key={l.id}
          char={l.char}
          position={l.position}
          onFaded={() => removeLetter(l.id)}
        />
      ))}
    </>
  )
}
