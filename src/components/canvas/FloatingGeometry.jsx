import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import { mouse } from '../../utils/mouseTracker'

const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#2a1f3d'),
    uColor2: new THREE.Color('#c8a87c'),
    uColor3: new THREE.Color('#4a3728'),
  },
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);

      float gradientMix = vNormal.y * 0.5 + 0.5;
      gradientMix += sin(uTime * 0.3 + vUv.x * 6.28) * 0.08;

      vec3 color = mix(uColor1, uColor2, gradientMix);
      color = mix(color, uColor3, fresnel * 0.6);
      color += fresnel * vec3(0.25, 0.18, 0.1);

      gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ GradientMaterial })

function MainSphere() {
  const meshRef = useRef()
  const materialRef = useRef()

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return
    const t = state.clock.elapsedTime
    materialRef.current.uTime = t
    meshRef.current.rotation.y += 0.002
    meshRef.current.rotation.z = Math.sin(t * 0.15) * 0.08
  })

  return (
    <mesh ref={meshRef} scale={1.6}>
      <icosahedronGeometry args={[1, 20]} />
      <gradientMaterial ref={materialRef} />
    </mesh>
  )
}

function AccentShape({ position, geometry, color, wireframe = true, scale = 1, speed = 2 }) {
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh position={position} scale={scale}>
        {geometry}
        <meshStandardMaterial
          color={color}
          wireframe={wireframe}
          transparent
          opacity={0.35}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  )
}

export default function FloatingGeometry() {
  const groupRef = useRef()
  const smoothMouse = useRef({ x: 0, y: 0 })

  useFrame(() => {
    if (!groupRef.current) return
    smoothMouse.current.x = THREE.MathUtils.lerp(smoothMouse.current.x, mouse.x, 0.03)
    smoothMouse.current.y = THREE.MathUtils.lerp(smoothMouse.current.y, mouse.y, 0.03)
    groupRef.current.rotation.y = smoothMouse.current.x * 0.2
    groupRef.current.rotation.x = -smoothMouse.current.y * 0.12
  })

  return (
    <group ref={groupRef}>
      <MainSphere />

      <AccentShape
        position={[3.2, 1.4, -1.8]}
        geometry={<octahedronGeometry args={[0.25]} />}
        color="#c8a87c"
        speed={1.4}
      />
      <AccentShape
        position={[-3, -1.2, -0.8]}
        geometry={<tetrahedronGeometry args={[0.2]} />}
        color="#8b7355"
        speed={2.2}
      />
      <AccentShape
        position={[2.2, -1.8, 0.8]}
        geometry={<dodecahedronGeometry args={[0.18]} />}
        color="#c8a87c"
        speed={1.6}
      />
      <AccentShape
        position={[-2.5, 1.8, -1.2]}
        geometry={<icosahedronGeometry args={[0.15]} />}
        color="#9a8060"
        speed={2}
      />
    </group>
  )
}
