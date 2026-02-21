import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import FloatingGeometry from './FloatingGeometry'
import ParticleField from './ParticleField'
import Character from './Character'

export default function Scene({ siteReady }) {
  return (
    <div className="fixed inset-0 z-[10001]" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#c8a87c" />
          <directionalLight position={[-5, -3, 2]} intensity={0.4} color="#4a3728" />
          <directionalLight position={[0, 2, 6]} intensity={1.0} color="#ffffff" />
          <pointLight position={[0, 3, 4]} intensity={0.8} color="#d4b88e" />
          <pointLight position={[-3, 1, 3]} intensity={0.4} color="#c8a87c" />

          {siteReady && <FloatingGeometry />}
          {siteReady && <ParticleField count={1200} />}
          <Character />

          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={0.6}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0004, 0.0004]}
            />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
