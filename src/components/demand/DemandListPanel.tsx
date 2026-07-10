import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ChevronRight, Clock, Search, X } from 'lucide-react'
import { useStore } from '@/store/useStore'

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  DRAFT:     { label: 'Rascunho',      dot: 'bg-white/20' },
  PLANNING:  { label: 'Planejamento',  dot: 'bg-blue-400' },
  EXECUTION: { label: 'Em andamento',  dot: 'bg-accent animate-pulse' },
  TESTING:   { label: 'Em testes',     dot: 'bg-yellow-400' },
  BLOCKED:   { label: 'Bloqueado',     dot: 'bg-red-400' },
  DONE:      { label: 'Concluído',     dot: 'bg-green-400' },
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW:      'text-green-400',
  MEDIUM:   'text-yellow-400',
  HIGH:     'text-red-400',
  CRITICAL: 'text-red-500',
}

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
const STATUS_OPTIONS = ['DRAFT', 'PLANNING', 'EXECUTION', 'TESTING', 'BLOCKED', 'DONE'] as const

const selectClass =
  'h-7 rounded-md border border-border bg-surface px-2 text-xs text-white/60 focus:outline-none focus:border-white/20 hover:border-white/20 transition-colors cursor-pointer appearance-none pr-6 bg-no-repeat'

export function DemandListPanel() {
  const { demands, setSelectedDemand } = useStore()

  const [search, setSearch]           = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus]     = useState('')

  const hasActiveFilter = search !== '' || filterPriority !== '' || filterStatus !== ''

  const filtered = useMemo(() => {
    return demands.filter((d) => {
      const matchesSearch   = search === '' || d.title.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = filterPriority === '' || d.priority === filterPriority
      const matchesStatus   = filterStatus === '' || d.status === filterStatus
      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [demands, search, filterPriority, filterStatus])

  function clearFilters() {
    setSearch('')
    setFilterPriority('')
    setFilterStatus('')
  }

  if (demands.length === 0) return null

  return (
    <div className="bg-surface-2 border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
          Todas as Demandas
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 font-mono">
          {hasActiveFilter ? (
            <>{filtered.length} de {demands.length}</>
          ) : (
            demands.length
          )}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar demanda..."
            className="h-7 w-full rounded-md border border-border bg-surface pl-6 pr-2 text-xs text-white/70 placeholder:text-white/25 focus:outline-none focus:border-white/20 hover:border-white/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={clsx(selectClass, filterPriority && 'border-white/20 text-white/80')}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 6px center' }}
          >
            <option value="">Prioridade</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={clsx(selectClass, filterStatus && 'border-white/20 text-white/80')}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 6px center' }}
          >
            <option value="">Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="h-7 flex items-center gap-1 px-2 rounded-md border border-white/10 bg-white/5 text-[11px] text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
          >
            <X size={10} />
            Limpar
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-6 text-center text-xs text-white/25">
          Nenhuma demanda encontrada
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((demand) => {
            const cfg = STATUS_CONFIG[demand.status] ?? STATUS_CONFIG.DRAFT
            return (
              <button
                key={demand.id}
                onClick={() => setSelectedDemand(demand.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-white/5 border border-transparent hover:border-border transition-all text-left group"
              >
                <span className={clsx('w-2 h-2 rounded-full shrink-0', cfg.dot)} />

                <span className="flex-1 text-[13px] font-medium text-white/75 group-hover:text-white truncate transition-colors">
                  {demand.title}
                </span>

                <span className={clsx('text-[11px] font-semibold shrink-0', PRIORITY_COLOR[demand.priority])}>
                  {demand.priority}
                </span>

                <span className="text-[11px] text-white/35 shrink-0 hidden sm:block w-28 text-right">
                  {cfg.label}
                </span>

                <span className="text-[10px] text-white/25 font-mono shrink-0 hidden md:flex items-center gap-1">
                  <Clock size={9} />
                  {new Date(demand.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>

                <div className="w-16 shrink-0 hidden lg:block">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${demand.progress}%` }}
                    />
                  </div>
                </div>

                <ChevronRight size={13} className="shrink-0 text-white/20 group-hover:text-white/50 transition-colors" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
