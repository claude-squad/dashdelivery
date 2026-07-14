import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusCircle, X, Loader2, Upload, FileText, Settings } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Demand, Priority, DemandType, QualityGate, AcceptanceCriterion, WorkflowStage } from '@/types'

const DEFAULT_GATES: QualityGate[] = [
  { id: 'qg-lint',     name: 'Lint',             status: 'pending', mandatory: true,  agentId: 'dev' },
  { id: 'qg-types',    name: 'Type Check',       status: 'pending', mandatory: true,  agentId: 'dev' },
  { id: 'qg-unit',     name: 'Unit Tests',       status: 'pending', mandatory: true,  agentId: 'qa'  },
  { id: 'qg-int',      name: 'Integration',      status: 'pending', mandatory: false, agentId: 'qa'  },
  { id: 'qg-review',   name: 'Code Review',      status: 'pending', mandatory: true,  agentId: 'tl'  },
  { id: 'qg-sec',      name: 'Security',         status: 'pending', mandatory: true,  agentId: 'sec' },
  { id: 'qg-approval', name: 'Aprovação Humana', status: 'pending', mandatory: true,  agentId: 'pm'  },
]

const DEFAULT_CRITERIA: AcceptanceCriterion[] = [
  { id: 'ac-01', description: 'Funcionalidade implementada conforme especificação',          status: 'pending' },
  { id: 'ac-02', description: 'Testes automatizados cobrindo os fluxos principais (≥80%)',  status: 'pending' },
  { id: 'ac-03', description: 'Revisão de código aprovada sem bloqueantes',                 status: 'pending' },
  { id: 'ac-04', description: 'Sem vulnerabilidades críticas ou altas no security scan',    status: 'pending' },
]

