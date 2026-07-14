import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

export function PRPreviewModal() {
  const { pendingPR, closePR } = useStore()

  if (!pendingPR) return null

  const { title, body, url } = pendingPR

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-surface-1 border border-border-bright rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col gap-0 overflow-hidden"
          style={{ maxHeight: '85vh' }}
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
                <span className="text-green-400 text-base">✓</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Pull Request Gerado</div>
                <div className="text-white/40 text-xs mt-0.5 font-mono truncate max-w-xs">{title}</div>
              </div>
            </div>
            <button
              onClick={closePR}
              className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed">
              {body}
            </pre>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-accent hover:bg-accent-light transition-colors text-white text-sm font-medium py-2.5 rounded-xl"
              >
                Abrir PR no GitHub
              </a>
            ) : (
              <div className="flex-1 text-center text-xs text-white/30 bg-surface-2 py-2.5 rounded-xl border border-border">
                Configure GitHub Token nas Configurações para criar PRs reais
              </div>
            )}
            <button
              onClick={closePR}
              className="bg-surface-3 hover:bg-surface-2 transition-colors text-white/60 text-sm font-medium py-2.5 px-5 rounded-xl border border-border"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
