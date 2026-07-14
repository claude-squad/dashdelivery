import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { resolveApprovalGate } from '@/hooks/useDemandExecution'

export function ApprovalGateModal() {
  const { pendingApproval } = useStore()

  if (!pendingApproval) return null

  const { bugs } = pendingApproval

  const handleApprove = () => resolveApprovalGate(true)
  const handleSkip    = () => resolveApprovalGate(false)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-surface-1 border border-border-bright rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5"
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <span className="text-amber-400 text-lg">⚠</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Gate de Aprovação QA</div>
              <div className="text-white/50 text-xs mt-0.5">{bugs.length} issues encontrados — revisão necessária</div>
            </div>
          </div>

          <ul className="space-y-2">
            {bugs.map((bug, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70 bg-surface-2 rounded-lg px-3 py-2.5">
                <span className="text-red-400 shrink-0 mt-0.5">●</span>
                {bug}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleApprove}
              className="flex-1 bg-accent hover:bg-accent-light transition-colors text-white text-sm font-medium py-2.5 rounded-xl"
            >
              Aprovar correções
            </button>
            <button
              onClick={handleSkip}
              className="flex-1 bg-surface-3 hover:bg-surface-2 transition-colors text-white/60 text-sm font-medium py-2.5 rounded-xl border border-border"
            >
              Ignorar e prosseguir
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
