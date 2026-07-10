import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useStore } from '@/store/useStore'

const AGENT_COLORS: Record<string, string> = {
  pm: '#7c6cf0', tl: '#3b82f6', dev: '#22c55e',
  qa: '#f59e0b', ux: '#ec4899', pe: '#8b5cf6',
  sec: '#ef4444', rel: '#14b8a6',
}

const AGENT_ABBR: Record<string, string> = {
  pm: 'PM', tl: 'TL', dev: 'DV', qa: 'QA', ux: 'UX', pe: 'PE', sec: 'SC', rel: 'RL',
}

const EVENT_ICON: Record<string, string> = {
  'agent.task_completed': '✓',
  'agent.task_started': '▶',
  'agent.blocked': '⚠',
  'agent.failed': '✗',
  'tool.completed': '⚙',
  'quality_gate.passed': '⊛',
  'approval.approved': '✦',
}

export function ActivityStream() {
  const { events, agentDefinitions } = useStore()

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'System'
    const def = agentDefinitions.find((d) => d.id === agentId)
    return def?.name ?? agentId
  }

  return (
    <div className="space-y-1.5 overflow-y-auto">
      {events.slice(0, 8).map((ev) => {
        const color = ev.agentId ? (AGENT_COLORS[ev.agentId] ?? '#ffffff') : '#ffffff'
        const abbr = ev.agentId ? (AGENT_ABBR[ev.agentId] ?? ev.agentId.substring(0, 2).toUpperCase()) : 'SY'
        const icon = EVENT_ICON[ev.eventType] ?? '·'
        const timeAgo = formatDistanceToNow(new Date(ev.timestamp), { locale: ptBR, addSuffix: true })

        return (
          <div key={ev.id} className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0">
            {/* Agent avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
              style={{ background: `${color}25`, border: `1px solid ${color}50`, color }}
            >
              {abbr}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[12px] font-medium text-white/80">{getAgentName(ev.agentId)}</span>
                  <span className="ml-1.5 text-[10px] text-white/30">{icon}</span>
                </div>
                <span className="text-[10px] text-white/25 shrink-0 whitespace-nowrap">{timeAgo}</span>
              </div>
              <p className="text-[11px] text-white/55 leading-snug mt-0.5 truncate">{ev.summary}</p>
            </div>
          </div>
        )
      })}

      <button className="text-[11px] text-accent hover:text-accent-light transition-colors py-1 w-full text-center">
        Ver todas as atividades
      </button>
    </div>
  )
}
