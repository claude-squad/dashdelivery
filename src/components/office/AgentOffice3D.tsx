import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useStore } from '@/store/useStore'
import { Agent3D } from './Agent3D'
import { STATIONS_3D } from './sceneConstants'
import { AgentOffice } from './AgentOffice'

const webGLAvailable = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
})()

function SceneLights() {
  return (
    <>
      <ambientLight color="#1a2040" intensity={0.9} />
      <directionalLight
        position={[3, 8, 4]}
        color="#c8d4ff"
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-4, 3, -4]} color="#3040a0" intensity={0.4} />
    </>
  )
}

function SceneFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#0b0e1a" roughness={1} metalness={0} />
      </mesh>
      <gridHelper args={[18, 18, '#7c6cf044', '#1a2040']} position={[0, -0.31, 0]} />
    </>
  )
}

function DemoModeBadge() {
  return (
    <Html fullscreen zIndexRange={[100, 110]}>
      <div
        style={{
          position: 'absolute', top: 8,
          left: '50%', transform: 'translateX(-50%)',
          padding: '2px 10px',
          background: 'rgba(124,108,240,0.18)',
          border: '1px solid rgba(124,108,240,0.3)',
          borderRadius: 99, color: '#a799ff',
          fontSize: 9, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}
      >
        DEMO MODE — EXECUÇÃO SIMULADA
      </div>
    </Html>
  )
}

export function AgentOffice3D() {
  const { agentInstances, agentDefinitions, setSelectedAgent, isDemoMode } = useStore()

  if (!webGLAvailable) return <AgentOffice />

  return (
    <div
      className="relative w-full h-full min-h-[300px] rounded-xl border border-border"
      style={{ background: '#0f1220' }}
    >
      <Canvas
        orthographic
        camera={{ position: [8, 10, 8], zoom: 45, near: 0.1, far: 100 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }}
      >
        <SceneLights />
        <SceneFloor />

        {isDemoMode && <DemoModeBadge />}

        <Suspense fallback={null}>
          {agentDefinitions.map((def) => {
            const instance = agentInstances[def.id]
            const station  = STATIONS_3D[def.id]
            if (!instance || !station) return null

            return (
              <Agent3D
                key={def.id}
                def={def}
                instance={instance}
                stationX={station.x}
                stationZ={station.z}
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
