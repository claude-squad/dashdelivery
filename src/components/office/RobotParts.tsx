import { U } from './sceneConstants'

interface MatProps {
  color: string
  emissive: string
  emissiveIntensity: number
  opacity: number
}

function BodyMat({ color, emissive, emissiveIntensity, opacity }: MatProps) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.35}
      metalness={0.55}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity * 0.3}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}

function GlowMat({ color, emissive, emissiveIntensity, opacity }: MatProps) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.1}
      metalness={0.8}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}

export interface RobotProps {
  color: string
  emissive: string
  emissiveIntensity: number
  opacity: number
}

export function RobotBody({ color, emissive, emissiveIntensity, opacity }: RobotProps) {
  const b = { color, emissive, emissiveIntensity, opacity }
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.9 * U, 0]} castShadow>
        <boxGeometry args={[1.2 * U, 1.0 * U, 1.0 * U]} />
        <BodyMat {...b} />
      </mesh>

      {/* Visor */}
      <mesh position={[0, 2.05 * U, 0.47 * U]}>
        <boxGeometry args={[1.0 * U, 0.35 * U, 0.12 * U]} />
        <GlowMat {...b} />
      </mesh>

      {/* Eyes */}
      {([-0.22, 0.22] as const).map((x) => (
        <mesh key={x} position={[x * U, 2.08 * U, 0.55 * U]}>
          <sphereGeometry args={[0.10 * U, 8, 8]} />
          <GlowMat {...b} emissiveIntensity={emissiveIntensity * 1.3} />
        </mesh>
      ))}

      {/* Neck */}
      <mesh position={[0, 1.44 * U, 0]} castShadow>
        <cylinderGeometry args={[0.12 * U, 0.14 * U, 0.22 * U, 8]} />
        <BodyMat {...b} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.88 * U, 0]} castShadow>
        <boxGeometry args={[1.0 * U, 1.0 * U, 0.7 * U]} />
        <BodyMat {...b} />
      </mesh>

      {/* Chest panel */}
      <mesh position={[0, 0.92 * U, 0.36 * U]}>
        <boxGeometry args={[0.7 * U, 0.4 * U, 0.08 * U]} />
        <GlowMat {...b} emissiveIntensity={emissiveIntensity * 0.7} />
      </mesh>

      {/* Arms */}
      {([-0.65, 0.65] as const).map((x) => (
        <mesh key={x} position={[x * U, 0.82 * U, 0]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]} castShadow>
          <cylinderGeometry args={[0.12 * U, 0.10 * U, 0.85 * U, 8]} />
          <BodyMat {...b} />
        </mesh>
      ))}

      {/* Legs */}
      {([-0.22, 0.22] as const).map((x) => (
        <mesh key={x} position={[x * U, 0.10 * U, 0]} castShadow>
          <boxGeometry args={[0.28 * U, 0.70 * U, 0.28 * U]} />
          <BodyMat {...b} />
        </mesh>
      ))}

      {/* Feet */}
      {([-0.22, 0.22] as const).map((x) => (
        <mesh key={x} position={[x * U, -0.25 * U, 0.06 * U]} castShadow>
          <boxGeometry args={[0.32 * U, 0.14 * U, 0.42 * U]} />
          <BodyMat {...b} />
        </mesh>
      ))}
    </group>
  )
}

export function RobotAccessory({ variant, ...b }: RobotProps & { variant: string }) {
  switch (variant) {
    case 'pm':
      return (
        <group>
          <mesh position={[0, 2.55 * U, 0]}>
            <cylinderGeometry args={[0.025 * U, 0.025 * U, 0.4 * U, 6]} />
            <BodyMat {...b} />
          </mesh>
          <mesh position={[0, 2.77 * U, 0]}>
            <sphereGeometry args={[0.07 * U, 8, 8]} />
            <GlowMat {...b} />
          </mesh>
        </group>
      )

    case 'tl':
      return (
        <group>
          {([-0.20, 0.20] as const).map((x) => (
            <group key={x}>
              <mesh position={[x * U, 2.55 * U, 0]}>
                <cylinderGeometry args={[0.025 * U, 0.025 * U, 0.4 * U, 6]} />
                <BodyMat {...b} />
              </mesh>
              <mesh position={[x * U, 2.77 * U, 0]}>
                <sphereGeometry args={[0.07 * U, 8, 8]} />
                <GlowMat {...b} />
              </mesh>
            </group>
          ))}
        </group>
      )

    case 'dev':
      return (
        <group>
          <mesh position={[0, 2.4 * U, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.5 * U, 0.04 * U, 8, 24, Math.PI]} />
            <BodyMat {...b} />
          </mesh>
          {([-0.54, 0.54] as const).map((x) => (
            <mesh key={x} position={[x * U, 2.1 * U, 0]}>
              <cylinderGeometry args={[0.09 * U, 0.09 * U, 0.12 * U, 8]} />
              <BodyMat {...b} />
            </mesh>
          ))}
        </group>
      )

    case 'qa':
      return (
        <group>
          <mesh position={[0.75 * U, 0.45 * U, 0.3 * U]}>
            <torusGeometry args={[0.22 * U, 0.03 * U, 8, 24]} />
            <BodyMat {...b} />
          </mesh>
          <mesh position={[0.75 * U, 0.18 * U, 0.3 * U]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.025 * U, 0.025 * U, 0.28 * U, 6]} />
            <BodyMat {...b} />
          </mesh>
        </group>
      )

    case 'ux':
      return (
        <mesh position={[-0.75 * U, 0.60 * U, 0.3 * U]}>
          <boxGeometry args={[0.28 * U, 0.20 * U, 0.18 * U]} />
          <BodyMat {...b} />
        </mesh>
      )

    case 'pe':
      return (
        <mesh position={[0, 0.88 * U, 0.42 * U]} rotation={[0.26, 0, 0]}>
          <boxGeometry args={[0.35 * U, 0.28 * U, 0.04 * U]} />
          <GlowMat {...b} emissiveIntensity={b.emissiveIntensity * 0.6} />
        </mesh>
      )

    case 'sec':
      return (
        <mesh position={[0.80 * U, 0.55 * U, 0.25 * U]}>
          <boxGeometry args={[0.22 * U, 0.30 * U, 0.06 * U]} />
          <BodyMat {...b} />
        </mesh>
      )

    case 'rel':
      return (
        <group>
          <mesh position={[0.80 * U, 0.55 * U, 0.25 * U]}>
            <boxGeometry args={[0.22 * U, 0.30 * U, 0.06 * U]} />
            <BodyMat {...b} />
          </mesh>
          <mesh position={[0, 2.55 * U, 0]}>
            <cylinderGeometry args={[0.05 * U, 0.08 * U, 0.30 * U, 6]} />
            <BodyMat {...b} />
          </mesh>
        </group>
      )

    default:
      return null
  }
}
