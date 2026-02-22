import * as THREE from 'three'
import { animState } from '../../../../utils/animationState'
import { scroll } from '../../../../utils/scrollTracker'
import { SECTION_POS, CHARACTER_SCALE, EXPERIENCE_SCALE } from '../constants'

export function triggerEntry(ctx) {
  const { swingActive, swingProgress, swingStart, swingEnd, groupRef,
    crossFadeTo, actionsRef } = ctx
  if (swingActive.current) return

  swingActive.current = true
  swingProgress.current = 0
  swingStart.current.copy(groupRef.current.position)
  swingEnd.current.copy(SECTION_POS.experience)
  animState.isSwinging = true
  animState.phase = 'experienceEntry'
  animState.targetSection = 'experience'

  crossFadeTo('jumpToFreehang')
  actionsRef.current.jumpToFreehang?.setLoop(THREE.LoopOnce, 1)
  animState.clip = 'jumpToFreehang'
}

export function triggerExit(ctx, toSection, isBackward) {
  const { swingActive, swingProgress, swingType, swingStart, swingEnd,
    groupRef, crossFadeTo, actionsRef } = ctx
  if (swingActive.current) return

  swingActive.current = true
  swingProgress.current = 0
  swingType.current = isBackward ? 'backward' : 'forward'
  swingStart.current.copy(groupRef.current.position)
  swingEnd.current.copy(SECTION_POS[toSection] || SECTION_POS.hero)
  animState.isSwinging = true
  animState.landingSection = toSection
  animState.targetSection = toSection
  animState.phase = 'swinging'

  if (!isBackward) {
    crossFadeTo('swinging')
    actionsRef.current.swinging?.setLoop(THREE.LoopOnce, 1)
    animState.clip = 'swinging'
  } else {
    crossFadeTo('changeDirection')
    actionsRef.current.changeDirection?.setLoop(THREE.LoopOnce, 1)
    animState.clip = 'changeDirection'
  }
}

export function update(ctx, _state, delta) {
  const { groupRef, swingActive, swingProgress, swingStart, swingEnd,
    smoothRotY, _pos, currentAction } = ctx

  if (animState.phase === 'experienceEntry') {
    swingProgress.current += delta * 0.7
    const t = Math.min(1, swingProgress.current)
    const easedT = t * t * (3 - 2 * t)

    const pos = _pos.current.lerpVectors(swingStart.current, swingEnd.current, easedT)
    pos.y += Math.sin(easedT * Math.PI) * 1.5
    groupRef.current.position.copy(pos)

    // Scale transition: CHARACTER_SCALE -> EXPERIENCE_SCALE
    const s = THREE.MathUtils.lerp(CHARACTER_SCALE, EXPERIENCE_SCALE, easedT)
    groupRef.current.scale.setScalar(s)

    // Rotate toward camera (face forward)
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, 0, 0.06)

    if (t >= 1) {
      swingActive.current = false
      groupRef.current.position.copy(swingEnd.current)
      groupRef.current.scale.setScalar(EXPERIENCE_SCALE)
      // jumpToFreehang handleFinished callback will set phase to experienceRiding
    }

  } else if (animState.phase === 'experienceRiding') {
    // Y position driven by scroll progress through the section
    const targetY = THREE.MathUtils.lerp(0.5, -1.5, scroll.sectionProgress)
    groupRef.current.position.x = 0
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.08,
    )
    groupRef.current.position.z = 0.5
    groupRef.current.scale.setScalar(EXPERIENCE_SCALE)
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, 0, 0.05)

    // Scroll direction drives rope climb animation speed
    const vel = scroll.velocity
    if (vel < -2) {
      // Scrolling up -> climb animation plays
      const speed = Math.min(Math.abs(vel) / 10, 2)
      currentAction.current?.setEffectiveTimeScale(speed)
    } else {
      // Idle or scrolling down -> freeze in grip pose
      const current = currentAction.current?.getEffectiveTimeScale() || 0
      currentAction.current?.setEffectiveTimeScale(
        THREE.MathUtils.lerp(current, 0, 0.1),
      )
    }
  }
}

export function onFinished(clipName, ctx) {
  const { crossFadeTo, actionsRef, currentAction } = ctx

  if (clipName === 'jumpToFreehang') {
    // Experience entry complete — switch to ropeClimb frozen at frame 0 (grip pose)
    crossFadeTo('ropeClimb')
    actionsRef.current.ropeClimb?.setLoop(THREE.LoopRepeat)
    currentAction.current?.setEffectiveTimeScale(0)
    animState.clip = 'ropeClimb'
    animState.phase = 'experienceRiding'
    animState.isSwinging = false
    return true
  }

  return false
}
