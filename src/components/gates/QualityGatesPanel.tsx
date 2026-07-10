import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ShieldAlert,
  Circle,
  Play,
  PlayCircle,
} from 'lucide-react'
import { clsx } from 'clsx'
import type { QualityGate } from '@/types'

interface QualityGatesPanelProps {
  gates: QualityGate[]
  onRerun: (gateId: string) => void
  onRunAll: () => void
}

interface StatusConfig {
  icon: React.ReactNode
  badgeLabel: string
  badgeClass: string
  rowClass: string
  iconClass: string
}

function getStatusConfig(status: QualityGate['status']): StatusConfig {
  switch (status) {
    case 'passed':
      return {
        icon: <CheckCircle2 size={18} />,
        badgeLabel: 'PASSOU',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        rowClass: 'border-emerald-500/20',
        iconClass: 'text-emerald-400',
      }
    case 'running':
      return {
        icon: (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex' }}
          >
            <Loader2 size={18} />
          </motion.span>
        ),
        badgeLabel: 'EXECUTANDO',
        badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
        rowClass: 'border-violet-500/30',
        iconClass: 'text-violet-400',
      }
    case 'failed':
      return {
        icon: <XCircle size={18} />,
        badgeLabel: 'FALHOU',
        badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
        rowClass: 'border-red-500/20',
        iconClass: 'text-red-400',
      }
    case 'blocked':
      return {
        icon: <ShieldAlert size={18} />,
        badgeLabel: 'BLOQUEADO',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        rowClass: 'border-amber-500/20',
        iconClass: 'text-amber-400',
      }
    case 'pending':
    default:
      return {
        icon: <Circle size={18} />,
        badgeLabel: 'PENDENTE',
        badgeClass: 'bg-white/5 text-white/40 border-white/10',
        rowClass: 'border-white/10',
        iconClass: 'text-white/20',
      }
  }
}

function GateRow({
  gate,
  onRerun,
}: {
  gate: QualityGate
  onRerun: (id: string) => void
}) {
  const cfg = getStatusConfig(gate.status)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={clsx(
        'rounded-lg border bg-white/[0.02] px-4 py-3',
        cfg.rowClass,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <span className={clsx('shrink-0', cfg.iconClass)}>{cfg.icon}</span>

        {/* Name + mandatory badge */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-white/90">
            {gate.name}
          </span>
          {gate.mandatory && (
            <span className="shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              obrigatório
            </span>
          )}
        </div>

        {/* Status badge */}
        <span
          className={clsx(
            'shrink-0 rounded border px-2 py-0.5 text-[11px] font-bold tracking-wider',
            cfg.badgeClass,
            gate.status === 'running' && 'animate-pulse',
          )}
        >
          {cfg.badgeLabel}
        </span>

        {/* Re-run button */}
        {gate.status !== 'running' && (
          <button
            onClick={() => onRerun(gate.id)}
            className="ml-1 shrink-0 rounded p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white/70"
            title="Re-executar gate"
          >
            <Play size={13} />
          </button>
        )}
      </div>

      {/* Result row — only on failed */}
      <AnimatePresence>
        {gate.status === 'failed' && gate.result && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden pl-7 text-xs text-red-400/80"
          >
            {gate.result}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function QualityGatesPanel({
  gates,
  onRerun,
  onRunAll,
}: QualityGatesPanelProps) {
  const passed = gates.filter((g) => g.status === 'passed').length
  const total = gates.length
  const progressPct = total === 0 ? 0 : Math.round((passed / total) * 100)

  const runnableGates = gates.filter(
    (g) => g.status === 'pending' || g.status === 'failed',
  )
  const allRunning = gates.every((g) => g.status === 'running')
  const allPassed = total > 0 && passed === total

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-white/80">Quality Gates</h3>
          <span className="text-xs text-white/40">
            {passed}/{total} gates passaram
          </span>
        </div>

        <button
          onClick={onRunAll}
          disabled={allRunning || runnableGates.length === 0}
          className={clsx(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
            allRunning || runnableGates.length === 0
              ? 'cursor-not-allowed border-white/10 text-white/20'
              : 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
          )}
        >
          <PlayCircle size={14} />
          Executar Todos os Gates
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={clsx(
            'h-full rounded-full transition-colors',
            allPassed ? 'bg-emerald-500' : 'bg-violet-500',
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Gate list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {gates.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center text-sm text-white/30"
            >
              Nenhum quality gate configurado.
            </motion.p>
          ) : (
            gates.map((gate) => (
              <GateRow key={gate.id} gate={gate} onRerun={onRerun} />
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
