import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'

export function GateExecutionBar() {
  const gateExecution = useStore((s) => s.gateExecution)
  const setGateExecution = useStore((s) => s.setGateExecution)
  const setSelectedDemand = useStore((s) => s.setSelectedDemand)

  // Auto-hide 4s após conclusão
  useEffect(() => {
    if (
      gateExecution !== null &&
      !gateExecution.isRunning &&
      gateExecution.completed === gateExecution.total
    ) {
      const timer = setTimeout(() => {
        setGateExecution(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [gateExecution, setGateExecution])

  if (gateExecution === null) return null

  const { isRunning, demandId, demandTitle, currentGateName, completed, total, failed } = gateExecution
  const isDone = !isRunning && completed === total
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const passed = completed - failed

  function handleViewDemand() {
    setSelectedDemand(demandId)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="gate-execution-bar"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[52px] items-center gap-4 border-t border-[#7c6cf0]/30 bg-[#1a1830] px-6"
      >
        {/* Ícone de status */}
        <span className="shrink-0">
          {isDone ? (
            failed > 0 ? (
              <XCircle size={18} className="text-red-400" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-400" />
            )
          ) : (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'flex' }}
            >
              <Loader2 size={18} className="text-violet-400" />
            </motion.span>
          )}
        </span>

        {/* Mensagem principal */}
        {isDone ? (
          <span className="shrink-0 text-sm font-semibold text-white/90">
            Quality Gates concluídos
          </span>
        ) : (
          <span className="max-w-[200px] shrink-0 truncate text-sm font-semibold text-white/90">
            {demandTitle}
          </span>
        )}

        {/* Gate atual ou contagem de resultado */}
        <span className="min-w-0 flex-1 truncate text-xs text-white/50">
          {isDone
            ? `${passed} passaram · ${failed} falharam`
            : currentGateName
              ? `Executando: ${currentGateName}`
              : 'Preparando gates…'}
        </span>

        {/* Progresso numérico + barra — só durante execução */}
        {!isDone && (
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs font-medium text-white/40">
              {completed}/{total} gates
            </span>
            <div className="h-1.5 w-[100px] overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Botão de ação */}
        <button
          onClick={handleViewDemand}
          className="ml-2 flex shrink-0 items-center gap-1 rounded-md border border-[#7c6cf0]/40 bg-[#7c6cf0]/10 px-3 py-1 text-xs font-semibold text-violet-300 transition hover:bg-[#7c6cf0]/20"
        >
          {isDone ? 'Ver Resultado' : 'Ver Demanda'}
          <ChevronRight size={13} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
