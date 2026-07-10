import { CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useActiveDemand } from '@/store/useStore'

function MetricCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-surface-2 border border-border rounded-xl p-4 flex flex-col gap-2', className)}>
      {children}
    </div>
  )
}

function MetricTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{children}</div>
}

// Ring progress indicator
function RingProgress({ value, size = 64, stroke = 6, color = '#7c6cf0' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="white" strokeOpacity="0.06" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
    </svg>
  )
}

export function MetricsBar() {
  const demand = useActiveDemand()
  if (!demand) return null

  const { testStats, codeQuality, elapsedTime, estimatedTotal, nextSteps, progress } = demand

  return (
    <div className="grid grid-cols-5 gap-3 shrink-0">
      {/* Progress */}
      <MetricCard>
        <MetricTitle>Progresso Geral</MetricTitle>
        <div className="flex items-center gap-3">
          <div className="relative">
            <RingProgress value={progress} size={60} stroke={5} color="#7c6cf0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-bold text-white">{progress}%</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-white/50">Em andamento</div>
            <div className="text-[10px] text-white/30 mt-1">
              Estimativa de conclusão<br />
              {demand.dueDate ? new Date(demand.dueDate).toLocaleDateString('pt-BR') : '--'}
            </div>
          </div>
        </div>
      </MetricCard>

      {/* Tests */}
      <MetricCard>
        <MetricTitle>Testes</MetricTitle>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <div className="text-[22px] font-bold text-white leading-none">{testStats.total}</div>
            <div className="text-[9px] text-white/30 mt-0.5">Testes Criados</div>
          </div>
          <div>
            <div className="text-[22px] font-bold text-green-400 leading-none">{testStats.passing}</div>
            <div className="text-[9px] text-white/30 mt-0.5">Passando</div>
          </div>
          <div>
            <div className="text-[22px] font-bold text-yellow-400 leading-none">{testStats.pending}</div>
            <div className="text-[9px] text-white/30 mt-0.5">Pendentes</div>
          </div>
          <div>
            <div className="text-[22px] font-bold text-red-400 leading-none">{testStats.failing}</div>
            <div className="text-[9px] text-white/30 mt-0.5">Falhando</div>
          </div>
        </div>
      </MetricCard>

      {/* Code Quality */}
      <MetricCard>
        <MetricTitle>Qualidade de Código</MetricTitle>
        <div className="flex items-center gap-3">
          <div className="relative">
            <RingProgress value={codeQuality.score} size={60} stroke={5} color="#22c55e" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-bold text-white">{codeQuality.score}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-green-400">
              <CheckCircle2 size={10} /> Sem Bugs Críticos
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400">
              <CheckCircle2 size={10} /> Cobertura: {codeQuality.coverage}%
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400">
              <CheckCircle2 size={10} /> Code Review: {codeQuality.codeReview}
            </div>
          </div>
        </div>
      </MetricCard>

      {/* Time */}
      <MetricCard>
        <MetricTitle>Tempo de Execução</MetricTitle>
        <div className="flex items-end gap-4">
          <div>
            <div className="text-[24px] font-bold text-white leading-none">{elapsedTime}</div>
            <div className="text-[9px] text-white/30 mt-1">Tempo Decorrido</div>
          </div>
          <div className="pb-0.5">
            <div className="text-[18px] font-semibold text-white/40 leading-none">{estimatedTotal}</div>
            <div className="text-[9px] text-white/25 mt-1">Estimativa Total</div>
          </div>
        </div>
      </MetricCard>

      {/* Next Steps */}
      <MetricCard>
        <MetricTitle>Próximos Passos</MetricTitle>
        <ul className="space-y-1.5 flex-1">
          {nextSteps.slice(0, 4).map((step, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/55 leading-snug">
              <span className="text-accent mt-0.5 shrink-0">•</span>
              {step}
            </li>
          ))}
        </ul>
        <button className="text-[11px] text-accent hover:text-accent-light transition-colors text-left">
          Ver plano completo
        </button>
      </MetricCard>
    </div>
  )
}
