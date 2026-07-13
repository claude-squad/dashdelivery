import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { RobotBody, RobotAccessory } from './RobotParts'
import { U, STATUS_DOT_COLOR, ACTIVE_STATUSES, BLOCKED_STATUSES } from './sceneConstants'
import type { AgentDefinition, AgentInstance } from '@/types'

interface Agent3DProps {
  def: AgentDefinition
  instance: AgentInstance
  stationX: number
  stationZ: number
  label: string
  onClick: () => void
}

function ActiveRing({ color }: { color: string }) {
  const mat1 = useRef<THREE.MeshBasicMaterial>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const mat2 = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (mat1.current) mat1.current.opacity = Math.sin(t * 2) * 0.15 + 0.35
    if (ring2.current && mat2.current) {
      const p = (t % 1.4) / 1.4
      ring2.current.scale.setScalar(1 + p * 1.2)
      mat2.current.opacity = (1 - p) * 0.45
    }
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.55 * U, 0.70 * U, 32]} />
        <meshBasicMaterial ref={mat1} color={color} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.55 * U, 0.70 * U, 32]} />
        <meshBasicMaterial ref={mat2} color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </>
  )
}

export function Agent3D({ def, instance, stationX, stationZ, label, onClick }: Agent3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const completedAt = useRef<number | null>(null)
  const [hovered, setHovered] = useState(false)

  const { status, currentTask, duration } = instance
  const isActive  = ACTIVE_STATUSES.has(status)
  const isBlocked = BLOCKED_STATUSES.has(status)
  const isQueued  = status === 'QUEUED'

  const emissive          = isBlocked ? '#ef4444' : def.color
  const emissiveIntensity = isActive ? 1.4 : isBlocked ? 1.8 : 0.3
  const opacity           = isQueued ? 0.55 : 1.0
  const dotColor          = STATUS_DOT_COLOR[status] ?? '#4b5563'

  useEffect(() => {
    completedAt.current = null  // reset on every status change
  }, [status])

  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return
    const t = clock.elapsedTime

    switch (status) {
      case 'EXECUTING':
        g.position.set(0, Math.abs(Math.sin(t * 4.0)) * 0.18, 0)
        g.rotation.y = Math.sin(t * 0.4) * 0.06
        g.scale.setScalar(1)
        break
      case 'RUNNING_TOOL':
        g.rotation.y += 0.04
        g.position.set(0, 0, 0)
        g.scale.setScalar(1)
        break
      case 'ANALYZING':
        g.scale.setScalar(1 + Math.sin(t * 3.0) * 0.08)
        g.position.set(0, 0, 0)
        g.rotation.y = Math.sin(t * 0.5) * 0.05
        break
      case 'COMPLETED': {
        if (completedAt.current === null) completedAt.current = t
        const elapsed = t - completedAt.current
        g.scale.setScalar(elapsed < 0.6 ? 1 + Math.sin((elapsed / 0.6) * Math.PI) * 0.35 : 1)
        g.position.set(0, 0, 0)
        break
      }
      case 'BLOCKED':
      case 'FAILED':
        g.position.set(Math.sin(t * 28) * 0.04, 0, 0)
        g.scale.setScalar(1)
        g.rotation.y = 0
        break
      default:
        g.position.set(0, Math.sin(t * 0.8) * 0.03, 0)
        g.rotation.y = Math.sin(t * 0.3) * 0.05
        g.scale.setScalar(1)
    }
  })

  const onOver  = useCallback((e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer' }, [])
  const onOut   = useCallback(() => { setHovered(false); document.body.style.cursor = '' }, [])
  const onPress = useCallback((e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick() }, [onClick])

  return (
    <group position={[stationX, 0, stationZ]}>
      <group ref={groupRef} onPointerOver={onOver} onPointerOut={onOut} onClick={onPress}>

        <RobotBody color={def.color} emissive={emissive} emissiveIntensity={emissiveIntensity} opacity={opacity} />
        <RobotAccessory variant={def.robotVariant} color={def.color} emissive={emissive} emissiveIntensity={emissiveIntensity} opacity={opacity} />

        {/* Status dot */}
        <mesh position={[0.54 * U, 1.30 * U, 0.30 * U]}>
          <sphereGeometry args={[0.07 * U, 8, 8]} />
          <meshStandardMaterial color={dotColor} emissive={dotColor} emissiveIntensity={1.5} roughness={0.1} />
        </mesh>

        {/* Glow halo billboard */}
        {(isActive || isBlocked) && (
          <Billboard position={[0, 1.4 * U, 0]}>
            <mesh>
              <planeGeometry args={[2.6 * U, 3.2 * U]} />
              <meshBasicMaterial
                color={isBlocked ? '#ef4444' : def.color}
                transparent
                opacity={0.10}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </Billboard>
        )}

        {/* Floor ring for active agents */}
        {isActive && <ActiveRing color={def.color} />}

        {/* Point lights */}
        {isActive  && <pointLight color={def.color}  intensity={4.0} distance={3.5} decay={2} position={[0, 3.5 * U, 0]} />}
        {isBlocked && <pointLight color="#ef4444"     intensity={2.5} distance={3.5} decay={2} position={[0, 3.5 * U, 0]} />}

        {/* Agent label */}
        <Html position={[0, -0.14 * U, 0]} center zIndexRange={[10, 20]}>
          <div style={{
            padding: '2px 8px', borderRadius: 99,
            border: `1px solid ${def.color}55`,
            background: `${def.color}22`,
            color: def.color,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            backdropFilter: 'blur(6px)', whiteSpace: 'nowrap',
            pointerEvents: 'none', userSelect: 'none',
          }}>
            {label}
          </div>
        </Html>

        {/* Task bubble (active only) */}
        {isActive && currentTask && (
          <Html position={[0, 3.6 * U, 0]} center zIndexRange={[30, 40]}>
            <div style={{
              maxWidth: 130, padding: '4px 8px', borderRadius: 8,
              border: `1px solid ${def.color}40`,
              background: `${def.color}18`,
              backdropFilter: 'blur(8px)', color: '#fff',
              fontSize: 9, fontWeight: 500, lineHeight: 1.3,
              textAlign: 'center', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              pointerEvents: 'none', userSelect: 'none',
            }}>
              {currentTask.length > 26 ? currentTask.slice(0, 26) + '…' : currentTask}
            </div>
          </Html>
        )}

        {/* Hover tooltip */}
        {hovered && (
          <Html position={[0.9 * U, 1.5 * U, 0]} zIndexRange={[50, 60]}>
            <div style={{
              padding: '8px 12px', borderRadius: 10,
              border: `1px solid ${def.color}35`,
              background: 'rgba(15,18,32,0.94)',
              backdropFilter: 'blur(14px)', color: '#fff',
              fontSize: 11, minWidth: 148,
              pointerEvents: 'none', userSelect: 'none',
              boxShadow: `0 0 14px ${def.color}30`,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: def.color }}>{def.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{status}</div>
              {currentTask && (
                <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.8)', fontSize: 10, lineHeight: 1.3 }}>
                  {currentTask}
                </div>
              )}
              {duration !== undefined && (
                <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>
                  {duration}m elapsed
                </div>
              )}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}
