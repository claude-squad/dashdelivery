import { CheckCircle, Circle, Loader2, AlertCircle, XCircle, Clock } from 'lucide-react'
import type { SquadStep, StepStatus } from '@/types/squad'
import { SQUAD_AGENTS } from '@/types/squad'

function StatusIcon({ status }: { status: StepStatus }) {
  const cls = 'shrink-0'
  if (status === 'concluido' || status === 'concluido_com_alerta')
    return <CheckCircle size={14} className={`${cls} text-green-400`} />
  if (status === 'em_execucao')
    return <Loader2 size={14} className={`${cls} text-[#7c6cf0] animate-spin`} />
  if (status === 'em_analise')
    return <Loader2 size={14} className={`${cls} text-cyan-400 animate-spin`} />
  if (status === 'aguardando_aprovacao')
    return <Clock size={14} className={`${cls} text-amber-400`} />
  if (status === 'falhou')
    return <XCircle size={14} className={`${cls} text-red-400`} />
  if (status === 'cancelado')
    return <XCircle size={14} className={`${cls} text-white/30`} />
  return <Circle size={14} className={`${cls} text-white/15`} />
}

function statusColor(status: StepStatus): string {
  if (status === 'concluido' || status === 'concluido_com_alerta') return 'text-green-400'
  if (status === 'em_execucao') return 'text-[#7c6cf0]'
  if (status === 'em_analise') return 'text-cyan-400'
  if (status === 'aguardando_aprovacao') return 'text-amber-400'
  if (status === 'falhou') return 'text-red-400'
  if (status === 'cancelado') return 'text-white/30'
  return 'text-white/25'
}

function fmtMs(ms?: number) {
  if (!ms) return ''
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

interface Props {
  steps: SquadStep[]
  compact?: boolean
}

export function ExecutionStepper({ steps, compact = false }: Props) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, idx) => {
        const isActive = step.status === 'em_execucao' || step.status === 'em_analise'
        const isDone = step.status === 'concluido' || step.status === 'concluido_com_alerta'
        const agent = SQUAD_AGENTS.find(a => a.id === step.agentId)

        return (
          <div key={step.id} className="flex gap-3">
            {/* connector line */}
            <div className="flex flex-col items-center">
              <div className="mt-1">
                <StatusIcon status={step.status} />
              </div>
              {idx < steps.length - 1 && (
                <div
                  className="w-px flex-1 my-1"
                  style={{
                    background: isDone
                      ? 'rgba(34,197,94,0.25)'
                      : isActive
                      ? 'rgba(124,108,240,0.3)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}
            </div>

            {/* content */}
            <div className={`flex-1 min-w-0 ${compact ? 'pb-2' : 'pb-3'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold ${statusColor(step.status)}`}>
                  {step.label}
                </span>
                {agent && (
                  <span className="text-[9px] text-white/25">
                    {agent.icon} {agent.name}
                  </span>
                )}
                {step.durationMs && (
                  <span className="text-[9px] text-white/20 ml-auto">{fmtMs(step.durationMs)}</span>
                )}
                {step.status === 'aguardando_aprovacao' && (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                    aguardando aprovação
                  </span>
                )}
              </div>

              {!compact && isActive && step.currentActivity && (
                <p className="text-[10px] text-white/30 mt-0.5 truncate">{step.currentActivity}</p>
              )}

              {!compact && step.errors.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {step.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <AlertCircle size={10} className="text-red-400 shrink-0" />
                      <span className="text-[10px] text-red-300/70">{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
