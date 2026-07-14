import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { AgentStatus } from '@/types'

const STATUS_DOT: Record<AgentStatus, string> = {
  IDLE:            'bg-white/20',
  QUEUED:          'bg-blue-400 animate-pulse',
  STARTING:        'bg-yellow-400',
  ANALYZING:       'bg-blue-400 animate-pulse',
  WAITING_CONTEXT: 'bg-yellow-400',
  PLANNING:        'bg-[#7c6cf0] animate-pulse',
  EXECUTING:       'bg-green-400 animate-pulse',
  RUNNING_TOOL:    'bg-[#7c6cf0] animate-pulse',
  VALIDATING:      'bg-cyan-400',
  BLOCKED:         'bg-red-400 animate-pulse',
  FAILED:          'bg-red-500',
  COMPLETED:       'bg-green-400',
  CANCELLED:       'bg-white/20',
}

export function AgentList() {
  const { agentDefinitions, agentInstances, setSelectedAgent, selectedAgentId } = useStore()

  const activeAgents = agentDefinitions.filter(
    (d) => agentInstances[d.id]?.status !== 'IDLE'
  )

  return (
    <div className="flex flex-col">
      {activeAgents.map((def) => {
        const inst = agentInstances[def.id]
        if (!inst) return null
        const isSelected = selectedAgentId === def.id

        return (
          <button
            key={def.id}
            onClick={() => setSelectedAgent(isSelected ? null : def.id)}
            className={clsx(
              'w-full flex items-start gap-3 px-2 py-2.5 rounded-lg text-left transition-all',
              isSelected
                ? 'bg-[#7c6cf0]/10 border border-[#7c6cf0]/25'
                : 'hover:bg-white/4 border border-transparent',
            )}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5"
              style={{ background: `${def.color}25`, border: `1.5px solid ${def.color}50` }}
            >
              {def.name.substring(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[12px] font-semibold text-white/90 truncate">{def.name}</span>
                <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[inst.status])} />
              </div>
              <div className="text-[10px] text-white/30 truncate mb-1">{def.role}</div>
              {inst.currentTask && (
                <div className="flex items-start gap-1 text-[10px] leading-snug">
                  <span className="shrink-0 mt-px" style={{ color: def.color }}>•</span>
                  <span className="truncate text-white/45">{inst.currentTask}</span>
                </div>
              )}
            </div>
          </button>
        )
      })}

      {activeAgents.length === 0 && (
        <div className="py-6 text-center text-[11px] text-white/20">
          Aguardando demanda...
        </div>
      )}

      <button className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#7c6cf0] hover:text-[#9d91f5] transition-colors py-1.5 w-full">
        Ver todos os agentes
        <ArrowRight size={11} />
      </button>
    </div>
  )
}
