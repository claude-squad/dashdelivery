import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Settings, X, Webhook, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { webhookUrl, setWebhookUrl } = useStore()
  const [url, setUrl] = useState(webhookUrl)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80) }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function save() {
    setWebhookUrl(url.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = 'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7c6cf0]/60 focus:ring-1 focus:ring-[#7c6cf0]/30 transition-all font-mono text-xs'
  const labelClass = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

  return (
    <>
      <motion.div
        key="settings-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="settings-panel"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg bg-surface-2 border border-border rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <Settings size={16} className="text-white/40" />
            <span className="text-sm font-semibold text-white flex-1">Configurações</span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Webhook */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Webhook size={13} className="text-white/30" />
                <span className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Integração Backend</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Webhook URL</label>
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                    placeholder="https://n8n.seudominio.com/webhook/demanda"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-white/25 mt-1.5 leading-relaxed">
                    Quando uma demanda é criada, o payload JSON é enviado via POST para este endpoint.
                    Compatible com n8n, Zapier, Make, ou qualquer API REST.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Status Update Endpoint (para n8n → Dashboard)</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg">
                    <code className="text-xs text-white/50 font-mono flex-1 truncate">
                      POST {window.location.origin}/api/status-update
                    </code>
                  </div>
                  <p className="text-[10px] text-white/25 mt-1.5 leading-relaxed">
                    Use este endpoint no n8n para enviar atualizações de status de volta ao dashboard.
                    Body: {'{ "demandId", "agentId", "status", "progress", "summary" }'}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Info */}
            <div className="text-[11px] text-white/25 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                Webhook ativo: {url.trim() ? <span className="text-green-400/80 font-mono truncate">{url.trim()}</span> : <span className="italic">não configurado</span>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 border border-border transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#7c6cf0] text-white hover:bg-[#6b5ce0] transition-all"
            >
              {saved ? <Check size={13} /> : null}
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function SettingsButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
        title="Configurações"
      >
        <Settings size={15} />
      </button>
      <AnimatePresence>
        {open && <SettingsPanel key="panel" onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
