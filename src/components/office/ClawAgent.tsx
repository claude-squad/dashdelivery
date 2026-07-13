import { memo, useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { ACTIVE_STATUSES, BLOCKED_STATUSES } from './sceneConstants'
import type { AgentDefinition, AgentInstance } from '@/types'

function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return (h >>> 0) / 4294967295
}

const SKIN_TONES    = ['#fdbcb4', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#d4a574']
const HAIR_COLORS   = ['#1a0a00', '#2c1503', '#6f4e37', '#a0522d', '#c19a6b', '#4a2c17']
const TROUSER_COLORS = ['#1e293b', '#374151', '#1f2937', '#111827', '#0f172a', '#27374d']
const HAIR_STYLES   = ['short', 'parted', 'spiky', 'bun'] as const
type HairStyle = (typeof HAIR_STYLES)[number]

function resolveAppearance(agentId: string, brandColor: string) {
  const h1 = djb2(agentId)
  const h2 = djb2(agentId + '_hair')
  const h3 = djb2(agentId + '_trouser')
  return {
    skin:         SKIN_TONES[Math.floor(h1 * SKIN_TONES.length)],
    hairColor:    HAIR_COLORS[Math.floor(h2 * HAIR_COLORS.length)],
    hairStyle:    HAIR_STYLES[Math.floor(h1 * HAIR_STYLES.length)] as HairStyle,
    topColor:     brandColor,
    trouserColor: TROUSER_COLORS[Math.floor(h3 * TROUSER_COLORS.length)],
    shoeColor:    '#1a1a2e',
    hasGlasses:   h1 > 0.72,
    hasHeadset:   h2 > 0.68,
  }
}

interface ClawAgentProps {
  def:      AgentDefinition
  instance: AgentInstance
  worldX:   number
  worldZ:   number
  label:    string
  onClick:  () => void
}

const AGENT_SCALE = 2.0
const WALK_SPEED  = 0.018  // world units per frame at 60fps ≈ 1.1 wu/s

export const ClawAgent = memo(function ClawAgent({
  def, instance, worldX, worldZ, label, onClick,
}: ClawAgentProps) {

  // ── Refs ──────────────────────────────────────────────────────────────────
  const outerGroupRef  = useRef<THREE.Group>(null)
  const groupRef       = useRef<THREE.Group>(null)
  const leftArmRef     = useRef<THREE.Group>(null)
  const rightArmRef    = useRef<THREE.Group>(null)
  const leftLegRef     = useRef<THREE.Group>(null)
  const rightLegRef    = useRef<THREE.Group>(null)
  const leftEyeRef     = useRef<THREE.Mesh>(null)
  const rightEyeRef    = useRef<THREE.Mesh>(null)
  const eyeHL1Ref      = useRef<THREE.Mesh>(null)
  const eyeHL2Ref      = useRef<THREE.Mesh>(null)
  const mouthRef       = useRef<THREE.Mesh>(null)
  const dotMatRef      = useRef<THREE.MeshBasicMaterial>(null)
  const pulseRingRef   = useRef<THREE.Mesh>(null)
  const pulseMatRef    = useRef<THREE.MeshBasicMaterial>(null)
  const frameRef       = useRef(0)
  const sittingPRef    = useRef(0)   // 0 = standing, 1 = fully seated at desk

  // ── Walk state ────────────────────────────────────────────────────────────
  const currentPosRef     = useRef({ x: worldX, z: worldZ })
  const isWalkingRef      = useRef(false)
  const facingRef         = useRef(0)
  const prevWalkTargetRef = useRef<typeof instance.walkTarget>(undefined)

  useEffect(() => {
    if (!isWalkingRef.current) {
      currentPosRef.current = { x: worldX, z: worldZ }
    }
  }, [worldX, worldZ])

  // ── Derived appearance ────────────────────────────────────────────────────
  const { status, currentTask } = instance
  const isWorking = ACTIVE_STATUSES.has(status)
  const isError   = BLOCKED_STATUSES.has(status)

  const appear     = useMemo(() => resolveAppearance(def.id, def.color), [def.id, def.color])
  const agentSeed  = useMemo(() => djb2(def.id) * 90, [def.id])

  const faceTexture = useMemo(() => {
    const cv  = document.createElement('canvas')
    cv.width  = 64; cv.height = 64
    const ctx = cv.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(cv)
    ctx.fillStyle = appear.skin
    ctx.fillRect(0, 0, 64, 64)
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fillRect(0, 0, 64, 10)
    ctx.fillStyle = 'rgba(196,122,84,0.18)'
    ctx.beginPath(); ctx.arc(18, 38, 7, 0, Math.PI * 2); ctx.arc(46, 38, 7, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#d8a06e'
    ctx.fillRect(30, 28, 4, 10); ctx.fillRect(29, 37, 6, 2)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    return tex
  }, [appear.skin])

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame(() => {
    frameRef.current++
    const f = frameRef.current

    // ── MOVEMENT ──────────────────────────────────────────────────────────
    const wt    = instance.walkTarget ?? null
    const prevWt = prevWalkTargetRef.current

    const wtChanged =
      prevWt === undefined ||
      (wt === null) !== (prevWt === null) ||
      (wt !== null && prevWt !== null && (wt.x !== prevWt.x || wt.z !== prevWt.z))

    if (wtChanged) {
      prevWalkTargetRef.current = wt
      const destX = wt?.x ?? worldX
      const destZ = wt?.z ?? worldZ
      const dx = destX - currentPosRef.current.x
      const dz = destZ - currentPosRef.current.z
      if (Math.hypot(dx, dz) > 0.05) {
        facingRef.current = Math.atan2(dx, dz)
        isWalkingRef.current = true
      }
    }

    if (outerGroupRef.current) {
      const destX = wt?.x ?? worldX
      const destZ = wt?.z ?? worldZ
      const dx   = destX - currentPosRef.current.x
      const dz   = destZ - currentPosRef.current.z
      const dist  = Math.hypot(dx, dz)

      if (isWalkingRef.current) {
        if (dist > WALK_SPEED) {
          currentPosRef.current.x += (dx / dist) * WALK_SPEED
          currentPosRef.current.z += (dz / dist) * WALK_SPEED
          facingRef.current = Math.atan2(dx, dz)
        } else {
          currentPosRef.current.x = destX
          currentPosRef.current.z = destZ
          isWalkingRef.current    = false
        }
      }

      // Apply world position
      outerGroupRef.current.position.x = currentPosRef.current.x
      outerGroupRef.current.position.z = currentPosRef.current.z

      // Smooth facing direction
      let fd = facingRef.current - outerGroupRef.current.rotation.y
      while (fd >  Math.PI) fd -= 2 * Math.PI
      while (fd < -Math.PI) fd += 2 * Math.PI
      outerGroupRef.current.rotation.y += fd * 0.12
    }

    const isWalking = isWalkingRef.current
    const walkSin   = Math.sin(f * 0.14)

    // ── SITTING BLEND ────────────────────────────────────────────────────
    // isSitting = IDLE at station, no pending walk → smoothly sit down at desk
    const isSitting = !isWalking && !isWorking && !isError && instance.walkTarget === null
    const sitTarget = isSitting ? 1 : 0
    sittingPRef.current += (sitTarget - sittingPRef.current) * (sitTarget > sittingPRef.current ? 0.04 : 0.08)
    const sp = sittingPRef.current

    // ── BODY ──────────────────────────────────────────────────────────────
    if (groupRef.current) {
      const g = groupRef.current
      if (isWalking) {
        g.position.y = Math.abs(walkSin) * 0.04
        g.position.x = 0
        g.rotation.x = 0.15 * sp   // fade sit-lean as agent stands up to walk
        g.rotation.y = 0
      } else if (isWorking) {
        g.position.y = Math.abs(Math.sin(f * 0.14)) * 0.04
        g.position.x = 0
        g.rotation.x = 0
        g.rotation.y = Math.sin(f * 0.04) * 0.06
      } else if (isError) {
        g.position.y = 0
        g.position.x = Math.sin(f * 0.28) * 0.04
        g.rotation.x = 0
        g.rotation.y = 0
      } else {
        // Blend standing idle ↔ sitting at desk
        g.position.y = Math.sin(f * 0.03) * 0.01 * (1 - sp) - 0.06 * sp
        g.position.x = 0
        g.rotation.x = 0.15 * sp   // lean forward toward monitor
        g.rotation.y = Math.sin(f * 0.008) * 0.04 * (1 - sp)
      }
    }

    // ── ARMS ──────────────────────────────────────────────────────────────
    if (isWalking) {
      if (leftArmRef.current)  { leftArmRef.current.rotation.x  =  walkSin * 0.4;  leftArmRef.current.rotation.z  = -0.08 }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -walkSin * 0.4;  rightArmRef.current.rotation.z =  0.08 }
    } else {
      if (leftArmRef.current) {
        // Sitting: arm forward+down on keyboard; standing: gentle swing
        leftArmRef.current.rotation.x = isWorking
          ? -(0.28 + Math.abs(Math.sin(f * 0.18 + Math.PI)) * 0.28)
          : -0.35 * sp + Math.sin(f * 0.08) * 0.08 * (1 - sp)
        leftArmRef.current.rotation.z = isWorking ? -0.58 : (-0.22 * sp - 0.08 * (1 - sp))
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = isWorking
          ? -(0.28 + Math.abs(Math.sin(f * 0.18)) * 0.28)
          : -0.35 * sp + Math.sin(f * 0.08 + Math.PI) * 0.08 * (1 - sp)
        rightArmRef.current.rotation.z = isWorking ? 0.58 : (0.22 * sp + 0.08 * (1 - sp))
      }
    }

    // ── LEGS ──────────────────────────────────────────────────────────────
    if (isWalking) {
      if (leftLegRef.current)  leftLegRef.current.rotation.x  = -walkSin * 0.35
      if (rightLegRef.current) rightLegRef.current.rotation.x =  walkSin * 0.35
    } else {
      if (leftLegRef.current)  leftLegRef.current.rotation.x  = isWorking ?  walkSin * 0.18 : 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = isWorking ? -walkSin * 0.18 : 0
    }

    // ── EYE BLINK ────────────────────────────────────────────────────────
    const blinkPhase = (f + agentSeed) % 180
    const eyeOpen    = blinkPhase < 8 ? Math.max(0, 1 - blinkPhase / 4) : 1
    if (leftEyeRef.current)  leftEyeRef.current.scale.y  = eyeOpen
    if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeOpen
    if (eyeHL1Ref.current)   eyeHL1Ref.current.visible   = eyeOpen > 0.45
    if (eyeHL2Ref.current)   eyeHL2Ref.current.visible   = eyeOpen > 0.45

    // ── MOUTH ────────────────────────────────────────────────────────────
    if (mouthRef.current) {
      mouthRef.current.scale.x = isWalking
        ? 0.4 + (Math.sin(f * 0.14 + agentSeed * 0.07) + 1) * 0.3
        : isWorking ? 0.9 : isError ? 0.4 : 0.7
    }

    // ── STATUS DOT ───────────────────────────────────────────────────────
    if (dotMatRef.current) {
      dotMatRef.current.color.set(isError ? '#ef4444' : isWorking || isWalking ? '#22c55e' : '#f59e0b')
    }

    // ── PULSE RING ───────────────────────────────────────────────────────
    if (pulseRingRef.current && pulseMatRef.current) {
      if (isWorking || isError || isWalking) {
        const pulse = (Math.sin(f * 0.05) + 1) / 2
        pulseRingRef.current.scale.setScalar(isError ? 1.25 + pulse * 0.55 : 1.2 + pulse * 0.8)
        pulseMatRef.current.color.set(isError ? '#ef4444' : '#22c55e')
        pulseMatRef.current.opacity = isError ? 0.7 - pulse * 0.3 : 0.55 - pulse * 0.45
        pulseRingRef.current.visible = true
      } else {
        pulseRingRef.current.visible = false
      }
    }
  })

  const { skin, topColor, trouserColor, shoeColor, hairColor, hairStyle, hasGlasses, hasHeadset } = appear

  return (
    <group ref={outerGroupRef}>
      <group
        ref={groupRef}
        scale={[AGENT_SCALE, AGENT_SCALE, AGENT_SCALE]}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        {/* Ground shadow */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 12]} />
          <meshBasicMaterial color="#000" transparent opacity={0.22} />
        </mesh>

        {/* Legs */}
        <group ref={rightLegRef} position={[-0.045, 0.1, 0]}>
          <mesh><boxGeometry args={[0.07, 0.14, 0.08]} /><meshLambertMaterial color={trouserColor} /></mesh>
          <mesh position={[0, -0.09, 0]}><boxGeometry args={[0.07, 0.05, 0.12]} /><meshLambertMaterial color={shoeColor} /></mesh>
        </group>
        <group ref={leftLegRef} position={[0.045, 0.1, 0]}>
          <mesh><boxGeometry args={[0.07, 0.14, 0.08]} /><meshLambertMaterial color={trouserColor} /></mesh>
          <mesh position={[0, -0.09, 0]}><boxGeometry args={[0.07, 0.05, 0.12]} /><meshLambertMaterial color={shoeColor} /></mesh>
        </group>

        {/* Torso */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.18, 0.2, 0.1]} />
          <meshLambertMaterial color={topColor} />
        </mesh>

        {/* Arms */}
        <group ref={rightArmRef} position={[-0.12, 0.28, 0]}>
          <mesh position={[0, -0.08, 0]}><boxGeometry args={[0.06, 0.16, 0.06]} /><meshLambertMaterial color={topColor} /></mesh>
          <mesh position={[0, -0.17, 0]}><boxGeometry args={[0.05, 0.05, 0.05]} /><meshLambertMaterial color={skin} /></mesh>
        </group>
        <group ref={leftArmRef} position={[0.12, 0.28, 0]}>
          <mesh position={[0, -0.08, 0]}><boxGeometry args={[0.06, 0.16, 0.06]} /><meshLambertMaterial color={topColor} /></mesh>
          <mesh position={[0, -0.17, 0]}><boxGeometry args={[0.05, 0.05, 0.05]} /><meshLambertMaterial color={skin} /></mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.39, 0]}>
          <boxGeometry args={[0.07, 0.05, 0.07]} />
          <meshLambertMaterial color={skin} />
        </mesh>

        {/* Head — face texture on front face (material-4) */}
        <mesh position={[0, 0.47, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.14]} />
          <meshLambertMaterial attach="material-0" color={skin} />
          <meshLambertMaterial attach="material-1" color={skin} />
          <meshLambertMaterial attach="material-2" color={skin} />
          <meshLambertMaterial attach="material-3" color={skin} />
          <meshLambertMaterial attach="material-4" map={faceTexture} />
          <meshLambertMaterial attach="material-5" color={skin} />
        </mesh>

        {/* Hair */}
        {hairStyle === 'short' && (
          <mesh position={[0, 0.555, 0]}>
            <boxGeometry args={[0.17, 0.05, 0.15]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
        )}
        {hairStyle === 'parted' && (
          <>
            <mesh position={[0, 0.555, 0]}><boxGeometry args={[0.17, 0.045, 0.15]} /><meshLambertMaterial color={hairColor} /></mesh>
            <mesh position={[-0.035, 0.59, 0.01]} rotation={[0.1, 0, -0.2]}><boxGeometry args={[0.12, 0.03, 0.08]} /><meshLambertMaterial color={hairColor} /></mesh>
          </>
        )}
        {hairStyle === 'spiky' && (
          <>
            <mesh position={[0, 0.55, 0]}><boxGeometry args={[0.16, 0.035, 0.14]} /><meshLambertMaterial color={hairColor} /></mesh>
            <mesh position={[-0.05, 0.59, 0]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.04, 0.06, 0.04]} /><meshLambertMaterial color={hairColor} /></mesh>
            <mesh position={[0, 0.605, 0]}><boxGeometry args={[0.04, 0.08, 0.04]} /><meshLambertMaterial color={hairColor} /></mesh>
            <mesh position={[0.05, 0.59, 0]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.04, 0.06, 0.04]} /><meshLambertMaterial color={hairColor} /></mesh>
          </>
        )}
        {hairStyle === 'bun' && (
          <>
            <mesh position={[0, 0.548, 0]}><boxGeometry args={[0.17, 0.04, 0.15]} /><meshLambertMaterial color={hairColor} /></mesh>
            <mesh position={[0, 0.6, -0.035]}><sphereGeometry args={[0.042, 14, 14]} /><meshLambertMaterial color={hairColor} /></mesh>
          </>
        )}

        {/* Glasses */}
        {hasGlasses && (
          <>
            <mesh position={[-0.04, 0.475, 0.078]}><boxGeometry args={[0.05, 0.05, 0.01]} /><meshBasicMaterial color="#111827" wireframe /></mesh>
            <mesh position={[0.04, 0.475, 0.078]}><boxGeometry args={[0.05, 0.05, 0.01]} /><meshBasicMaterial color="#111827" wireframe /></mesh>
            <mesh position={[0, 0.475, 0.078]}><boxGeometry args={[0.02, 0.008, 0.01]} /><meshBasicMaterial color="#111827" /></mesh>
          </>
        )}

        {/* Headset */}
        {hasHeadset && (
          <>
            <mesh position={[0, 0.57, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.09, 0.008, 8, 24, Math.PI]} />
              <meshLambertMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[-0.1, 0.48, 0]}><boxGeometry args={[0.018, 0.05, 0.028]} /><meshLambertMaterial color="#475569" /></mesh>
            <mesh position={[0.1, 0.48, 0]}><boxGeometry args={[0.018, 0.05, 0.028]} /><meshLambertMaterial color="#475569" /></mesh>
            <mesh position={[0.085, 0.43, 0.06]} rotation={[0.25, 0.25, -0.4]}><boxGeometry args={[0.012, 0.06, 0.012]} /><meshLambertMaterial color="#94a3b8" /></mesh>
          </>
        )}

        {/* Eyes — refs for blink */}
        <mesh ref={leftEyeRef} position={[-0.04, 0.475, 0.072]}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
          <meshBasicMaterial color={isError ? '#dc2626' : '#1a1a2e'} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.04, 0.475, 0.072]}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
          <meshBasicMaterial color={isError ? '#dc2626' : '#1a1a2e'} />
        </mesh>
        <mesh ref={eyeHL1Ref} position={[-0.03, 0.482, 0.074]}>
          <boxGeometry args={[0.008, 0.008, 0.01]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh ref={eyeHL2Ref} position={[0.05, 0.482, 0.074]}>
          <boxGeometry args={[0.008, 0.008, 0.01]} />
          <meshBasicMaterial color="#fff" />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.04, 0.52, 0.074]} rotation={[0, 0, isError ? 0.42 : isWorking ? 0.3 : -0.18]}>
          <boxGeometry args={[0.04, 0.01, 0.01]} /><meshBasicMaterial color="#342016" />
        </mesh>
        <mesh position={[0.04, 0.52, 0.074]} rotation={[0, 0, isError ? -0.42 : isWorking ? -0.3 : 0.18]}>
          <boxGeometry args={[0.04, 0.01, 0.01]} /><meshBasicMaterial color="#342016" />
        </mesh>

        {/* Mouth — ref for animation */}
        <mesh ref={mouthRef} position={[0, 0.436, 0.074]}>
          <boxGeometry args={[0.05, 0.014, 0.01]} />
          <meshBasicMaterial color="#9c4a4a" />
        </mesh>

        {/* Status dot */}
        <mesh position={[0.355, 0.29, 0.056]}>
          <circleGeometry args={[0.052, 14]} />
          <meshBasicMaterial ref={dotMatRef} color="#f59e0b" />
        </mesh>

        {/* Pulse ring */}
        <mesh ref={pulseRingRef} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.13, 0.19, 24]} />
          <meshBasicMaterial ref={pulseMatRef} color="#22c55e" transparent opacity={0.5} depthWrite={false} />
        </mesh>

        {/* Nameplate */}
        <Billboard position={[0, 1.08, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.82, 0.24]} />
            <meshBasicMaterial color="#080c14" transparent opacity={0.92} depthWrite={false} />
          </mesh>
          <mesh position={[-0.392, 0, 0]}>
            <planeGeometry args={[0.028, 0.24]} />
            <meshBasicMaterial color={def.color} depthWrite={false} />
          </mesh>
          <Text position={[-0.02, 0, 0.001]} fontSize={0.13} color="#e8dfc0" anchorX="center" anchorY="middle" maxWidth={0.68} depthOffset={-2}>
            {label}
          </Text>
        </Billboard>

        {/* Speech bubble — active task */}
        {isWorking && currentTask && (
          <Billboard position={[0, 1.5, 0]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[2.2, 0.32]} />
              <meshBasicMaterial color="#1d2a17" transparent opacity={0.94} depthWrite={false} />
            </mesh>
            <Text position={[0, 0, 0.001]} fontSize={0.12} color="#b9f99d" anchorX="center" anchorY="middle" maxWidth={2.0} depthOffset={-2}>
              {currentTask.length > 32 ? currentTask.slice(0, 32) + '…' : currentTask}
            </Text>
          </Billboard>
        )}

        {/* Error bubble */}
        {isError && (
          <Billboard position={[0, 1.5, 0]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[0.7, 0.28]} />
              <meshBasicMaterial color="#3a1016" transparent opacity={0.97} depthWrite={false} />
            </mesh>
            <Text position={[0, 0, 0.001]} fontSize={0.13} color="#ff9aa5" anchorX="center" anchorY="middle" depthOffset={-2}>
              error
            </Text>
          </Billboard>
        )}
      </group>
    </group>
  )
})

ClawAgent.displayName = 'ClawAgent'
