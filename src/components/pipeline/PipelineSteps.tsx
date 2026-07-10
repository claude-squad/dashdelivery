import React from 'react'
import { clsx } from 'clsx'
import { Check, Package, Search, Cpu, Code2, FlaskConical, Truck } from 'lucide-react'
import { useActiveDemand } from '@/store/useStore'
import type { WorkflowStage } from '@/types'

const PIPELINE_GROUPS = [
  { id: 'intake', label: 'Intake', sublabel: 'Coleta de Requisitos', icon: <Package size={14} /> },
  { id: 'analysis', label: 'Análise', sublabel: 'Critérios & Prompt', icon: <Search size={14} /> },
  { id: 'planning', label: 'Planejamento', sublabel: 'Agentes & Tarefas', icon: <Cpu size={14} /> },
  { id: 'execution', label: 'Execução', sublabel: 'Agentes Trabalhando', icon: <Code2 size={14} /> },
  { id: 'testing', label: 'Testes', sublabel: 'QA & Validação', icon: <FlaskConical size={14} /> },
  { id: 'delivery', label: 'Entrega', sublabel: 'Deploy & Review', icon: <Truck size={14} /> },
]

function getGroupStatus(groupId: string, stages: WorkflowStage[] | undefined) {
  if (!stages) return 'pending'
  const group = stages.filter((s) => s.group === groupId)
  if (group.every((s) => s.status === 'done')) return 'done'
  if (group.some((s) => s.status === 'active')) return 'active'
  if (group.some((s) => s.status === 'blocked')) return 'blocked'
  return 'pending'
}

export function PipelineSteps() {
  const demand = useActiveDemand()
  const stages = demand?.workflowStages

  return (
    <div className="flex items-stretch gap-0 px-5 py-3 border-b border-border bg-surface-1/50 overflow-x-auto">
      {PIPELINE_GROUPS.map((group, idx) => {
        const status = getGroupStatus(group.id, stages)
        const isLast = idx === PIPELINE_GROUPS.length - 1

        return (
          <div key={group.id} className="flex items-center flex-1 min-w-0">
            {/* Step */}
            <div className={clsx(
              'flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all cursor-pointer',
              status === 'active' && 'bg-accent/15 border border-accent/30',
              status === 'done' && 'opacity-60 hover:opacity-80',
              status === 'pending' && 'opacity-40',
              status === 'blocked' && 'bg-red-500/10 border border-red-500/30',
            )}>
              {/* Number/icon */}
              <div className={clsx(
                'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                status === 'done' && 'bg-green-500/20 text-green-400',
                status === 'active' && 'bg-accent text-white',
                status === 'pending' && 'bg-white/10 text-white/30',
                status === 'blocked' && 'bg-red-500/20 text-red-400',
              )}>
                {status === 'done' ? <Check size={12} /> : group.icon}
              </div>
              {/* Labels */}
              <div className="min-w-0">
                <div className={clsx(
                  'text-[12px] font-semibold leading-none',
                  status === 'active' ? 'text-white' : 'text-white/70',
                )}>
                  {idx + 1}. {group.label}
                </div>
                <div className="text-[10px] text-white/35 mt-0.5 leading-none truncate">
                  {group.sublabel}
                </div>
              </div>
            </div>

            {/* Arrow */}
            {!isLast && (
              <svg className="w-5 h-5 shrink-0 text-white/15 mx-0.5" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}
