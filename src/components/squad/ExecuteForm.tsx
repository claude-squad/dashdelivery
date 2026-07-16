import { useState, useRef } from 'react'
import { ArrowLeft, Upload, X, FileText, FileCode, FileImage, File } from 'lucide-react'
import type { ExecuteFormData } from '@/types/squad'

interface Props {
  onBack: () => void
  onSubmit: (data: ExecuteFormData, files: File[]) => void
  githubRepo?: string
}

const DEMAND_TYPES = [
  { value: 'feature',        label: 'Feature' },
  { value: 'bug',            label: 'Bug' },
  { value: 'improvement',    label: 'Melhoria' },
  { value: 'technical',      label: 'Técnico' },
  { value: 'functional',     label: 'Funcional' },
  { value: 'nonfunctional',  label: 'Não-funcional' },
] as const

const PRIORITIES = [
  { value: 'low',      label: 'Baixa',  color: '#22c55e' },
  { value: 'medium',   label: 'Média',  color: '#f59e0b' },
  { value: 'high',     label: 'Alta',   color: '#f97316' },
  { value: 'critical', label: 'Crítica',color: '#ef4444' },
] as const

function fileIcon(file: File) {
  const t = file.type
  if (t.startsWith('image/')) return FileImage
  if (t.includes('json') || t.includes('javascript') || t.includes('typescript')) return FileCode
  if (t.includes('text') || t.includes('markdown') || file.name.endsWith('.md')) return FileText
  return File
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function ExecuteForm({ onBack, onSubmit, githubRepo = 'claude-squad/dashdelivery' }: Props) {
  const [form, setForm] = useState<ExecuteFormData>({
    title: '',
    description: '',
    problem: '',
    expectedResult: '',
    demandType: 'feature',
    priority: 'medium',
    repository: githubRepo,
    baseBranch: 'main',
    targetDirectory: 'src/',
    stack: '',
    acceptanceCriteria: '',
    restrictions: '',
    dependencies: '',
    additionalInstructions: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ExecuteFormData>(k: K, v: ExecuteFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const next = Array.from(incoming).filter(
      f => !files.some(existing => existing.name === f.name && existing.size === f.size)
    )
    setFiles(prev => [...prev, ...next])
  }

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) return
    onSubmit(form, files)
  }

  const inp = 'w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#7c6cf0]/60 transition-colors'
  const lbl = 'text-[9px] font-bold tracking-widest text-white/35 uppercase mb-1'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
        <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">Executar — configuração</span>
      </div>

      {/* Demanda */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Demanda</div>

        <div>
          <div className={lbl}>Título *</div>
          <input className={inp} placeholder="Ex: Implementar endpoint de geração de CCB" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>

        <div>
          <div className={lbl}>Descrição *</div>
          <textarea className={`${inp} resize-none h-20`} placeholder="Contexto geral da demanda e escopo de entrega" value={form.description} onChange={e => set('description', e.target.value)} required />
        </div>

        <div>
          <div className={lbl}>Problema a resolver</div>
          <textarea className={`${inp} resize-none h-14`} placeholder="Qual problema esta demanda endereça?" value={form.problem} onChange={e => set('problem', e.target.value)} />
        </div>

        <div>
          <div className={lbl}>Resultado esperado</div>
          <textarea className={`${inp} resize-none h-14`} placeholder="O que deve funcionar ao final da execução?" value={form.expectedResult} onChange={e => set('expectedResult', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Tipo</div>
            <select className={inp} value={form.demandType} onChange={e => set('demandType', e.target.value as ExecuteFormData['demandType'])}>
              {DEMAND_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <div className={lbl}>Prioridade</div>
            <div className="flex gap-1.5">
              {PRIORITIES.map(p => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => set('priority', p.value)}
                  className="flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors"
                  style={form.priority === p.value
                    ? { borderColor: p.color, background: `${p.color}20`, color: p.color }
                    : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload de arquivos */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Arquivos de entrada</div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            dragOver
              ? 'border-green-500/60 bg-green-500/10'
              : 'border-border/40 hover:border-border/70 hover:bg-white/2'
          }`}
        >
          <Upload size={18} className={dragOver ? 'text-green-400' : 'text-white/20'} />
          <div className="text-center">
            <div className="text-[11px] text-white/40">Arraste arquivos aqui ou clique para selecionar</div>
            <div className="text-[9px] text-white/20 mt-0.5">PRD, spec, diagrama, código, JSON, imagem...</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {files.map((f, i) => {
              const Icon = fileIcon(f)
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-border/30 rounded-lg">
                  <Icon size={12} className="text-white/30 shrink-0" />
                  <span className="flex-1 min-w-0 text-[11px] text-white/70 truncate">{f.name}</span>
                  <span className="text-[9px] text-white/25 shrink-0">{fmtSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X size={11} />
                  </button>
                </div>
              )
            })}
            <div className="text-[9px] text-white/25 text-right">{files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}</div>
          </div>
        )}
      </div>

      {/* Critérios */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Qualidade</div>

        <div>
          <div className={lbl}>Critérios de aceite</div>
          <textarea className={`${inp} resize-none h-16`} placeholder="Dado... Quando... Então... (um por linha)" value={form.acceptanceCriteria} onChange={e => set('acceptanceCriteria', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Restrições</div>
            <textarea className={`${inp} resize-none h-14`} placeholder="Limitações técnicas ou de negócio" value={form.restrictions} onChange={e => set('restrictions', e.target.value)} />
          </div>
          <div>
            <div className={lbl}>Dependências</div>
            <textarea className={`${inp} resize-none h-14`} placeholder="Sistemas, APIs, serviços dependentes" value={form.dependencies} onChange={e => set('dependencies', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Stack & GitHub */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Stack & GitHub</div>

        <div>
          <div className={lbl}>Stack tecnológica</div>
          <input className={inp} placeholder="React 18, TypeScript, Zustand, Tailwind..." value={form.stack} onChange={e => set('stack', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Repositório</div>
            <input className={inp} value={form.repository} onChange={e => set('repository', e.target.value)} placeholder="owner/repo" />
          </div>
          <div>
            <div className={lbl}>Branch base</div>
            <input className={inp} value={form.baseBranch} onChange={e => set('baseBranch', e.target.value)} />
          </div>
        </div>

        <div>
          <div className={lbl}>Diretório de destino</div>
          <input className={inp} value={form.targetDirectory} onChange={e => set('targetDirectory', e.target.value)} placeholder="src/" />
        </div>
      </div>

      {/* Instruções */}
      <div>
        <div className={lbl}>Instruções adicionais</div>
        <textarea className={`${inp} resize-none h-14`} placeholder="Padrões de código, convenções, observações..." value={form.additionalInstructions} onChange={e => set('additionalInstructions', e.target.value)} />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 text-[12px] font-bold hover:bg-green-500/30 transition-colors"
      >
        Iniciar operação →
        {files.length > 0 && <span className="ml-2 text-[10px] opacity-70">({files.length} arquivo{files.length > 1 ? 's' : ''})</span>}
      </button>
    </form>
  )
}
