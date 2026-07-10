import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'
import type { AgentStatus } from '@/types'

const STATUS_DOT: Record<AgentStatus, string> = {
  IDLE: 'bg-white/20',
  QUEUED: 'bg-blue-400 animate-pulse',
  STARTING: 'bg-yellow-400',
  ANALYZING: 'bg-blue-400 animate-pulse',
  WAITING_CONTEXT: 'bg-yellow-400',
  PLANNING: 'bg-accent animate-pulse',
  EXECUTING: 'bg-green-400 animate-pulse',
  RUNNING_TOOL: 'bg-accent animate-pulse',
  VALIDATING: 'bg-cyan-400',
  BLOCKED: 'bg-red-400 animate-pulse',
  FAILED: 'bg-red-500',
  COMPLETED: 'bg-green-400',
  CANCELLED: 'bg-white/20',
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  IDLE: 'Ocioso',
  QUEUED: 'Na fila',
  STARTING: 'Iniciando',
  ANALYZING: 'Analisando',
  WAITING_CONTEXT: 'Aguardando',
  PLANNING: 'Planejando',
  EXECUTING: 'Executando',
  RUNNING_TOOL: 'Executando',
  VALIDATING: 'Validando',
  BLOCKED: 'Bloqueado',
  FAILED: 'Falhou',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function AgentList() {
  const { agentDefinitions, agentInstances, setSelectedAgent, selectedAgentId } = useStore()

  const activeAgents = agentDefinitions.filter(
    (d) => agentInstances[d.id]?.status !== 'IDLE'
  )

  return (
    <div className="flex flex-col gap-1">
      {activeAgents.map((def) => {
        const inst = agentInstances[def.id]
        if (!inst) return null
        const isSelected = selectedAgentId === def.id

        return (
          <button
            key={def.id}
            onClick={() => setSelectedAgent(isSelected ? null : def.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
              isSelected ? 'bg-accent/15 border border-accent/30' : 'hover:bg-white/5 border border-transparent',
            )}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: `${def.color}30`, border: `1.5px solid ${def.color}60` }}
            >
              {def.name.substring(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-white/90 truncate">{def.name}</span>
                <span
                  className={clsx('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[inst.status])}
                />
              </div>
              <div className="text-[10px] text-white/35 truncate">{def.role}</div>
              <div className="text-[11px] text-white/55 truncate mt-0.5" style={{ color: def.color }}>
                {inst.currentTask}
              </div>
            </div>

            {/* Duration */}
            <div className="shrink-0 text-right">
              <div className="text-[11px] font-mono text-white/40">
                {formatDuration(inst.duration)}
              </div>
            </div>
          </button>
        )
      })}

      <button className="mt-1 text-[11px] text-accent hover:text-accent-light transition-colors py-1 text-center">
        Ver todos os agentes
      </button>
    </div>
  )
}
