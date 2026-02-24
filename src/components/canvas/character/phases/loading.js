import * as THREE from 'three'
import { animState, emit } from '../../../../utils/animationState'
import {
  SITTING_POS, SITTING_ROT_Y, LOAD_Y, LOAD_Z,
  SECTION_POS, SECTION_ROT_Y, CHARACTER_SCALE,
} from '../constants'

/**
 * Convert a screen-pixel position to 3D world coordinates on a target Z plane.
 */
function screenToWorld(screenX, screenY, camera, canvasW, canvasH, targetZ) {
  const ndcX = (screenX / canvasW) * 2 - 1
  const ndcY = -(screenY / canvasH) * 2 + 1
  const dist = camera.position.z - targetZ
  const halfH = Math.tan((camera.fov * Math.PI / 180) / 2) * dist
  const halfW = halfH * (canvasW / canvasH)
  return { x: ndcX * halfW, y: ndcY * halfH }
}

/**
 * Convert a pixel height to world units at a given Z depth.
 */
function pxToWorldHeight(px, camera, canvasH, targetZ) {
  const dist = camera.position.z - targetZ
  const fullH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * dist
  return px * (fullH / canvasH)
}

// Mixamo character model height in model-space units
const MODEL_HEIGHT = 180

// The character should be roughly this many times the letter height
const CHAR_TO_TEXT_RATIO = 1.3

// Module-level: remembers the computed loading-phase scale across phase transitions
let loadingScale = null

// Sitting: offset root down so the butt (not feet) rests on text
const SITTING_BUTT_OFFSET = 0.55

export function update(ctx, state, delta) {
  const { groupRef, smoothRotY, jumpProgress, jumpStart, jumpEnd, _pos,
    prevLoadProgress, crossFadeTo, actionsRef, currentAction } = ctx

  const camera = state.camera
  const canvas = state.gl.domElement
  const cW = canvas.clientWidth
  const cH = canvas.clientHeight

  if (animState.phase === 'sitting') {
    // --- Scale character to match the "Loading..." text height ---
    const textEl = document.querySelector('.loader-scramble-text')
    if (textEl && cH > 0) {
      const rect = textEl.getBoundingClientRect()

      // Compute scale: character height ≈ text height × ratio
      const textWorldH = pxToWorldHeight(rect.height, camera, cH, SITTING_POS.z)
      loadingScale = (textWorldH * CHAR_TO_TEXT_RATIO) / MODEL_HEIGHT
      groupRef.current.scale.setScalar(loadingScale)

      // Position on the top edge of the text, horizontally centered
      const pos = screenToWorld(
        rect.left + rect.width * 0.5,
        rect.top,
        camera, cW, cH, SITTING_POS.z,
      )
      // Adjust butt offset proportionally to scale
      const buttOffset = SITTING_BUTT_OFFSET * (loadingScale / CHARACTER_SCALE)
      groupRef.current.position.set(pos.x, pos.y - buttOffset, SITTING_POS.z)
    } else {
      groupRef.current.position.set(SITTING_POS.x, SITTING_POS.y, SITTING_POS.z)
    }
    smoothRotY.current = SITTING_ROT_Y

  } else if (animState.phase === 'jumping') {
    // Keep loading scale during jump
    if (loadingScale) groupRef.current.scale.setScalar(loadingScale)

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
    // Keep loading scale while running on bar
    if (loadingScale) groupRef.current.scale.setScalar(loadingScale)

    // Feet ON the loading bar
    let loadY = LOAD_Y
    const barEl = document.querySelector('.loader-bar-track')
    if (barEl && cH > 0) {
      const rect = barEl.getBoundingClientRect()
      const pos = screenToWorld(0, rect.top, camera, cW, cH, LOAD_Z)
      loadY = pos.y
    }

    const t = animState.loadProgress / 100
    groupRef.current.position.x = THREE.MathUtils.lerp(-3.5, 3.5, t)
    groupRef.current.position.y = loadY
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

    // Grow from loading scale back to normal CHARACTER_SCALE
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, CHARACTER_SCALE, 0.03)
    groupRef.current.scale.setScalar(s)

  } else if (animState.phase === 'heroLanding') {
    groupRef.current.position.lerp(SECTION_POS.hero, 0.03)
    smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, SECTION_ROT_Y.hero, 0.03)

    // Continue growing to CHARACTER_SCALE
    if (groupRef.current.scale.x < CHARACTER_SCALE - 0.0001) {
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, CHARACTER_SCALE, 0.03)
      groupRef.current.scale.setScalar(s)
    }
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
