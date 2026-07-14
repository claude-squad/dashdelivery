import { Monitor, Bell, ChevronDown, PlusCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore, useActiveDemand } from '@/store/useStore'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  EXECUTION: { label: 'EM ANDAMENTO', color: 'bg-[#00b894]/15 text-[#00d9a3] border-[#00b894]/30' },
  TESTING:   { label: 'EM TESTES',    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  DONE:      { label: 'CONCLUÍDO',    color: 'bg-green-500/15 text-green-300 border-green-500/30' },
  BLOCKED:   { label: 'BLOQUEADO',    color: 'bg-red-500/15 text-red-300 border-red-500/30' },
  PLANNING:  { label: 'PLANEJAMENTO', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  DRAFT:     { label: 'RASCUNHO',     color: 'bg-white/8 text-white/40 border-white/10' },
  REVIEW:    { label: 'REVISÃO',      color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  APPROVAL:  { label: 'APROVAÇÃO',    color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  ANALYSIS:  { label: 'ANÁLISE',      color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
}

export function TopBar() {
  const { isDemoMode, setDemoMode, openNewDemand } = useStore()
  const demand = useActiveDemand()
  const badge = demand ? (STATUS_BADGE[demand.status] ?? STATUS_BADGE.DRAFT) : null

  return (
    <header className="h-[58px] shrink-0 border-b border-[--c-border] bg-[--c-surface-1] flex items-center px-6 gap-6">
      {/* Left — Title + status */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div>
          <span className="text-[17px] font-bold text-white leading-none">Dashboard da Demanda</span>
        </div>
        {demand && badge && (
          <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border', badge.color)}>
            {badge.label}
          </span>
        )}
        {demand && (
          <span className="text-[11px] font-mono text-white/30">{demand.id}</span>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={openNewDemand}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-[#7c6cf0] text-white hover:bg-[#6b5ce0] transition-all shadow-sm shadow-[#7c6cf0]/25"
        >
          <PlusCircle size={13} />
          Nova Demanda
        </button>

        <button
          onClick={() => setDemoMode(!isDemoMode)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all',
            isDemoMode
              ? 'bg-accent/15 border-accent/30 text-[#a89cf5]'
              : 'bg-[--c-surface-2] border-[--c-border] text-white/40 hover:text-white/70'
          )}
        >
          <Monitor size={12} />
          Modo Apresentação
          <ChevronDown size={11} className="text-white/30" />
          {isDemoMode && <span className="w-1.5 h-1.5 rounded-full bg-[#7c6cf0] animate-pulse" />}
        </button>

        <ThemeToggle />

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7c6cf0]" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[--c-border] cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-[#7c6cf0] flex items-center justify-center text-[10px] font-bold text-white">
            PM
          </div>
          <div>
            <div className="text-[12px] font-semibold text-white leading-tight">Product Manager</div>
            <div className="text-[9px] text-white/30 leading-none">PM</div>
          </div>
          <ChevronDown size={11} className="text-white/25" />
        </div>
      </div>
    </header>
  )
}
