import { memo } from 'react'
import { Text } from '@react-three/drei'
import { STATIONS_3D } from './sceneConstants'

const ROOM_W = 14
const ROOM_D = 13

// Meeting table center
const TABLE_X = 0
const TABLE_Z = 1.8

function Desk({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.04, 0.52]} />
        <meshStandardMaterial color="#a8845c" roughness={0.75} metalness={0.05} />
      </mesh>
      {([-0.30, 0.30] as const).map((lx) =>
        ([-0.19, 0.19] as const).map((lz) => (
          <mesh key={`${lx}-${lz}`} position={[lx, 0.21, lz]}>
            <boxGeometry args={[0.04, 0.42, 0.04]} />
            <meshStandardMaterial color="#8b6c45" roughness={0.8} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.62, -0.14]}>
        <boxGeometry args={[0.36, 0.22, 0.03]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.62, -0.128]}>
        <boxGeometry args={[0.30, 0.16, 0.001]} />
        <meshBasicMaterial color="#0d1f3c" />
      </mesh>
      <mesh position={[0, 0.47, -0.14]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.445, 0.08]}>
        <boxGeometry args={[0.28, 0.008, 0.10]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh position={[0.20, 0.445, 0.06]}>
        <boxGeometry args={[0.06, 0.01, 0.08]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-0.22, 0.455, 0.04]}>
        <cylinderGeometry args={[0.03, 0.025, 0.055, 12]} />
        <meshStandardMaterial color="#6b7280" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  )
}

function Chair({ x, z, rotY = 0 }: { x: number; z: number; rotY?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.38, 0.06, 0.36]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.62, -0.17]}>
        <boxGeometry args={[0.36, 0.42, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
      </mesh>
      {([0, Math.PI / 3, (2 * Math.PI) / 3] as const).map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.16, 0.04, Math.sin(angle) * 0.16]}>
          <boxGeometry args={[0.06, 0.04, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.22, 16]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 16]} />
        <meshStandardMaterial color="#44281a" roughness={1} metalness={0} />
      </mesh>
      {([0, 1.0, 2.1, 3.2, 4.5, 5.5] as const).map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.15, 0.38 + i * 0.04, Math.sin(angle) * 0.15]}
          rotation={[Math.cos(angle) * 0.4, angle, Math.sin(angle) * 0.2]}>
          <boxGeometry args={[0.08, 0.22, 0.025]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#4a7c3f' : '#5a9a4a'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh><cylinderGeometry args={[0.12, 0.15, 0.06, 14]} /><meshStandardMaterial color="#374151" roughness={0.7} metalness={0.5} /></mesh>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.02, 0.02, 1.2, 10]} /><meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.8} /></mesh>
      <mesh position={[0, 1.22, 0]}><cylinderGeometry args={[0.18, 0.10, 0.22, 16, 1, true]} /><meshStandardMaterial color="#f3d08a" roughness={0.8} side={2} /></mesh>
      <mesh position={[0, 1.22, 0]}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color="#fff8e1" emissive="#fff3cd" emissiveIntensity={1.2} /></mesh>
      <pointLight position={[0, 1.2, 0]} color="#fff3cd" intensity={0.6} distance={3.5} decay={2} />
    </group>
  )
}

