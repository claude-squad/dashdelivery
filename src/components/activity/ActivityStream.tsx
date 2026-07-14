import { Code2, Settings, CheckCircle2, CheckSquare, FlaskConical, Wrench, FileText } from 'lucide-react'
import { useStore } from '@/store/useStore'

const AGENT_COLORS: Record<string, string> = {
  pm: '#7c6cf0', tl: '#3b82f6', dev: '#22c55e',
  qa: '#f59e0b', ux: '#ec4899', pe: '#8b5cf6',
  sec: '#ef4444', rel: '#14b8a6',
}

const AGENT_ABBR: Record<string, string> = {
  pm: 'PM', tl: 'TL', dev: 'DV', qa: 'QA', ux: 'UX', pe: 'PE', sec: 'SC', rel: 'RL',
}

function getEventIcon(eventType: string) {
  if (eventType.includes('task') || eventType.includes('dev.fixes') || eventType.includes('demand')) return <Code2 size={12} className="text-white/25" />
  if (eventType.includes('tool'))    return <Settings size={12} className="text-white/25" />
  if (eventType.includes('gate'))    return <CheckCircle2 size={12} className="text-green-400/50" />
  if (eventType.includes('approve')) return <CheckSquare size={12} className="text-white/25" />
  if (eventType.includes('qa'))      return <FlaskConical size={12} className="text-amber-400/50" />
  if (eventType.includes('fix'))     return <Wrench size={12} className="text-white/25" />
  return <FileText size={12} className="text-white/25" />
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

export function ActivityStream() {
  const { events, agentDefinitions } = useStore()

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'System'
    return agentDefinitions.find((d) => d.id === agentId)?.name ?? agentId
  }

  return (
    <div className="space-y-0">
      {events.slice(0, 8).map((ev) => {
        const color = ev.agentId ? (AGENT_COLORS[ev.agentId] ?? '#ffffff') : '#ffffff'
        const abbr  = ev.agentId ? (AGENT_ABBR[ev.agentId] ?? ev.agentId.substring(0, 2).toUpperCase()) : 'SY'

        return (
          <div key={ev.id} className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-0">
            {/* Timestamp */}
            <span className="text-[10px] font-mono text-white/35 shrink-0 w-10 pt-0.5">{formatTime(ev.timestamp)}</span>

            {/* Agent avatar */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5"
              style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
            >
              {abbr}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-white/75 truncate">
                {getAgentName(ev.agentId)}
              </div>
              <p className="text-[10px] text-white/40 leading-snug mt-0.5 truncate">{ev.summary}</p>
            </div>

            {/* Event type icon */}
            <div className="shrink-0 mt-0.5">
              {getEventIcon(ev.eventType)}
            </div>
          </div>
        )
      })}

      {events.length === 0 && (
        <div className="py-6 text-center text-[11px] text-white/20">
          Aguardando eventos...
        </div>
      )}
    </div>
  )
}