const DEFAULT_STAGES: WorkflowStage[] = [
  { id: 'intake',            label: 'Demand Intake',      shortLabel: 'Intake',    group: 'intake',    status: 'done'    },
  { id: 'triage',            label: 'Triagem',            shortLabel: 'Triagem',   group: 'intake',    status: 'done'    },
  { id: 'classification',    label: 'Classificação',      shortLabel: 'Class.',    group: 'intake',    status: 'done'    },
  { id: 'product_analysis',  label: 'Análise de Produto', shortLabel: 'Análise',   group: 'analysis',  status: 'active'  },
  { id: 'scope',             label: 'Escopo',             shortLabel: 'Escopo',    group: 'analysis',  status: 'pending' },
  { id: 'business_rules',    label: 'Regras de Negócio',  shortLabel: 'Regras',    group: 'analysis',  status: 'pending' },
  { id: 'acceptance_criteria', label: 'Critérios de Aceite', shortLabel: 'Critérios', group: 'planning', status: 'pending' },
  { id: 'prompt_engineering', label: 'Eng. de Prompt',   shortLabel: 'Prompts',   group: 'planning',  status: 'pending' },
  { id: 'technical_analysis', label: 'Análise Técnica',  shortLabel: 'Técnica',   group: 'planning',  status: 'pending' },
  { id: 'implementation',    label: 'Implementação',      shortLabel: 'Impl.',     group: 'execution', status: 'pending' },
  { id: 'automated_tests',   label: 'Testes Automatizados', shortLabel: 'Testes', group: 'testing',   status: 'pending' },
  { id: 'code_review',       label: 'Revisão de Código', shortLabel: 'Review',    group: 'testing',   status: 'pending' },
  { id: 'security_review',   label: 'Segurança',         shortLabel: 'Seg.',      group: 'testing',   status: 'pending' },
  { id: 'human_approval',    label: 'Aprovação Humana',  shortLabel: 'Aprovação', group: 'delivery',  status: 'pending' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

const DEMAND_TYPE_OPTIONS: { value: DemandType; label: string }[] = [
  { value: 'feature',     label: 'Feature'              },
  { value: 'bug',         label: 'Bug / Correção'       },
  { value: 'improvement', label: 'Melhoria'             },
  { value: 'research',    label: 'Pesquisa / Discovery' },
  { value: 'spike',       label: 'Spike Técnico'        },
]

function Toast({ message, type = 'success', onDone }: { message: string; type?: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className={`fixed bottom-6 right-6 z-[200] border rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
        type === 'error'
          ? 'bg-red-950/90 border-red-800/60 text-red-200'
          : 'bg-surface-2 border-border text-white'
      }`}
    >
      {message}
    </motion.div>
  )
}

export function NewDemandModal() {
  const { isNewDemandOpen, closeNewDemand, addDemand, webhookUrl, setWebhookUrl } = useStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('HIGH')
  const [demandType, setDemandType] = useState<DemandType>('feature')
  const [requestedBy, setRequestedBy] = useState('')
  const [repository, setRepository] = useState('')
  const [branch, setBranch] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showWebhookConfig, setShowWebhookConfig] = useState(false)

  const firstInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Foco automático no primeiro campo
  useEffect(() => {
    if (isNewDemandOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 80)
    }
  }, [isNewDemandOpen])

  // ESC para fechar
  useEffect(() => {
    if (!isNewDemandOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNewDemand()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isNewDemandOpen, closeNewDemand])

  const readFile = useCallback((file: File) => {
    if (!file.name.match(/\.(txt|md|markdown)$/i)) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setDescription(text)
      setFileName(file.name)
    }
    reader.readAsText(file, 'UTF-8')
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }, [readFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  const clearFile = () => {
    setFileName('')
    setDescription('')
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('HIGH')
    setDemandType('feature')
    setRequestedBy('')
    setRepository('')
    setBranch('')
    setDueDate('')
    setFileName('')
    setShowWebhookConfig(false)
  }

  const handleClose = () => {
    resetForm()
    closeNewDemand()
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsLoading(true)

    const now = new Date().toISOString()
    const demandId = `DEM-${Date.now()}`
    const demand: Demand = {
      id: demandId,
      title: title.trim(),
      description: description.trim(),
      type: demandType,
      priority,
      status: 'DRAFT',
      requestedBy: requestedBy.trim() || 'PM',
      createdAt: now,
      updatedAt: now,
      repository: repository.trim() || undefined,
      branch: branch.trim() || undefined,
      dueDate: dueDate || undefined,
      workflowStages: DEFAULT_STAGES,
      acceptanceCriteria: DEFAULT_CRITERIA,
      assignedAgents: ['pm', 'tl', 'dev', 'qa', 'pe'],
      qualityGates: DEFAULT_GATES,
      progress: 5,
      testStats: { total: 0, passing: 0, pending: 0, failing: 0 },
      codeQuality: { score: 0, noCriticalBugs: true, coverage: 0, codeReview: 'pending' },
      elapsedTime: '0m',
      estimatedTotal: '~3d',
      nextSteps: ['Análise de produto', 'Definição de escopo', 'Prompt engineering'],
      events: [
        {
          id: `ev-${Date.now()}-init`,
          eventType: 'demand.created',
          timestamp: now,
          demandId,
          summary: 'Demanda registrada e triagem automática concluída',
          metadata: { priority, type: demandType, requestedBy: requestedBy.trim() || 'PM' },
          correlationId: `corr-${Date.now()}`,
        },
      ],
    }

    // Always add to local store immediately — UI unblocked
    addDemand(demand)

    const endpoint = webhookUrl.trim()
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demand),
          signal: AbortSignal.timeout(8000),
        })
        if (res.ok) {
          setToast({ message: 'Demanda criada e enviada ao webhook', type: 'success' })
        } else {
          setToast({ message: `Webhook retornou ${res.status} — demanda salva localmente`, type: 'error' })
        }
      } catch {
        setToast({ message: 'Falha no webhook — demanda salva localmente', type: 'error' })
      }
    } else {
      // Sem webhook configurado — tenta localhost silenciosamente
      fetch('http://localhost:3001/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demand),
        signal: AbortSignal.timeout(4000),
      }).catch(() => {})
      setToast({ message: 'Demanda criada com sucesso', type: 'success' })
    }

    setIsLoading(false)
    resetForm()
    closeNewDemand()
  }

  const inputClass =
    'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7c6cf0]/60 focus:ring-1 focus:ring-[#7c6cf0]/30 transition-all'

  const labelClass = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

  return (
    <>
      <AnimatePresence>
        {isNewDemandOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-2xl bg-surface-2 border border-border rounded-2xl shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <PlusCircle size={18} className="text-[#7c6cf0]" />
                  <span className="text-sm font-semibold text-white flex-1">Nova Demanda</span>
                  <button
                    onClick={handleClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
                  {/* Título */}
                  <div>
                    <label className={labelClass}>Título da demanda *</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título claro e objetivo"
                      className={inputClass}
                    />
                  </div>

                  {/* Upload de arquivo */}
                  <div>
                    <label className={labelClass}>Descrição — arquivo ou texto</label>

                    {/* Drop zone */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.markdown"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {fileName ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#7c6cf0]/10 border border-[#7c6cf0]/30 rounded-lg text-sm mb-2">
                        <FileText size={14} className="text-[#7c6cf0] shrink-0" />
                        <span className="text-white/80 flex-1 truncate">{fileName}</span>
                        <button
                          onClick={clearFile}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        className={`w-full flex flex-col items-center gap-1.5 px-4 py-4 rounded-lg border border-dashed transition-all cursor-pointer mb-2 ${
                          isDragging
                            ? 'border-[#7c6cf0] bg-[#7c6cf0]/10'
                            : 'border-border hover:border-[#7c6cf0]/50 hover:bg-white/3'
                        }`}
                      >
                        <Upload size={16} className="text-white/30" />
                        <span className="text-[11px] text-white/30">
                          Arraste um <span className="text-white/50">.txt</span> ou <span className="text-white/50">.md</span>, ou <span className="text-[#7c6cf0]/80">clique para selecionar</span>
                        </span>
                      </button>
                    )}

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ou escreva diretamente: problema, comportamento esperado, contexto"
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Row: Tipo + Prioridade */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tipo</label>
                      <select
                        value={demandType}
                        onChange={(e) => setDemandType(e.target.value as DemandType)}
                        className={inputClass}
                      >
                        {DEMAND_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Prioridade</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className={inputClass}
                      >
                        {PRIORITY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row: Solicitado por + Prazo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Solicitado por</label>
                      <input
                        type="text"
                        value={requestedBy}
                        onChange={(e) => setRequestedBy(e.target.value)}
                        placeholder="Nome ou squad"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Prazo</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Row: Repositório + Branch */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Repositório</label>
                      <input
                        type="text"
                        value={repository}
                        onChange={(e) => setRepository(e.target.value)}
                        placeholder="owner/repo"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="feature/nome"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Webhook config — configuração de envio */}
                  <div className="border-t border-border/50 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowWebhookConfig((v) => !v)}
                      className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors select-none"
                    >
                      <Settings size={11} />
                      Configuração de envio
                      <span className="ml-0.5 text-[10px]">{showWebhookConfig ? '▲' : '▼'}</span>
                      {webhookUrl && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-green-900/40 border border-green-700/40 text-green-400 text-[9px] font-mono">
                          webhook ativo
                        </span>
                      )}
                    </button>

                    {showWebhookConfig && (
                      <div className="mt-2.5 space-y-1.5">
                        <label className={labelClass}>Webhook URL</label>
                        <input
                          type="url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://n8n.seudominio.com/webhook/demanda"
                          className={inputClass + ' font-mono text-xs'}
                        />
                        <p className="text-[10px] text-white/25 leading-relaxed">
                          A demanda é enviada via POST JSON para este endpoint ao criar.
                          Deixe vazio para armazenamento local apenas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 border border-border transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!title.trim() || isLoading}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#7c6cf0] text-white hover:bg-[#6b5ce0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading && <Loader2 size={13} className="animate-spin" />}
                    Criar Demanda
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key="toast" message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
