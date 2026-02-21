import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { animState, emit, on } from '../../utils/animationState'
import { scroll } from '../../utils/scrollTracker'

const FBX_BASE = '/models/'
const CLIP_FILES = {
  lookOverShoulder: 'look-over-shoulder.fbx',
  running: 'running.fbx',
  kneelingPointing: 'kneeling-pointing.fbx',
  swinging: 'swinging.fbx',
  crouchToStand: 'crouch-to-stand.fbx',
  changeDirection: 'change-direction.fbx',
}

const SECTION_POS = {
  hero: new THREE.Vector3(1.5, -1.6, 0.5),
  about: new THREE.Vector3(-1.5, -1.6, 0.5),
  projects: new THREE.Vector3(1.5, -1.6, 0),
  contact: new THREE.Vector3(0, -1.4, 1),
}

const SECTION_ROT_Y = {
  hero: -0.3,
  about: 0.4,
  projects: -0.5,
  contact: 0,
}

// Section order for detecting forward vs backward scroll
const SECTION_ORDER = { hero: 0, about: 1, projects: 2, contact: 3 }

const CROSSFADE_DURATION = 0.4
const CHARACTER_SCALE = 0.012

// Loading path: below the centre sphere (y=-2.0) and in front of it (z=1.0)
const LOAD_Y = -2.0
const LOAD_Z = 1.0

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
  const swingType = useRef('forward') // 'forward' = arc swing | 'backward' = flat run
  const prevSection = useRef('hero')
  const prevLoadProgress = useRef(0)
  const _pos = useRef(new THREE.Vector3()) // reusable — avoids allocation every frame
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
        // Strip all position tracks (root motion) — only rotation drives the animation.
        // Mixamo FBX embeds forward translation on the Hips bone; removing it keeps
        // the character in-place so our code is the sole driver of world position.
        clip.tracks = clip.tracks.filter(track => !track.name.endsWith('.position'))
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

    // Start running immediately so Luffy runs across during loading
    if (actions.running) {
      actions.running.setLoop(THREE.LoopRepeat)
      actions.running.play()
      currentAction.current = actions.running
      animState.clip = 'running'
    }

    modelReady.current = true
    emit('characterReady')

    function handleFinished(e) {
      const clipName = e.action.getClip().name

      if (clipName === 'kneelingPointing') {
        // Entrance: land with crouchToStand instead of running to position
        crossFadeTo('crouchToStand')
        actionsRef.current.crouchToStand?.setLoop(THREE.LoopOnce, 1)
        animState.clip = 'crouchToStand'
        animState.phase = 'heroLanding'
        animState.landingSection = 'hero'
      }

      if (clipName === 'crouchToStand') {
        animState.isSwinging = false
        if (animState.phase === 'heroLanding') {
          // Initial entrance complete — straight to idle
          const idle = 'lookOverShoulder'
          crossFadeTo(idle, 0.5)
          actionsRef.current[idle]?.setLoop(THREE.LoopRepeat)
          animState.clip = idle
          animState.phase = 'idle'
        } else {
          // Post-swing landing
          emit('pickupText', { section: animState.landingSection })
          const idle = 'lookOverShoulder'
          crossFadeTo(idle, 0.5)
          actionsRef.current[idle]?.setLoop(THREE.LoopRepeat)
          animState.clip = idle
          animState.phase = 'idle'
        }
      }

      if (clipName === 'swinging') {
        swingActive.current = false
        if (groupRef.current) groupRef.current.position.copy(swingEnd.current)
        crossFadeTo('crouchToStand')
        actionsRef.current.crouchToStand?.setLoop(THREE.LoopOnce, 1)
        animState.clip = 'crouchToStand'
        emit('landOnText', { section: animState.landingSection })
      }

      if (clipName === 'changeDirection') {
        // Backward run complete — snap to destination and idle
        swingActive.current = false
        if (groupRef.current) groupRef.current.position.copy(swingEnd.current)
        animState.isSwinging = false
        const idle = 'lookOverShoulder'
        crossFadeTo(idle, 0.5)
        actionsRef.current[idle]?.setLoop(THREE.LoopRepeat)
        animState.clip = idle
        animState.phase = 'idle'
      }
    }

    mixer.addEventListener('finished', handleFinished)

    return () => {
      mixer.removeEventListener('finished', handleFinished)
      mixer.stopAllAction()
    }
  }, [model, clips])

  useEffect(() => {
    const unsubReady = on('siteReady', () => {
      // Restore normal playback speed before starting entrance animations
      if (currentAction.current) currentAction.current.setEffectiveTimeScale(1)
      animState.phase = 'heroEntrance'
      crossFadeTo('kneelingPointing')
      actionsRef.current.kneelingPointing?.setLoop(THREE.LoopOnce, 1)
      animState.clip = 'kneelingPointing'
    })

    const unsubProgress = on('loadProgress', (p) => {
      animState.loadProgress = p
    })

    return () => { unsubReady(); unsubProgress() }
  }, [])

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

  function triggerMovement(toSection, type = 'forward') {
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

  useFrame((state, delta) => {
    if (!modelReady.current || !groupRef.current) return

    mixerRef.current?.update(delta)
    // Ensure no residual object-level root motion shifts the model within the group
    model.position.x = 0
    model.position.z = 0

    const section = scroll.section || 'hero'

    // Detect section change and direction
    if (
      section !== prevSection.current &&
      animState.phase !== 'loading' &&
      animState.phase !== 'heroEntrance' &&
      animState.phase !== 'heroLanding' &&
      animState.phase !== 'swinging' &&
      !swingActive.current
    ) {
      const fromIdx = SECTION_ORDER[prevSection.current] ?? 0
      const toIdx = SECTION_ORDER[section] ?? 0
      const isBackward = toIdx < fromIdx
      prevSection.current = section
      triggerMovement(section, isBackward ? 'backward' : 'forward')
    }

    // Movement arc / flat run
    if (swingActive.current) {
      swingProgress.current += delta * 0.7
      const t = Math.min(1, swingProgress.current)
      const easedT = t * t * (3 - 2 * t)

      const pos = _pos.current.lerpVectors(swingStart.current, swingEnd.current, easedT)

      if (swingType.current === 'forward') {
        // Parabolic arc upward for swing
        pos.y += Math.sin(easedT * Math.PI) * 1.5
      }
      // backward: flat path — no arc added

      groupRef.current.position.copy(pos)

      const dir = swingEnd.current.x - swingStart.current.x
      const targetRotY = dir >= 0 ? 0.5 : -0.5
      smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, targetRotY, 0.06)

      if (t >= 1) {
        swingActive.current = false
        groupRef.current.position.copy(swingEnd.current)
      }

    } else if (animState.phase === 'idle') {
      const target = SECTION_POS[section] || SECTION_POS.hero
      groupRef.current.position.lerp(target, 0.025)
      const targetRot = SECTION_ROT_Y[section] ?? 0
      smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, targetRot, 0.025)

    } else if (animState.phase === 'loading') {
      // Position locked 1:1 with progress — no lag
      const t = animState.loadProgress / 100
      groupRef.current.position.x = THREE.MathUtils.lerp(-3.5, 3.5, t)
      groupRef.current.position.y = LOAD_Y
      groupRef.current.position.z = LOAD_Z
      // Snap rotation immediately — no lerp so it never passes through camera-facing
      smoothRotY.current = Math.PI / 2

      // Tie animation speed to how fast progress is moving this frame.
      // At the average fill rate (100% over 5s = 20%/s), timeScale = 1.
      // Progress slows → legs slow. Progress pauses → legs stop.
      const dp = animState.loadProgress - prevLoadProgress.current
      prevLoadProgress.current = animState.loadProgress
      const safeDelta = Math.max(delta, 0.001)
      const loadTimeScale = dp > 0 ? Math.min(dp / (safeDelta * 20), 3) : 0
      currentAction.current?.setEffectiveTimeScale(loadTimeScale)

    } else if (animState.phase === 'heroEntrance') {
      // Hold at right side while kneelingPointing plays
      groupRef.current.position.lerp(new THREE.Vector3(3, -1.6, 0.5), 0.03)
      smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, -0.8, 0.03)

    } else if (animState.phase === 'heroLanding') {
      // Drift to hero position while crouchToStand plays
      groupRef.current.position.lerp(SECTION_POS.hero, 0.03)
      smoothRotY.current = THREE.MathUtils.lerp(smoothRotY.current, SECTION_ROT_Y.hero, 0.03)
    }

    groupRef.current.rotation.y = smoothRotY.current

    // Subtle idle bounce (not during active movement)
    if (!swingActive.current) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005
    }
  })

  return (
    <group ref={groupRef} scale={CHARACTER_SCALE} position={[-3.5, LOAD_Y, LOAD_Z]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={model} />
    </group>
  )
}
