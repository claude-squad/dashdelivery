import { Monitor, Bell, ChevronDown, PlusCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore, useActiveDemand } from '@/store/useStore'

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'text-red-400',
  CRITICAL: 'text-red-500',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-green-400',
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  EXECUTION: { label: 'EM ANDAMENTO', color: 'bg-accent/20 text-accent-light border-accent/30' },
  TESTING: { label: 'EM TESTES', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  DONE: { label: 'CONCLUÍDO', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  BLOCKED: { label: 'BLOQUEADO', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  PLANNING: { label: 'PLANEJAMENTO', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  DRAFT: { label: 'RASCUNHO', color: 'bg-white/10 text-white/50 border-white/10' },
}

export function TopBar() {
  const { isDemoMode, setDemoMode, openNewDemand } = useStore()
  const demand = useActiveDemand()
  const badge = demand ? (STATUS_BADGE[demand.status] ?? STATUS_BADGE.DRAFT) : null

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface-1 flex items-center px-5 gap-4">
      {/* Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div>
          <span className="text-sm font-semibold text-white">Dashboard da Demanda</span>
          {demand && (
            <span className="ml-2 text-xs text-white/30 font-mono">{demand.id}</span>
          )}
        </div>
        {demand && badge && (
          <span className={clsx('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', badge.color)}>
            {badge.label}
          </span>
        )}
        {demand && (
          <h1 className="text-sm font-medium text-white/80 truncate">{demand.title}</h1>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Nova Demanda */}
        <button
          onClick={openNewDemand}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7c6cf0] text-white hover:bg-[#6b5ce0] transition-all"
        >
          <PlusCircle size={13} />
          Nova Demanda
        </button>

        {/* Demo mode toggle */}
        <button
          onClick={() => setDemoMode(!isDemoMode)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            isDemoMode
              ? 'bg-accent/20 border-accent/40 text-accent-light'
              : 'bg-surface-2 border-border text-white/50 hover:text-white/80'
          )}
        >
          <Monitor size={13} />
          Modo Apresentação
          {isDemoMode && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
        </button>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-white">
            PM
          </div>
          <div className="text-right">
            <div className="text-[12px] font-medium text-white leading-none">Product Manager</div>
            <div className="text-[10px] text-white/40 mt-0.5 leading-none">PM</div>
          </div>
          <ChevronDown size={13} className="text-white/30" />
        </div>
      </div>
    </header>
  )
}
