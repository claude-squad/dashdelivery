import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import type { AgentStatus } from '@/types'

interface Props {
  variant: 'pm' | 'tl' | 'dev' | 'qa' | 'ux' | 'pe' | 'sec' | 'rel'
  status: AgentStatus
  label: string
  color: string
  size?: number
  currentTask?: string
  agentName?: string
  duration?: number
  onClick?: () => void
}

// Status dot color per state
const STATUS_DOT: Record<string, string> = {
  EXECUTING:    '#22c55e',
  RUNNING_TOOL: '#7c6cf0',
  ANALYZING:    '#3b82f6',
  BLOCKED:      '#ef4444',
  COMPLETED:    '#22c55e',
  QUEUED:       '#f59e0b',
  FAILED:       '#ef4444',
  IDLE:         '#4b5563',
}

// SVG robot body by variant
function RobotSVG({ variant, color, size, status }: { variant: string; color: string; size: number; status: string }) {
  const c = color
  const cx = size / 2
  const h = size

  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} fill="none">
      {/* Glow underneath */}
      <ellipse cx={cx} cy={h - 6} rx={size * 0.3} ry={4} fill={c} opacity="0.25" />
      {/* Body shadow */}
      <ellipse cx={cx} cy={h - 10} rx={size * 0.28} ry={3} fill="black" opacity="0.3" />

      {/* Legs */}
      <rect x={cx - 10} y={h - 22} width={7} height={14} rx={3} fill={c} opacity="0.7" />
      <rect x={cx + 3}  y={h - 22} width={7} height={14} rx={3} fill={c} opacity="0.7" />
      <rect x={cx - 8}  y={h - 20} width={3} height={8}  rx={1.5} fill="white" opacity="0.2" />
      <rect x={cx + 5}  y={h - 20} width={3} height={8}  rx={1.5} fill="white" opacity="0.2" />

      {/* Body */}
      <rect x={cx - 14} y={h - 44} width={28} height={24} rx={5} fill={c} />
      <rect x={cx - 14} y={h - 44} width={28} height={24} rx={5} fill="white" opacity="0.08" />
      <rect x={cx - 10} y={h - 40} width={20} height={14} rx={3} fill="black" opacity="0.25" />
      <circle cx={cx - 5} cy={h - 36} r={2} fill={c} opacity="0.9" />
      <circle cx={cx}     cy={h - 36} r={2} fill="white" opacity="0.6" />
      <circle cx={cx + 5} cy={h - 36} r={2} fill={c} opacity="0.9" />
      <rect x={cx - 8} y={h - 30} width={16} height={2} rx={1} fill="white" opacity="0.2" />

      {/* Arms */}
      <rect x={cx - 22} y={h - 42} width={9} height={18} rx={4} fill={c} opacity="0.75" />
      <rect x={cx + 13} y={h - 42} width={9} height={18} rx={4} fill={c} opacity="0.75" />
      <rect x={cx - 20} y={h - 40} width={3} height={10} rx={1.5} fill="white" opacity="0.2" />
      <rect x={cx + 17} y={h - 40} width={3} height={10} rx={1.5} fill="white" opacity="0.2" />

      {/* Neck */}
      <rect x={cx - 5} y={h - 50} width={10} height={7} rx={2} fill={c} opacity="0.6" />

      {/* Head */}
      <rect x={cx - 16} y={h - 74} width={32} height={26} rx={6} fill={c} />
      <rect x={cx - 16} y={h - 74} width={32} height={26} rx={6} fill="white" opacity="0.1" />
      <rect x={cx - 12} y={h - 72} width={24} height={4}  rx={2} fill="white" opacity="0.15" />

      {/* Eyes visor */}
      <rect x={cx - 12} y={h - 68} width={24} height={10} rx={3} fill="black" opacity="0.5" />
      <ellipse cx={cx - 5} cy={h - 63} rx={4} ry={3.5} fill={c} opacity="0.9" />
      <ellipse cx={cx + 5} cy={h - 63} rx={4} ry={3.5} fill={c} opacity="0.9" />
      <ellipse cx={cx - 4} cy={h - 64} rx={1.5} ry={1.5} fill="white" opacity="0.8" />
      <ellipse cx={cx + 6} cy={h - 64} rx={1.5} ry={1.5} fill="white" opacity="0.8" />

      {/* Mouth */}
      <rect x={cx - 8} y={h - 54} width={16} height={4} rx={2} fill="black" opacity="0.3" />
      <rect x={cx - 6} y={h - 53} width={12} height={2} rx={1} fill="white" opacity="0.15" />

      {/* Variant accessories */}
      {variant === 'pm' && (
        <>
          <line x1={cx} y1={h - 74} x2={cx} y2={h - 86} stroke={c} strokeWidth={2} />
          <rect x={cx} y={h - 88} width={8} height={5} rx={1} fill={c} opacity="0.9" />
        </>
      )}
      {variant === 'tl' && (
        <>
          <line x1={cx - 5} y1={h - 74} x2={cx - 7} y2={h - 86} stroke={c} strokeWidth={1.5} />
          <circle cx={cx - 7} cy={h - 87} r={2} fill={c} />
          <line x1={cx + 5} y1={h - 74} x2={cx + 7} y2={h - 86} stroke={c} strokeWidth={1.5} />
          <circle cx={cx + 7} cy={h - 87} r={2} fill={c} />
        </>
      )}
      {variant === 'dev' && (
        <>
          <path d={`M ${cx - 16} ${h - 68} Q ${cx - 18} ${h - 82} ${cx} ${h - 82} Q ${cx + 18} ${h - 82} ${cx + 16} ${h - 68}`} stroke={c} strokeWidth={2} fill="none" opacity="0.8" />
          <rect x={cx - 19} y={h - 70} width={5} height={7} rx={2} fill={c} opacity="0.9" />
          <rect x={cx + 14} y={h - 70} width={5} height={7} rx={2} fill={c} opacity="0.9" />
        </>
      )}
      {variant === 'qa' && (
        <>
          <circle cx={cx + 14} cy={h - 34} r={5} stroke={c} strokeWidth={1.5} fill="none" opacity="0.9" />
          <line x1={cx + 18} y1={h - 30} x2={cx + 22} y2={h - 26} stroke={c} strokeWidth={1.5} opacity="0.9" />
        </>
      )}
      {variant === 'ux' && (
        <>
          <circle cx={cx + 16} cy={h - 38} r={6} fill={c} opacity="0.3" />
          <circle cx={cx + 16} cy={h - 38} r={6} stroke={c} strokeWidth={1.5} fill="none" opacity="0.8" />
          <circle cx={cx + 14} cy={h - 40} r={1.5} fill="white" opacity="0.8" />
          <circle cx={cx + 18} cy={h - 40} r={1.5} fill="white" opacity="0.8" />
          <circle cx={cx + 16} cy={h - 36} r={1.5} fill="white" opacity="0.8" />
        </>
      )}
      {variant === 'pe' && (
        <>
          <rect x={cx + 12} y={h - 48} width={14} height={10} rx={3} fill={c} opacity="0.25" />
          <rect x={cx + 12} y={h - 48} width={14} height={10} rx={3} stroke={c} strokeWidth={1} fill="none" opacity="0.6" />
          <path d={`M ${cx + 15} ${h - 38} L ${cx + 13} ${h - 35} L ${cx + 19} ${h - 38}`} fill={c} opacity="0.6" />
          <rect x={cx + 14} y={h - 46} width={8} height={1.5} rx={0.75} fill={c} opacity="0.7" />
          <rect x={cx + 14} y={h - 43} width={5} height={1.5} rx={0.75} fill={c} opacity="0.5" />
        </>
      )}
      {(variant === 'sec' || variant === 'rel') && (
        <>
          <path
            d={`M ${cx + 13} ${h - 42} L ${cx + 20} ${h - 38} L ${cx + 20} ${h - 32} Q ${cx + 13} ${h - 28} ${cx + 13} ${h - 30} Q ${cx + 6} ${h - 28} ${cx + 6} ${h - 32} L ${cx + 6} ${h - 38} Z`}
            fill={c} opacity="0.3"
          />
          <path
            d={`M ${cx + 13} ${h - 42} L ${cx + 20} ${h - 38} L ${cx + 20} ${h - 32} Q ${cx + 13} ${h - 28} ${cx + 13} ${h - 30} Q ${cx + 6} ${h - 28} ${cx + 6} ${h - 32} L ${cx + 6} ${h - 38} Z`}
            stroke={c} strokeWidth={1.5} fill="none" opacity="0.8"
          />
        </>
      )}

      {/* Status indicator dot */}
      <circle cx={cx + 12} cy={h - 72} r={3.5} fill={STATUS_DOT[status] ?? '#4b5563'} />
    </svg>
  )
}

