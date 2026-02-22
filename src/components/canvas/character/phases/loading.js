import * as THREE from 'three'
import { animState, emit } from '../../../../utils/animationState'
import {
  SITTING_POS, SITTING_ROT_Y, LOAD_Y, LOAD_Z,
  SECTION_POS, SECTION_ROT_Y,
} from '../constants'

export function update(ctx, _state, delta) {
  const { groupRef, smoothRotY, jumpProgress, jumpStart, jumpEnd, _pos,
    prevLoadProgress, crossFadeTo, actionsRef, currentAction } = ctx

  if (animState.phase === 'sitting') {
    groupRef.current.position.set(SITTING_POS.x, SITTING_POS.y, SITTING_POS.z)
    smoothRotY.current = SITTING_ROT_Y

  } else if (animState.phase === 'jumping') {
    jumpProgress.current += delta * 1.2
    const t = Math.min(1, jumpProgress.current)
    const easedT = t * t * (3 - 2 * t)

    const pos = _pos.current.lerpVectors(jumpStart.current, jumpEnd.current, easedT)
    pos.y += Math.sin(easedT * Math.PI) * 1.2
    groupRef.current.position.copy(pos)

    smoothRotY.current = THREE.MathUtils.lerp(SITTING_ROT_Y, Math.PI / 2, easedT)

    if (t >= 1) {
      groupRef.current.position.copy(jumpEnd.current)
      animState.phase = 'loading'
      crossFadeTo('running')
      actionsRef.current.running?.setLoop(THREE.LoopRepeat)
      animState.clip = 'running'
      prevLoadProgress.current = 0
      emit('jumpDone')
    }

  } else if (animState.phase === 'loading') {
    const t = animState.loadProgress / 100
    groupRef.current.position.x = THREE.MathUtils.lerp(-3.5, 3.5, t)
    groupRef.current.position.y = LOAD_Y
    groupRef.current.position.z = LOAD_Z
    smoothRotY.current = Math.PI / 2

    const dp = animState.loadProgress - prevLoadProgress.current
    prevLoadProgress.current = animState.loadProgress
    const safeDelta = Math.max(delta, 0.001)
    const loadTimeScale = dp > 0 ? Math.min(dp / (safeDelta * 20), 3) : 0
    currentAction.current?.setEffectiveTimeScale(loadTimeScale)

  } else if (animState.phase === 'heroEntrance') {
    groupRef.current.position.lerp(new THREE.Vector3(3, -1.6, 0.5), 0.03)
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, -0.8, 0.03)

  } else if (animState.phase === 'heroLanding') {
    groupRef.current.position.lerp(SECTION_POS.hero, 0.03)
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, SECTION_ROT_Y.hero, 0.03)
  }
}

export function onFinished(clipName, ctx) {
  const { crossFadeTo, actionsRef } = ctx

  if (clipName === 'sittingLaughing') {
    emit('sittingDone')
    return true
  }

  if (clipName === 'kneelingPointing') {
    crossFadeTo('crouchToStand')
    actionsRef.current.crouchToStand?.setLoop(THREE.LoopOnce, 1)
    animState.clip = 'crouchToStand'
    animState.phase = 'heroLanding'
    animState.landingSection = 'hero'
    return true
  }

  if (clipName === 'crouchToStand' && animState.phase === 'heroLanding') {
    animState.isSwinging = false
    const idle = 'lookOverShoulder'
    crossFadeTo(idle, 0.5)
    actionsRef.current[idle]?.setLoop(THREE.LoopRepeat)
    animState.clip = idle
    animState.phase = 'idle'
    return true
  }

  return false
}
