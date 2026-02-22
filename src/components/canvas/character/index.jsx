import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { animState, emit, on } from '../../../utils/animationState'
import { scroll } from '../../../utils/scrollTracker'
import {
  FBX_BASE, CLIP_FILES, SECTION_ORDER, CROSSFADE_DURATION,
  CHARACTER_SCALE, SITTING_POS, SITTING_ROT_Y, LOAD_Y, LOAD_Z,
  SECTION_ROT_Y,
} from './constants'
import * as loadingPhase from './phases/loading'
import * as movementPhase from './phases/movement'
import * as experiencePhase from './phases/experience'

export default function Character() {
  const groupRef = useRef()
  const mixerRef = useRef(null)
  const actionsRef = useRef({})
  const currentAction = useRef(null)
  const modelReady = useRef(false)

  const swingStart = useRef(new THREE.Vector3())
  const swingEnd = useRef(new THREE.Vector3())
  const swingProgress = useRef(0)
  const swingActive = useRef(false)
  const jumpProgress = useRef(0)
  const jumpStart = useRef(new THREE.Vector3())
  const jumpEnd = useRef(new THREE.Vector3())
  const swingType = useRef('forward')
  const prevSection = useRef('hero')
  const prevLoadProgress = useRef(0)
  const _pos = useRef(new THREE.Vector3())
  const smoothRotY = useRef(SECTION_ROT_Y.hero)

  const fbxFiles = useLoader(
    FBXLoader,
    Object.values(CLIP_FILES).map((f) => FBX_BASE + f)
  )

  const { model, clips } = useMemo(() => {
    const names = Object.keys(CLIP_FILES)
    const base = fbxFiles[0]
    const clipMap = {}

    fbxFiles.forEach((fbx, i) => {
      if (fbx.animations && fbx.animations.length > 0) {
        const clip = fbx.animations[0].clone()
        clip.name = names[i]
        // Keep position tracks for sitting animation (needed for proper sitting pose)
        if (names[i] !== 'sittingLaughing') {
          clip.tracks = clip.tracks.filter(track => !track.name.endsWith('.position'))
        }
        clipMap[names[i]] = clip
      }
    })

    base.traverse((child) => {
      child.frustumCulled = false
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          const newMats = mats.map((mat) => {
            const col = mat.color ? mat.color.clone() : new THREE.Color(0xc8a87c)
            if (col.r + col.g + col.b < 0.15) col.set('#c8a87c')
            const toon = new THREE.MeshToonMaterial({ color: col, side: THREE.DoubleSide })
            mat.dispose()
            return toon
          })
          child.material = Array.isArray(child.material) ? newMats : newMats[0]
        }
      }
    })

    return { model: base, clips: clipMap }
  }, [fbxFiles])

  function crossFadeTo(name, duration = CROSSFADE_DURATION) {
    const next = actionsRef.current[name]
    if (!next || !currentAction.current) return
    next.reset()
    next.setEffectiveTimeScale(1)
    next.setEffectiveWeight(1)
    currentAction.current.crossFadeTo(next, duration, true)
    next.play()
    currentAction.current = next
  }

  // Shared context passed to all phase modules
  const ctx = {
    groupRef, mixerRef, actionsRef, currentAction,
    swingStart, swingEnd, swingProgress, swingActive, swingType,
    jumpProgress, jumpStart, jumpEnd,
    prevLoadProgress, _pos, smoothRotY,
    crossFadeTo,
  }

  useEffect(() => {
    if (!model || !groupRef.current) return

    const mixer = new THREE.AnimationMixer(model)
    mixerRef.current = mixer

    const actions = {}
    Object.entries(clips).forEach(([name, clip]) => {
      const action = mixer.clipAction(clip)
      action.clampWhenFinished = true
      actions[name] = action
    })
    actionsRef.current = actions

    // Start with sitting laughing animation (plays once during Phase 1)
    if (actions.sittingLaughing) {
      actions.sittingLaughing.setLoop(THREE.LoopOnce, 1)
      actions.sittingLaughing.clampWhenFinished = true
      actions.sittingLaughing.play()
      currentAction.current = actions.sittingLaughing
      animState.clip = 'sittingLaughing'
      animState.phase = 'sitting'
    }

    modelReady.current = true
    emit('characterReady')

    function handleFinished(e) {
      const clipName = e.action.getClip().name
      // Chain through phase handlers — first match wins
      if (loadingPhase.onFinished(clipName, ctx)) return
      if (experiencePhase.onFinished(clipName, ctx)) return
      if (movementPhase.onFinished(clipName, ctx)) return
    }

    mixer.addEventListener('finished', handleFinished)
    return () => {
      mixer.removeEventListener('finished', handleFinished)
      mixer.stopAllAction()
    }
  }, [model, clips])

  useEffect(() => {
    const unsubReady = on('siteReady', () => {
      if (currentAction.current) currentAction.current.setEffectiveTimeScale(1)
      animState.phase = 'heroEntrance'
      crossFadeTo('kneelingPointing')
      actionsRef.current.kneelingPointing?.setLoop(THREE.LoopOnce, 1)
      animState.clip = 'kneelingPointing'
    })

    const unsubProgress = on('loadProgress', (p) => {
      animState.loadProgress = p
    })

    const unsubJump = on('jumpToBar', () => {
      animState.phase = 'jumping'
      jumpProgress.current = 0
      jumpStart.current.copy(groupRef.current.position)
      jumpEnd.current.set(-3.5, LOAD_Y, LOAD_Z)
    })

    return () => { unsubReady(); unsubProgress(); unsubJump() }
  }, [])

  useFrame((state, delta) => {
    if (!modelReady.current || !groupRef.current) return

    mixerRef.current?.update(delta)
    // Ensure no residual object-level root motion shifts the model within the group
    model.position.x = 0
    model.position.z = 0

    const section = scroll.section || 'hero'
    const phase = animState.phase

    // Pre-scroll phases (sitting, jumping)
    if (phase === 'sitting' || phase === 'jumping') {
      loadingPhase.update(ctx, state, delta)
    } else {
      // Section change detection
      if (
        section !== prevSection.current &&
        phase !== 'loading' &&
        phase !== 'heroEntrance' &&
        phase !== 'heroLanding' &&
        phase !== 'swinging' &&
        phase !== 'experienceEntry' &&
        !swingActive.current
      ) {
        const fromIdx = SECTION_ORDER[prevSection.current] ?? 0
        const toIdx = SECTION_ORDER[section] ?? 0
        const isBackward = toIdx < fromIdx

        if (section === 'experience') {
          prevSection.current = section
          experiencePhase.triggerEntry(ctx)
        } else if (prevSection.current === 'experience') {
          prevSection.current = section
          experiencePhase.triggerExit(ctx, section, isBackward)
        } else {
          prevSection.current = section
          movementPhase.trigger(ctx, section, isBackward ? 'backward' : 'forward')
        }
      }

      // Phase-specific frame updates
      if (phase === 'experienceEntry' || phase === 'experienceRiding') {
        experiencePhase.update(ctx, state, delta)
      } else if (swingActive.current || phase === 'idle') {
        movementPhase.update(ctx, state, delta, section)
      } else if (phase === 'loading' || phase === 'heroEntrance' || phase === 'heroLanding') {
        loadingPhase.update(ctx, state, delta)
      }
    }

    groupRef.current.rotation.y = smoothRotY.current

    // Subtle idle bounce (not during sitting, jumping, experience, or active swing)
    if (
      !swingActive.current &&
      phase !== 'sitting' &&
      phase !== 'jumping' &&
      phase !== 'experienceEntry' &&
      phase !== 'experienceRiding'
    ) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005
    }
  })

  return (
    <group ref={groupRef} scale={CHARACTER_SCALE} position={[SITTING_POS.x, SITTING_POS.y, SITTING_POS.z]} rotation={[0, SITTING_ROT_Y, 0]}>
      <primitive object={model} />
    </group>
  )
}
