import { memo } from 'react'
import { STATIONS_3D } from './sceneConstants'

const ROOM_W = 14
const ROOM_D = 13

// Desk at each agent station
function Desk({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Desk surface */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.04, 0.52]} />
        <meshStandardMaterial color="#a8845c" roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Desk legs */}
      {([-0.30, 0.30] as const).map((lx) =>
        ([-0.19, 0.19] as const).map((lz) => (
          <mesh key={`${lx}-${lz}`} position={[lx, 0.21, lz]}>
            <boxGeometry args={[0.04, 0.42, 0.04]} />
            <meshStandardMaterial color="#8b6c45" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* Monitor */}
      <mesh position={[0, 0.62, -0.14]}>
        <boxGeometry args={[0.36, 0.22, 0.03]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Monitor screen glow */}
      <mesh position={[0, 0.62, -0.128]}>
        <boxGeometry args={[0.30, 0.16, 0.001]} />
        <meshBasicMaterial color="#0d1f3c" />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.47, -0.14]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.445, 0.08]}>
        <boxGeometry args={[0.28, 0.008, 0.10]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.20, 0.445, 0.06]}>
        <boxGeometry args={[0.06, 0.01, 0.08]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Coffee mug */}
      <mesh position={[-0.22, 0.455, 0.04]}>
        <cylinderGeometry args={[0.03, 0.025, 0.055, 12]} />
        <meshStandardMaterial color="#6b7280" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  )
}

// Office chair behind each desk
function Chair({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z + 0.55]}>
      {/* Seat */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.38, 0.06, 0.36]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.62, -0.17]}>
        <boxGeometry args={[0.36, 0.42, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Base */}
      {([0, Math.PI / 3, (2 * Math.PI) / 3] as const).map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.16, 0.04, Math.sin(angle) * 0.16]}>
          <boxGeometry args={[0.06, 0.04, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// Decorative plant
function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Pot */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.22, 16]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Dirt */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 16]} />
        <meshStandardMaterial color="#44281a" roughness={1} metalness={0} />
      </mesh>
      {/* Leaves */}
      {([0, 1.0, 2.1, 3.2, 4.5, 5.5] as const).map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.15, 0.38 + i * 0.04, Math.sin(angle) * 0.15]}
          rotation={[Math.cos(angle) * 0.4, angle, Math.sin(angle) * 0.2]}
        >
          <boxGeometry args={[0.08, 0.22, 0.025]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#4a7c3f' : '#5a9a4a'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// Floor lamp
function Lamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.15, 0.06, 14]} />
        <meshStandardMaterial color="#374151" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 10]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.18, 0.10, 0.22, 16, 1, true]} />
        <meshStandardMaterial color="#f3d08a" roughness={0.8} side={2} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color="#fff8e1" emissive="#fff3cd" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 1.2, 0]} color="#fff3cd" intensity={0.6} distance={3.5} decay={2} />
    </group>
  )
}

