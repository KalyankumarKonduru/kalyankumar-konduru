import * as THREE from 'three'
import { animState, emit } from '../../../../utils/animationState'
import { SECTION_POS, SECTION_ROT_Y, CHARACTER_SCALE } from '../constants'

export function trigger(ctx, toSection, type = 'forward') {
  const { swingActive, swingProgress, swingType, swingStart, swingEnd,
    groupRef, crossFadeTo, actionsRef } = ctx
  if (swingActive.current) return

  swingActive.current = true
  swingProgress.current = 0
  swingType.current = type
  swingStart.current.copy(groupRef.current.position)
  swingEnd.current.copy(SECTION_POS[toSection] || SECTION_POS.hero)
  animState.isSwinging = true
  animState.landingSection = toSection
  animState.targetSection = toSection

  if (type === 'forward') {
    crossFadeTo('swinging')
    actionsRef.current.swinging?.setLoop(THREE.LoopOnce, 1)
    animState.clip = 'swinging'
  } else {
    crossFadeTo('changeDirection')
    actionsRef.current.changeDirection?.setLoop(THREE.LoopOnce, 1)
    animState.clip = 'changeDirection'
  }
  animState.phase = 'swinging'
}

// Track whether swingTransition was already emitted this swing
let midpointEmitted = false

export function update(ctx, _state, delta, section) {
  const { groupRef, swingActive, swingProgress, swingType, swingStart,
    swingEnd, smoothRotY, _pos } = ctx

  if (swingActive.current) {
    const prevT = swingProgress.current
    swingProgress.current += delta * 0.7
    const t = Math.min(1, swingProgress.current)
    const easedT = t * t * (3 - 2 * t)

    const pos = _pos.current.lerpVectors(swingStart.current, swingEnd.current, easedT)
    if (swingType.current === 'forward') {
      pos.y += Math.sin(easedT * Math.PI) * 1.5
    }
    groupRef.current.position.copy(pos)

    // Emit swingTransition at the arc midpoint — triggers PhysicsText letter spawning
    if (prevT < 0.5 && t >= 0.5 && !midpointEmitted) {
      midpointEmitted = true
      emit('swingTransition', {
        to: animState.landingSection,
        start: swingStart.current.clone(),
        end: swingEnd.current.clone(),
      })
    }

    const dir = swingEnd.current.x - swingStart.current.x
    const targetRotY = dir >= 0 ? 0.5 : -0.5
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, targetRotY, 0.06)

    // Scale restoration when leaving experience
    if (groupRef.current.scale.x < CHARACTER_SCALE) {
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, CHARACTER_SCALE, 0.05)
      groupRef.current.scale.setScalar(s)
    }

    if (t >= 1) {
      swingActive.current = false
      midpointEmitted = false
      groupRef.current.position.copy(swingEnd.current)
    }

  } else if (animState.phase === 'idle') {
    const target = SECTION_POS[section] || SECTION_POS.hero
    groupRef.current.position.lerp(target, 0.025)
    const targetRot = SECTION_ROT_Y[section] ?? 0
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, targetRot, 0.025)

    // Ensure scale is restored to normal after leaving experience
    if (groupRef.current.scale.x < CHARACTER_SCALE - 0.0001) {
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, CHARACTER_SCALE, 0.05)
      groupRef.current.scale.setScalar(s)
    }
  }
}

export function onFinished(clipName, ctx) {
  const { swingActive, swingEnd, groupRef, crossFadeTo, actionsRef } = ctx

  if (clipName === 'swinging') {
    swingActive.current = false
    if (groupRef.current) groupRef.current.position.copy(swingEnd.current)
    crossFadeTo('crouchToStand')
    actionsRef.current.crouchToStand?.setLoop(THREE.LoopOnce, 1)
    animState.clip = 'crouchToStand'
    emit('landOnText', { section: animState.landingSection })
    return true
  }

  if (clipName === 'changeDirection') {
    swingActive.current = false
    if (groupRef.current) groupRef.current.position.copy(swingEnd.current)
    animState.isSwinging = false
    const idle = 'lookOverShoulder'
    crossFadeTo(idle, 0.5)
    actionsRef.current[idle]?.setLoop(THREE.LoopRepeat)
    animState.clip = idle
    animState.phase = 'idle'
    return true
  }

  // Post-swing crouchToStand (not heroLanding — that's handled by loading phase)
  if (clipName === 'crouchToStand' && animState.phase !== 'heroLanding') {
    animState.isSwinging = false
    emit('pickupText', { section: animState.landingSection })
    const idle = 'lookOverShoulder'
    crossFadeTo(idle, 0.5)
    actionsRef.current[idle]?.setLoop(THREE.LoopRepeat)
    animState.clip = idle
    animState.phase = 'idle'
    return true
  }

  return false
}
