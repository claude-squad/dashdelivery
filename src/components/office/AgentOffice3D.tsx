import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '@/store/useStore'
import { ClawAgent } from './ClawAgent'
import { OfficeRoom } from './OfficeRoom'
import { STATIONS_3D } from './sceneConstants'
import { AgentOffice } from './AgentOffice'

const webGLAvailable = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
})()

function SceneLighting() {
  return (
    <>
      {/* Ambient — warm office tone */}
      <ambientLight color="#c8a870" intensity={0.55} />
      {/* Main sun — cool daylight */}
      <directionalLight
        position={[8, 14, 6]}
        color="#f0f4ff"
        intensity={1.3}
        castShadow
        shadow-mapSize={[1024, 1024] as unknown as number}
        shadow-bias={-0.0002}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={40}
      />
      {/* Fill light — soft from opposite side */}
      <directionalLight position={[-5, 6, -4]} color="#4060a0" intensity={0.35} />
    </>
  )
}

export function AgentOffice3D() {
  const { agentInstances, agentDefinitions, setSelectedAgent, isDemoMode } = useStore()

  if (!webGLAvailable) return <AgentOffice />

  return (
    <div
      className="relative w-full h-full min-h-[420px] rounded-xl border border-border"
      style={{ background: '#1a1a2e' }}
    >
      {/* Demo mode overlay */}
      {isDemoMode && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, padding: '2px 10px',
          background: 'rgba(124,108,240,0.18)',
          border: '1px solid rgba(124,108,240,0.3)',
          borderRadius: 99, color: '#a799ff',
          fontSize: 9, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          pointerEvents: 'none' as const, whiteSpace: 'nowrap' as const,
        }}>
          DEMO MODE — EXECUÇÃO SIMULADA
        </div>
      )}

      {/* Orbit hint */}
      <div style={{
        position: 'absolute', bottom: 8, right: 10, zIndex: 10,
        fontSize: 9, color: 'rgba(255,255,255,0.25)',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        drag · scroll · right-click
      </div>

      <Canvas
        camera={{
          fov: 52,
          position: [7, 9, 12],
          near: 0.1,
          far: 80,
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }}
      >
        <SceneLighting />

        <OrbitControls
          target={[0, 0, 0.5]}
          minDistance={4}
          maxDistance={28}
          maxPolarAngle={Math.PI / 2.1}
          enablePan={true}
          dampingFactor={0.08}
          enableDamping
        />

        <Suspense fallback={null}>
          <OfficeRoom />

          {agentDefinitions.map((def) => {
            const instance = agentInstances[def.id]
            const station  = STATIONS_3D[def.id]
            if (!instance || !station) return null

            return (
              <ClawAgent
                key={def.id}
                def={def}
                instance={instance}
                worldX={station.x}
                worldZ={station.z}
                label={station.label}
                onClick={() => setSelectedAgent(def.id)}
              />
            )
          })}
        </Suspense>
      </Canvas>
    </div>
  )
}
