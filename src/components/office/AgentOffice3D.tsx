import { Suspense, useEffect, useState } from 'react'
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
      <ambientLight color="#c8a870" intensity={0.55} />
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
      <directionalLight position={[-5, 6, -4]} color="#4060a0" intensity={0.35} />
    </>
  )
}

function ThreeJSOffice({ compact = false }: { compact?: boolean }) {
  const { agentInstances, agentDefinitions, setSelectedAgent, isDemoMode } = useStore()

  if (!webGLAvailable) return <AgentOffice />

  return (
    <div
      className={`relative w-full h-full rounded-xl border border-border ${compact ? 'min-h-[120px]' : 'min-h-[320px]'}`}
      style={{ background: '#1a1a2e' }}
    >
      {isDemoMode && !compact && (
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
      {!compact && (
        <div style={{
          position: 'absolute', bottom: 8, right: 10, zIndex: 10,
          fontSize: 9, color: 'rgba(255,255,255,0.25)',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          drag · scroll · right-click
        </div>
      )}
      <Canvas
        camera={{ fov: 46, position: [3, 18, 12], near: 0.1, far: 80 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }}
      >
        <SceneLighting />
        <OrbitControls
          target={[0, 0, 0.5]}
          minDistance={4}
          maxDistance={32}
          maxPolarAngle={Math.PI / 2.1}
          enablePan
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

// Priority: local Claw3D (3010) > deployed Claw3D (env var) > Three.js fallback
const LOCAL_ORIGIN = 'http://127.0.0.1:3010'
const PROD_CLAW3D  = import.meta.env.VITE_CLAW3D_URL || 'https://claw3d-source.vercel.app'

type Status = 'checking' | 'online-local' | 'online-prod' | 'offline'

export function AgentOffice3D({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    const timer = setTimeout(() => setStatus(PROD_CLAW3D ? 'online-prod' : 'offline'), 3000)
    fetch(`${LOCAL_ORIGIN}/`, { method: 'HEAD', mode: 'no-cors' })
      .then(() => { clearTimeout(timer); setStatus('online-local') })
      .catch(() => { clearTimeout(timer); setStatus(PROD_CLAW3D ? 'online-prod' : 'offline') })
    return () => clearTimeout(timer)
  }, [])

  const src = status === 'online-local'
    ? `${LOCAL_ORIGIN}/office`
    : `${PROD_CLAW3D}/office`

  if (status === 'offline') return <ThreeJSOffice compact={compact} />

  const minH = compact ? 'min-h-[120px]' : 'min-h-[320px]'

  if (status === 'checking') {
    return (
      <div
        className={`w-full h-full ${minH} flex items-center justify-center rounded-xl border border-border`}
        style={{ background: '#1a1a2e' }}
      >
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#7c6cf0]/40 border-t-[#7c6cf0] rounded-full animate-spin mx-auto" />
          {!compact && <div className="text-[11px] text-white/30">Conectando ao Escritório Virtual...</div>}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${minH} rounded-xl overflow-hidden border border-border`}>
      <iframe
        src={src}
        title="Escritório Virtual — Claw3D"
        className="w-full h-full border-0"
        style={{ background: '#1a1a2e' }}
        allow="fullscreen"
      />
      {!compact && (
        <div
          style={{
            position: 'absolute', bottom: 8, right: 10, zIndex: 10,
            fontSize: 9, color: 'rgba(255,255,255,0.25)',
            pointerEvents: 'none', userSelect: 'none',
          }}
        >
          Escritório Virtual · Claw3D
        </div>
      )}
    </div>
  )
}