// Whiteboard on north wall
function Whiteboard({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  return (
    <group position={[x, 0.6, z]} rotation={[0, rotY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.9, 0.04]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[1.28, 0.78, 0.001]} />
        <meshStandardMaterial color="#f0f4ff" roughness={1} metalness={0} />
      </mesh>
      {/* Sketch lines on board */}
      {([0.2, -0.1, -0.25] as const).map((y, i) => (
        <mesh key={i} position={[-0.2 + i * 0.2, y, 0.025]}>
          <boxGeometry args={[0.28 + i * 0.08, 0.008, 0.001]} />
          <meshBasicMaterial color={['#3b82f6', '#8b5cf6', '#10b981'][i]} />
        </mesh>
      ))}
    </group>
  )
}

// Bookshelf on west wall
function Bookshelf({ x, z }: { x: number; z: number }) {
  const bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
  return (
    <group position={[x, 0, z]}>
      {/* Frame */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.92, 1.2, 0.32]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Shelves */}
      {[0.15, 0.45, 0.75].map((y, si) => (
        <mesh key={si} position={[0, y, 0]}>
          <boxGeometry args={[0.86, 0.06, 0.28]} />
          <meshStandardMaterial color="#a16207" roughness={0.75} />
        </mesh>
      ))}
      {/* Books */}
      {bookColors.map((color, i) => {
        const shelf = Math.floor(i / 3)
        const col = i % 3
        return (
          <mesh key={i} position={[-0.28 + col * 0.14, 0.15 + shelf * 0.3 + 0.08, 0]}>
            <boxGeometry args={[0.1, 0.18, 0.22]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

export const OfficeRoom = memo(function OfficeRoom() {
  const stations = Object.values(STATIONS_3D)

  return (
    <group>
      {/* === FLOOR === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D, 14, 10]} />
        <meshLambertMaterial color="#c8a97e" />
      </mesh>
      {/* Wood grain lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const z = -ROOM_D / 2 + (i + 1) * (ROOM_D / 12)
        return (
          <mesh key={i} position={[0, 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROOM_W, 0.009]} />
            <meshBasicMaterial color="#a07850" transparent opacity={0.22} />
          </mesh>
        )
      })}

      {/* === WALLS === */}
      {/* North */}
      <mesh position={[0, 0.5, -ROOM_D / 2]} receiveShadow>
        <boxGeometry args={[ROOM_W, 1, 0.12]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.4} roughness={0.9} />
      </mesh>
      {/* South */}
      <mesh position={[0, 0.5, ROOM_D / 2]} receiveShadow>
        <boxGeometry args={[ROOM_W, 1, 0.12]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.4} roughness={0.9} />
      </mesh>
      {/* West */}
      <mesh position={[-ROOM_W / 2, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 1, ROOM_D]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.4} roughness={0.9} />
      </mesh>
      {/* East */}
      <mesh position={[ROOM_W / 2, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 1, ROOM_D]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.4} roughness={0.9} />
      </mesh>

      {/* Baseboards */}
      <mesh position={[0, 0.03, -ROOM_D / 2 + 0.06]}>
        <boxGeometry args={[ROOM_W, 0.06, 0.04]} />
        <meshLambertMaterial color="#0c0c10" />
      </mesh>
      <mesh position={[0, 0.03, ROOM_D / 2 - 0.06]}>
        <boxGeometry args={[ROOM_W, 0.06, 0.04]} />
        <meshLambertMaterial color="#0c0c10" />
      </mesh>
      <mesh position={[-ROOM_W / 2 + 0.06, 0.03, 0]}>
        <boxGeometry args={[0.04, 0.06, ROOM_D]} />
        <meshLambertMaterial color="#0c0c10" />
      </mesh>
      <mesh position={[ROOM_W / 2 - 0.06, 0.03, 0]}>
        <boxGeometry args={[0.04, 0.06, ROOM_D]} />
        <meshLambertMaterial color="#0c0c10" />
      </mesh>

      {/* === DESKS + CHAIRS per station ===
          Desk is offset northward (-z) so the agent stands in front of it.
          Chair is slightly south (+z) of the agent — they "sit" toward the desk. */}
      {stations.map((st) => (
        <group key={st.label}>
          <Desk x={st.x} z={st.z - 0.52} />
          <Chair x={st.x} z={st.z + 0.28} />
        </group>
      ))}

      {/* === DECORATION === */}
      {/* Plants in corners */}
      <Plant x={-ROOM_W / 2 + 0.55} z={-ROOM_D / 2 + 0.55} />
      <Plant x={ ROOM_W / 2 - 0.55} z={-ROOM_D / 2 + 0.55} />
      <Plant x={-ROOM_W / 2 + 0.55} z={ ROOM_D / 2 - 0.55} />
      <Plant x={ ROOM_W / 2 - 0.55} z={ ROOM_D / 2 - 0.55} />

      {/* Floor lamps */}
      <Lamp x={-4.5} z={-4.5} />
      <Lamp x={ 4.5} z={-4.5} />
      <Lamp x={-4.5} z={ 3.5} />
      <Lamp x={ 4.5} z={ 3.5} />

      {/* Whiteboard on north wall */}
      <Whiteboard x={0} z={-ROOM_D / 2 + 0.1} rotY={0} />

      {/* Bookshelf on west wall */}
      <Bookshelf x={-ROOM_W / 2 + 0.3} z={-0.5} />

      {/* Round meeting table in center-ish area */}
      <mesh position={[0, 0.38, 1.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 24]} />
        <meshStandardMaterial color="#a8845c" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.19, 1.8]}>
        <cylinderGeometry args={[0.06, 0.08, 0.38, 12]} />
        <meshStandardMaterial color="#8b6c45" roughness={0.8} />
      </mesh>

      {/* Ceiling light fixtures (decorative) */}
      {[-3, 0, 3].flatMap((x) =>
        [-3, 1].map((z) => (
          <group key={`ceil-${x}-${z}`} position={[x, 0.95, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.18, 0.06, 14, 1, true]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.9} side={2} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.08, 0.02, 0.08]} />
              <meshStandardMaterial color="#c0c0c0" roughness={0.5} metalness={0.5} />
            </mesh>
            <pointLight color="#f0f8ff" intensity={0.35} distance={4} decay={2} />
          </group>
        ))
      )}
    </group>
  )
})
