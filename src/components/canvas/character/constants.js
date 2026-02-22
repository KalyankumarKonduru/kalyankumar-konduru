import * as THREE from 'three'

export const FBX_BASE = '/models/'

export const CLIP_FILES = {
  lookOverShoulder: 'look-over-shoulder.fbx',
  running: 'running.fbx',
  kneelingPointing: 'kneeling-pointing.fbx',
  swinging: 'swinging.fbx',
  crouchToStand: 'crouch-to-stand.fbx',
  changeDirection: 'change-direction.fbx',
  sittingLaughing: 'Sitting Laughing.fbx',
  jumpToFreehang: 'Jump To Freehang.fbx',
  ropeClimb: 'Rope Climb.fbx',
}

export const SECTION_POS = {
  hero: new THREE.Vector3(1.5, -1.6, 0.5),
  about: new THREE.Vector3(-1.5, -1.6, 0.5),
  experience: new THREE.Vector3(0, -0.35, 0.5),
  projects: new THREE.Vector3(1.5, -1.6, 0),
  contact: new THREE.Vector3(0, -1.4, 1),
}

export const SECTION_ROT_Y = {
  hero: -0.3,
  about: 0.4,
  experience: 0,
  projects: -0.5,
  contact: 0,
}

export const SECTION_ORDER = { hero: 0, about: 1, experience: 2, projects: 3, contact: 4 }

export const CROSSFADE_DURATION = 0.4
export const CHARACTER_SCALE = 0.012
export const EXPERIENCE_SCALE = 0.006

export const SITTING_POS = new THREE.Vector3(0, -0.3, 1.0)
export const SITTING_ROT_Y = 0

export const LOAD_Y = -2.0
export const LOAD_Z = 1.0
