import { Check, Clock, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useActiveDemand, useStore } from '@/store/useStore'

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-surface-2 border border-border rounded-xl p-4 flex flex-col gap-3', className)}>
      <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">{title}</div>
      {children}
    </div>
  )
}

export function DemandSummaryCard() {
  const demand = useActiveDemand()
  const { setSelectedDemand } = useStore()
  if (!demand) return null

  const PRIORITY_COLOR = { HIGH: 'text-red-400', CRITICAL: 'text-red-500', MEDIUM: 'text-yellow-400', LOW: 'text-green-400' }

  return (
    <Card title="Resumo da Demanda">
      <p className="text-[12px] text-white/65 leading-relaxed flex-1">{demand.description}</p>
      <div className="space-y-1.5 pt-1 border-t border-border">
        <div className="flex gap-1.5 text-[11px]">
          <span className="text-white/35">Solicitado por:</span>
          <span className="text-white/70 font-medium">{demand.requestedBy}</span>
        </div>
        <div className="flex gap-1.5 text-[11px]">
          <span className="text-white/35">Prioridade:</span>
          <span className={clsx('font-semibold flex items-center gap-1', PRIORITY_COLOR[demand.priority])}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {demand.priority}
          </span>
        </div>
        <div className="flex gap-1.5 text-[11px]">
          <span className="text-white/35">Criado em:</span>
          <span className="text-white/50 font-mono">
            {new Date(demand.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <button
        onClick={() => setSelectedDemand(demand.id)}
        className="w-full mt-1 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-[11px] font-medium text-accent-light hover:bg-accent/20 transition-all flex items-center justify-center gap-1"
      >
        <ChevronRight size={11} />
        Ver detalhes completos
      </button>
    </Card>
  )
}

export function AcceptanceCriteriaCard() {
  const demand = useActiveDemand()
  if (!demand) return null

  const STATUS_ICON = {
    passed: <Check size={11} className="text-green-400" />,
    failed: <span className="text-red-400 text-[11px]">✗</span>,
    pending: <span className="text-white/20 text-[11px]">○</span>,
  }

  return (
    <Card title="Critérios de Aceite">
      <div className="space-y-2 flex-1">
        {demand.acceptanceCriteria.map((ac) => (
          <div key={ac.id} className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0">{STATUS_ICON[ac.status]}</div>
            <span className={clsx(
              'text-[12px] leading-snug',
              ac.status === 'passed' ? 'text-white/70' : ac.status === 'failed' ? 'text-red-300/70' : 'text-white/40',
            )}>
              {ac.description}
            </span>
          </div>
        ))}
      </div>
      <button className="text-[11px] text-accent hover:text-accent-light transition-colors text-left flex items-center gap-1">
        Ver todos os critérios ({demand.acceptanceCriteria.length * 3})
        <ChevronRight size={11} />
      </button>
    </Card>
  )
}

export function PromptEngineerCard() {
  const demand = useActiveDemand()
  if (!demand) return null

  return (
    <Card title="Engenheiro de Prompt">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#8b5cf620] border border-[#8b5cf650] flex items-center justify-center text-[12px] font-bold text-[#8b5cf6]">
          PE
        </div>
        <div>
          <div className="text-[12px] font-semibold text-white/80">Prompt Engineer</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] text-green-400">Concluído</span>
          </div>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3 flex-1">
        <div className="text-[10px] text-white/30 mb-1.5 font-medium">Prompt Gerado:</div>
        <p className="text-[11px] text-white/55 leading-relaxed line-clamp-4 font-mono">
          {demand.generatedPrompt}
        </p>
      </div>

      <button className="text-[11px] text-accent hover:text-accent-light transition-colors text-left flex items-center gap-1">
        Ver prompt completo <ChevronRight size={11} />
      </button>
    </Card>
  )
}

export function ExecutionPlanCard() {
  const demand = useActiveDemand()
  if (!demand) return null

  const passed = demand.qualityGates.filter((g) => g.status === 'passed').length
  const total = demand.qualityGates.length

  return (
    <Card title="Plano de Execução (PE)">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-[11px] font-semibold text-green-400">Planejamento Concluído</span>
      </div>

      <div>
        <div className="text-[10px] text-white/35 mb-2">Agentes Envolvidos: {demand.assignedAgents.length}</div>
        <div className="flex gap-1.5">
          {demand.assignedAgents.slice(0, 6).map((id) => (
            <div
              key={id}
              className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[9px] font-bold text-accent-light"
            >
              {id.toUpperCase().substring(0, 2)}
            </div>
          ))}
        </div>
      </div>

      {/* Quality gates mini */}
      <div className="space-y-1.5">
        {demand.qualityGates.slice(0, 4).map((gate) => (
          <div key={gate.id} className="flex items-center gap-2">
            <div className={clsx(
              'w-1.5 h-1.5 rounded-full',
              gate.status === 'passed' ? 'bg-green-400' :
              gate.status === 'running' ? 'bg-accent animate-pulse' :
              gate.status === 'failed' ? 'bg-red-400' : 'bg-white/15',
            )} />
            <span className="text-[11px] text-white/50">{gate.name}</span>
          </div>
        ))}
        {demand.qualityGates.length > 4 && (
          <div className="text-[10px] text-white/25">+{demand.qualityGates.length - 4} gates</div>
        )}
      </div>

      <button className="w-full mt-1 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-[11px] font-medium text-accent-light hover:bg-accent/20 transition-all">
        Ver detalhes do plano
      </button>
    </Card>
  )
}
