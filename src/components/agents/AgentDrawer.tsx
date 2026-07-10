import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, FileText, Terminal, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'
import type { AgentStatus } from '@/types'

const STATUS_LABEL: Record<AgentStatus, string> = {
  IDLE: 'Ocioso', QUEUED: 'Na fila', STARTING: 'Iniciando', ANALYZING: 'Analisando',
  WAITING_CONTEXT: 'Aguardando contexto', PLANNING: 'Planejando', EXECUTING: 'Executando',
  RUNNING_TOOL: 'Executando ferramenta', VALIDATING: 'Validando', BLOCKED: 'Bloqueado',
  FAILED: 'Falhou', COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function AgentDrawer() {
  const { selectedAgentId, setSelectedAgent, agentDefinitions, agentInstances } = useStore()

  const def = agentDefinitions.find((d) => d.id === selectedAgentId)
  const inst = selectedAgentId ? agentInstances[selectedAgentId] : null

  return (
    <AnimatePresence>
      {selectedAgentId && def && inst && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedAgent(null)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-[380px] bg-surface-1 border-l border-border z-50 flex flex-col overflow-hidden"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold text-white"
                  style={{ background: `${def.color}25`, border: `2px solid ${def.color}50` }}
                >
                  {def.id.toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white">{def.name}</div>
                  <div className="text-[11px] text-white/40">{def.role}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Status */}
              <div className="bg-surface-2 rounded-xl p-3 space-y-2">
                <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Status Atual</div>
                <div className="flex items-center gap-2">
                  <div
                    className={clsx('w-2 h-2 rounded-full',
                      inst.status === 'EXECUTING' || inst.status === 'RUNNING_TOOL' ? 'bg-green-400 animate-pulse' :
                      inst.status === 'BLOCKED' || inst.status === 'FAILED' ? 'bg-red-400' :
                      inst.status === 'COMPLETED' ? 'bg-green-400' : 'bg-white/20'
                    )}
                  />
                  <span className="text-[13px] font-medium text-white/80">{STATUS_LABEL[inst.status]}</span>
                </div>
                <div className="text-[12px] text-white/55" style={{ color: def.color }}>{inst.currentTask}</div>
              </div>

              {/* Station */}
              <div className="bg-surface-2 rounded-xl p-3">
                <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-2">Estação</div>
                <div className="text-[12px] text-white/65">{def.station}</div>
              </div>

              {/* Duration */}
              <div className="bg-surface-2 rounded-xl p-3 flex items-center gap-3">
                <Clock size={14} className="text-white/30" />
                <div>
                  <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Duração</div>
                  <div className="text-[18px] font-bold font-mono text-white/80 mt-0.5">{formatDuration(inst.duration)}</div>
                </div>
              </div>

              {/* Files accessed */}
              {inst.filesAccessed && inst.filesAccessed.length > 0 && (
                <div className="bg-surface-2 rounded-xl p-3">
                  <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-2 flex items-center gap-1.5">
                    <FileText size={10} /> Arquivos Acessados
                  </div>
                  {inst.filesAccessed.map((f) => (
                    <div key={f} className="text-[11px] font-mono text-white/45 py-0.5 border-b border-border/40 last:border-0">{f}</div>
                  ))}
                </div>
              )}

              {/* Files changed */}
              {inst.filesChanged && inst.filesChanged.length > 0 && (
                <div className="bg-surface-2 rounded-xl p-3">
                  <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-2 flex items-center gap-1.5">
                    <FileText size={10} /> Arquivos Alterados
                  </div>
                  {inst.filesChanged.map((f) => (
                    <div key={f} className="text-[11px] font-mono text-green-400/70 py-0.5 border-b border-border/40 last:border-0">{f}</div>
                  ))}
                </div>
              )}

              {/* Tools */}
              {inst.toolsUsed && inst.toolsUsed.length > 0 && (
                <div className="bg-surface-2 rounded-xl p-3">
                  <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-2 flex items-center gap-1.5">
                    <Terminal size={10} /> Ferramentas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {inst.toolsUsed.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-white/50 border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {inst.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <AlertTriangle size={10} /> Erro
                  </div>
                  <p className="text-[11px] text-red-300/70">{inst.errorMessage}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