function Whiteboard({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  return (
    <group position={[x, 0.6, z]} rotation={[0, rotY, 0]}>
      <mesh castShadow><boxGeometry args={[1.4, 0.9, 0.04]} /><meshStandardMaterial color="#374151" roughness={0.6} metalness={0.3} /></mesh>
      <mesh position={[0, 0, 0.022]}><boxGeometry args={[1.28, 0.78, 0.001]} /><meshStandardMaterial color="#f0f4ff" roughness={1} metalness={0} /></mesh>
      {([0.2, -0.1, -0.25] as const).map((y, i) => (
        <mesh key={i} position={[-0.2 + i * 0.2, y, 0.025]}>
          <boxGeometry args={[0.28 + i * 0.08, 0.008, 0.001]} />
          <meshBasicMaterial color={(['#3b82f6', '#8b5cf6', '#10b981'] as const)[i]} />
        </mesh>
      ))}
    </group>
  )
}

function Bookshelf({ x, z }: { x: number; z: number }) {
  const bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.92, 1.2, 0.32]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} metalness={0.05} />
      </mesh>
      {[0.15, 0.45, 0.75].map((y, si) => (
        <mesh key={si} position={[0, y, 0]}>
          <boxGeometry args={[0.86, 0.06, 0.28]} />
          <meshStandardMaterial color="#a16207" roughness={0.75} />
        </mesh>
      ))}
      {bookColors.map((color, i) => {
        const shelf = Math.floor(i / 3)
        const col   = i % 3
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

// Framed wall art
function FramedPicture({ x, y, z, rotY, w, h, artColors }: {
  x: number; y: number; z: number; rotY: number; w: number; h: number; artColors: string[]
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.028]} />
        <meshStandardMaterial color="#1c1008" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[w - 0.06, h - 0.06, 0.001]} />
        <meshBasicMaterial color={artColors[0]} />
      </mesh>
      {/* Art blocks */}
      {artColors.slice(1).map((color, i) => (
        <mesh key={i} position={[
          (i % 2 === 0 ? 0.1 : -0.1) * (w - 0.08),
          (i < 2 ? 0.12 : -0.12) * (h - 0.08),
          0.016,
        ]}>
          <boxGeometry args={[(w - 0.08) * 0.38, (h - 0.08) * 0.38, 0.001]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
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

      {/* Wood grain — 18 lines */}
      {Array.from({ length: 18 }).map((_, i) => {
        const z = -ROOM_D / 2 + (i + 1) * (ROOM_D / 18)
        return (
          <mesh key={i} position={[0, 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROOM_W, 0.009]} />
            <meshBasicMaterial color="#a07850" transparent opacity={0.28} />
          </mesh>
        )
      })}

      {/* Floor rug under meeting table — covers table + all 4 meeting chairs */}
      <mesh position={[TABLE_X, 0.002, TABLE_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 3.2]} />
        <meshLambertMaterial color="#7c4f3b" transparent opacity={0.72} />
      </mesh>

      {/* === WALLS === */}
      {/* North */}
      <mesh position={[0, 0.5, -ROOM_D / 2]} receiveShadow>
        <boxGeometry args={[ROOM_W, 1, 0.12]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>
      {/* South */}
      <mesh position={[0, 0.5, ROOM_D / 2]} receiveShadow>
        <boxGeometry args={[ROOM_W, 1, 0.12]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>
      {/* West */}
      <mesh position={[-ROOM_W / 2, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 1, ROOM_D]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>
      {/* East */}
      <mesh position={[ROOM_W / 2, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 1, ROOM_D]} />
        <meshStandardMaterial color="#8d6e63" emissive="#4e342e" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>

      {/* === WALL WAINSCOTING + CROWN MOLDING === */}
      {/* North wall */}
      <mesh position={[0, 0.165, -ROOM_D / 2 + 0.065]}>
        <boxGeometry args={[ROOM_W - 0.24, 0.33, 0.002]} />
        <meshStandardMaterial color="#5a3525" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.93, -ROOM_D / 2 + 0.065]}>
        <boxGeometry args={[ROOM_W - 0.24, 0.04, 0.025]} />
        <meshStandardMaterial color="#4a2a1a" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* South wall */}
      <mesh position={[0, 0.165, ROOM_D / 2 - 0.065]}>
        <boxGeometry args={[ROOM_W - 0.24, 0.33, 0.002]} />
        <meshStandardMaterial color="#5a3525" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.93, ROOM_D / 2 - 0.065]}>
        <boxGeometry args={[ROOM_W - 0.24, 0.04, 0.025]} />
        <meshStandardMaterial color="#4a2a1a" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* West wall */}
      <mesh position={[-ROOM_W / 2 + 0.065, 0.165, 0]}>
        <boxGeometry args={[0.002, 0.33, ROOM_D - 0.24]} />
        <meshStandardMaterial color="#5a3525" roughness={0.85} />
      </mesh>
      <mesh position={[-ROOM_W / 2 + 0.065, 0.93, 0]}>
        <boxGeometry args={[0.025, 0.04, ROOM_D - 0.24]} />
        <meshStandardMaterial color="#4a2a1a" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* East wall */}
      <mesh position={[ROOM_W / 2 - 0.065, 0.165, 0]}>
        <boxGeometry args={[0.002, 0.33, ROOM_D - 0.24]} />
        <meshStandardMaterial color="#5a3525" roughness={0.85} />
      </mesh>
      <mesh position={[ROOM_W / 2 - 0.065, 0.93, 0]}>
        <boxGeometry args={[0.025, 0.04, ROOM_D - 0.24]} />
        <meshStandardMaterial color="#4a2a1a" roughness={0.7} metalness={0.08} />
      </mesh>

      {/* Window on east wall — daylight bleed */}
      <mesh position={[ROOM_W / 2 - 0.07, 0.64, -1.5]}>
        <boxGeometry args={[0.04, 0.42, 0.72]} />
        <meshBasicMaterial color="#b8d4f0" transparent opacity={0.35} />
      </mesh>
      <pointLight position={[ROOM_W / 2 - 0.4, 0.7, -1.5]} color="#c8e8ff" intensity={0.28} distance={3} decay={2} />

      {/* Baseboards */}
      <mesh position={[0, 0.03, -ROOM_D / 2 + 0.06]}><boxGeometry args={[ROOM_W, 0.06, 0.04]} /><meshLambertMaterial color="#0c0c10" /></mesh>
      <mesh position={[0, 0.03, ROOM_D / 2 - 0.06]}><boxGeometry args={[ROOM_W, 0.06, 0.04]} /><meshLambertMaterial color="#0c0c10" /></mesh>
      <mesh position={[-ROOM_W / 2 + 0.06, 0.03, 0]}><boxGeometry args={[0.04, 0.06, ROOM_D]} /><meshLambertMaterial color="#0c0c10" /></mesh>
      <mesh position={[ROOM_W / 2 - 0.06, 0.03, 0]}><boxGeometry args={[0.04, 0.06, ROOM_D]} /><meshLambertMaterial color="#0c0c10" /></mesh>

      {/* === WALL ART === */}
      {/* North wall — two pieces */}
      <FramedPicture x={-2.5} y={0.66} z={-ROOM_D / 2 + 0.08} rotY={0} w={0.56} h={0.40}
        artColors={['#0d1117', '#7c3aed', '#2563eb', '#0891b2']} />
      <FramedPicture x={2.5} y={0.66} z={-ROOM_D / 2 + 0.08} rotY={0} w={0.52} h={0.38}
        artColors={['#1a0a00', '#c2410c', '#d97706', '#b45309']} />
      {/* South wall — one piece */}
      <FramedPicture x={-2.0} y={0.66} z={ROOM_D / 2 - 0.08} rotY={Math.PI} w={0.60} h={0.42}
        artColors={['#042f2e', '#0f766e', '#14b8a6', '#5eead4']} />

      {/* === DESKS + CHAIRS per station === */}
      {stations.map((st) => (
        <group key={st.label}>
          <Desk x={st.x} z={st.z - 0.52} />
          <Chair x={st.x} z={st.z + 0.28} />
        </group>
      ))}

      {/* === MEETING TABLE === */}
      {/* Table surface */}
      <mesh position={[TABLE_X, 0.38, TABLE_Z]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 24]} />
        <meshStandardMaterial color="#a8845c" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Table leg */}
      <mesh position={[TABLE_X, 0.19, TABLE_Z]}>
        <cylinderGeometry args={[0.06, 0.08, 0.38, 12]} />
        <meshStandardMaterial color="#8b6c45" roughness={0.8} />
      </mesh>
      {/* Meeting chairs — 4 cardinal positions */}
      <Chair x={TABLE_X}         z={TABLE_Z - 1.0} rotY={Math.PI} />
      <Chair x={TABLE_X}         z={TABLE_Z + 1.0} rotY={0} />
      <Chair x={TABLE_X - 1.0}   z={TABLE_Z}       rotY={Math.PI / 2} />
      <Chair x={TABLE_X + 1.0}   z={TABLE_Z}       rotY={-Math.PI / 2} />

      {/* === MEETING TABLE PENDANT LAMP === */}
      <group position={[TABLE_X, 0.97, TABLE_Z]}>
        {/* Cord */}
        <mesh position={[0, 0.23, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.46, 6]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
        </mesh>
        {/* Shade — open-bottom cone, visible from below */}
        <mesh>
          <cylinderGeometry args={[0.28, 0.14, 0.22, 18, 1, true]} />
          <meshStandardMaterial color="#c2410c" roughness={0.88} side={2} />
        </mesh>
        {/* Outer shade shell */}
        <mesh>
          <cylinderGeometry args={[0.29, 0.15, 0.22, 18, 1, true]} />
          <meshStandardMaterial color="#9a2f08" roughness={0.9} />
        </mesh>
        {/* Glowing bulb */}
        <mesh>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#fff8e1" emissive="#fffbeb" emissiveIntensity={2.5} />
        </mesh>
        <pointLight color="#fff0cc" intensity={1.4} distance={5.5} decay={2} />
      </group>

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

      {/* Whiteboard — north wall */}
      <Whiteboard x={0} z={-ROOM_D / 2 + 0.1} rotY={0} />

      {/* BRQ corporate sign — mounted above whiteboard */}
      <group position={[0, 1.08, -ROOM_D / 2 + 0.13]}>
        {/* Backing panel — dark navy */}
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.28, 0.022]} />
          <meshStandardMaterial color="#0b1940" roughness={0.4} metalness={0.35} emissive="#0b1940" emissiveIntensity={0.18} />
        </mesh>
        {/* Top accent line */}
        <mesh position={[0, 0.128, 0.012]}>
          <boxGeometry args={[2.16, 0.007, 0.001]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        {/* Bottom accent line */}
        <mesh position={[0, -0.128, 0.012]}>
          <boxGeometry args={[2.16, 0.007, 0.001]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        {/* BRQ text */}
        <Text position={[-0.52, 0.01, 0.014]} fontSize={0.165} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.05}>
          BRQ
        </Text>
        {/* Vertical divider */}
        <mesh position={[-0.08, 0, 0.013]}>
          <boxGeometry args={[0.007, 0.18, 0.001]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        {/* Digital Solutions text */}
        <Text position={[0.55, 0.01, 0.014]} fontSize={0.063} color="#93c5fd" anchorX="center" anchorY="middle" maxWidth={1.0} lineHeight={1.35}>
          {'Digital\nSolutions'}
        </Text>
        {/* Subtle glow */}
        <pointLight color="#4488ff" intensity={0.12} distance={1.5} decay={2} />
      </group>

      {/* Bookshelves — west + east walls */}
      <Bookshelf x={-ROOM_W / 2 + 0.3} z={-0.5} />
      <Bookshelf x={ ROOM_W / 2 - 0.3} z={-1.5} />

      {/* === CEILING LIGHTS === */}
      {[-3, 0, 3].flatMap((x) =>
        [-3, 1].map((z) => (
          <group key={`ceil-${x}-${z}`} position={[x, 0.95, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.18, 0.06, 14, 1, true]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.9} side={2} />
            </mesh>
            <mesh><boxGeometry args={[0.08, 0.02, 0.08]} /><meshStandardMaterial color="#c0c0c0" roughness={0.5} metalness={0.5} /></mesh>
            <pointLight color="#f0f8ff" intensity={0.5} distance={4.5} decay={2} />
          </group>
        ))
      )}
    </group>
  )
})