const STATUS_LABEL_MAP: Record<AgentStatus, string> = {
  IDLE: 'Ocioso', QUEUED: 'Na fila', STARTING: 'Iniciando',
  ANALYZING: 'Analisando', WAITING_CONTEXT: 'Aguardando contexto',
  PLANNING: 'Planejando', EXECUTING: 'Executando', RUNNING_TOOL: 'Usando ferramenta',
  VALIDATING: 'Validando', BLOCKED: 'Bloqueado', FAILED: 'Falhou',
  COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}

function formatDur(s: number) {
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function AgentRobot({ variant, status, label, color, size = 80, currentTask, agentName, duration, onClick }: Props) {
  const isActive  = status === 'EXECUTING' || status === 'RUNNING_TOOL' || status === 'ANALYZING'
  const isBlocked = status === 'BLOCKED' || status === 'FAILED'

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer group relative"
      onClick={onClick}
      whileHover="hovered"
      initial="idle"
    >
      {/* Hover tooltip card */}
      <motion.div
        variants={{
          idle:    { opacity: 0, y: 4, scale: 0.95, pointerEvents: 'none' as const },
          hovered: { opacity: 1, y: 0, scale: 1,    pointerEvents: 'auto' as const },
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-52"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))' }}
      >
        <div
          className="rounded-xl border p-3 backdrop-blur-md text-left"
          style={{ background: 'rgba(15,17,23,0.95)', borderColor: `${color}40` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: `${color}25`, border: `1.5px solid ${color}60`, color }}
            >
              {label}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-white leading-none">{agentName ?? label}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={clsx(
                  'w-1.5 h-1.5 rounded-full',
                  isActive ? 'animate-pulse bg-green-400' : isBlocked ? 'bg-red-400' : 'bg-white/25'
                )} />
                <span className="text-[10px]" style={{ color: isActive ? '#4ade80' : isBlocked ? '#f87171' : '#ffffff60' }}>
                  {STATUS_LABEL_MAP[status]}
                </span>
              </div>
            </div>
            {duration !== undefined && (
              <div className="ml-auto text-[10px] font-mono text-white/30">{formatDur(duration)}</div>
            )}
          </div>

          {currentTask && (
            <div className="text-[11px] leading-relaxed text-white/70 bg-white/5 rounded-lg px-2.5 py-2">
              {currentTask}
            </div>
          )}

          <div className="mt-2 text-[9px] text-white/25 text-center">clique para ver detalhes</div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-1.5 overflow-hidden">
          <div className="w-3 h-3 rotate-45 border-r border-b mx-auto -mt-1.5"
            style={{ background: 'rgba(15,17,23,0.95)', borderColor: `${color}40` }} />
        </div>
      </motion.div>

      {/* Task bubble — always visible above robot for active agents */}
      {currentTask && isActive && (
        <motion.div
          className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 max-w-[160px] pointer-events-none"
          variants={{
            idle:    { opacity: 1 },
            hovered: { opacity: 0 },
          }}
          animate={{ y: [0, -2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <div
            className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-white leading-snug text-center whitespace-nowrap truncate max-w-[140px] shadow-lg"
            style={{ background: `${color}20`, border: `1px solid ${color}40`, backdropFilter: 'blur(8px)' }}
            title={currentTask}
          >
            {currentTask.length > 22 ? currentTask.substring(0, 22) + '…' : currentTask}
          </div>
          <div className="flex justify-center mt-0.5">
            <span className="w-1 h-1 rounded-full" style={{ background: `${color}60` }} />
          </div>
        </motion.div>
      )}

      {/*
       * Robot body — CSS-only animations, no Framer Motion.
       * CSS keyframe animations apply instantly when the class is added to the DOM,
       * regardless of React render timing or Framer Motion lifecycle.
       */}
      <div
        className={clsx(
          'relative',
          status === 'EXECUTING'    && 'animate-bounce',
          status === 'RUNNING_TOOL' && 'animate-spin [animation-duration:1.5s]',
          status === 'ANALYZING'    && 'animate-pulse',
          status === 'QUEUED'       && 'animate-pulse opacity-70',
          status === 'COMPLETED'    && 'animate-ping [animation-iteration-count:3] [animation-duration:0.4s]',
        )}
        style={{
          // Glow drop-shadow when active — very visible even without animation
          filter: isActive
            ? `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}80)`
            : isBlocked
            ? 'drop-shadow(0 0 6px #ef4444)'
            : undefined,
        }}
      >
        {/* Ping ring — CSS animate-ping, appears/disappears instantly with class */}
        {isActive && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: color, opacity: 0.35 }}
          />
        )}
        <RobotSVG variant={variant} color={color} size={size} status={status} />
      </div>

      {/* Label badge */}
      <div
        className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border backdrop-blur-sm transition-transform group-hover:scale-105"
        style={{
          borderColor: `${color}50`,
          background:  `${color}20`,
          color,
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}
