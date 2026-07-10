import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { AgentRobot } from './AgentRobot'

// Isometric station positions in the virtual office
const STATIONS: Record<string, { x: number; y: number; label: string }> = {
  pm:  { x: 38, y: 20,  label: 'PM' },
  tl:  { x: 62, y: 22,  label: 'TL' },
  dev: { x: 72, y: 42,  label: 'DEV' },
  qa:  { x: 60, y: 62,  label: 'QA' },
  ux:  { x: 30, y: 58,  label: 'UX' },
  pe:  { x: 46, y: 72,  label: 'PE' },
  sec: { x: 18, y: 40,  label: 'SEC' },
  rel: { x: 82, y: 62,  label: 'REL' },
}

function IsometricBackground() {
  const W = 600
  const H = 380
  const tileW = 60
  const tileH = 30

  const tiles: React.ReactNode[] = []

  for (let row = -2; row < 8; row++) {
    for (let col = -2; col < 12; col++) {
      const x = (col - row) * (tileW / 2) + W / 2
      const y = (col + row) * (tileH / 2) + 60

      if (x < -tileW || x > W + tileW || y < -tileH || y > H + tileH) continue

      const isCenter = row >= 2 && row <= 5 && col >= 3 && col <= 8
      const opacity = isCenter ? 0.12 : 0.05

      tiles.push(
        <polygon
          key={`${row}-${col}`}
          points={`${x},${y} ${x + tileW / 2},${y + tileH / 2} ${x},${y + tileH} ${x - tileW / 2},${y + tileH / 2}`}
          fill={isCenter ? '#7c6cf0' : '#ffffff'}
          fillOpacity={opacity}
          stroke="#7c6cf0"
          strokeOpacity={isCenter ? 0.15 : 0.06}
          strokeWidth={0.5}
        />
      )
    }
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {tiles}
      <ellipse cx={W / 2} cy={H / 2 + 20} rx={120} ry={40} fill="#7c6cf0" fillOpacity="0.08" />
      <ellipse cx={W / 2} cy={H / 2 + 20} rx={80} ry={25} fill="#7c6cf0" fillOpacity="0.12" />
      <circle cx={W / 2} cy={H / 2 + 10} r={18} fill="#7c6cf0" fillOpacity="0.15" />
      <circle cx={W / 2} cy={H / 2 + 10} r={12} fill="#7c6cf0" fillOpacity="0.2" />
      {Object.entries(STATIONS).map(([id, pos]) => (
        <line
          key={id}
          x1={`${50}%`} y1={`${54}%`}
          x2={`${pos.x}%`} y2={`${pos.y + 5}%`}
          stroke="#7c6cf0" strokeOpacity="0.08" strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}
    </svg>
  )
}

export function AgentOffice() {
  const { agentInstances, agentDefinitions, setSelectedAgent, isDemoMode } = useStore()

  return (
    /*
     * Outer: rounded border only — NO overflow-hidden so tooltips can escape the container.
     * Background clips itself independently via its own overflow-hidden.
     */
    <div className="relative w-full h-full min-h-[300px] rounded-xl border border-border">

      {/* Background: self-contained clip — doesn't touch robots or tooltips */}
      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-surface-2 via-[#151a2e] to-[#0f1220]">
        <IsometricBackground />
      </div>

      {isDemoMode && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 bg-accent/20 border border-accent/30 rounded-full text-[9px] font-bold tracking-widest text-accent-light uppercase pointer-events-none">
          DEMO MODE — EXECUÇÃO SIMULADA
        </div>
      )}

      {/* Robots — each agent is a plain div for CSS centering + inner motion.div for entry anim.
          Keeping them separate avoids Framer Motion overriding the CSS translate(-50%,-50%). */}
      {agentDefinitions.map((def) => {
        const instance = agentInstances[def.id]
        if (!instance) return null

        const pos = STATIONS[def.id]
        if (!pos) return null

        const isActive = instance.status === 'EXECUTING' || instance.status === 'RUNNING_TOOL'

        return (
          // Outer: CSS centering only — no Framer Motion, no transform conflict
          <div
            key={def.id}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isActive ? 20 : 5,
            }}
          >
            {/* Inner: entry fade+scale — transform-origin center, no positional conflict */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: agentDefinitions.indexOf(def) * 0.08 }}
              style={{ transformOrigin: 'center center' }}
            >
              <AgentRobot
                variant={def.robotVariant}
                status={instance.status}
                label={pos.label}
                color={def.color}
                size={72}
                currentTask={instance.currentTask}
                agentName={def.name}
                duration={instance.duration}
                onClick={() => setSelectedAgent(def.id)}
              />
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
