import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { ExecuteFormData } from '@/types/squad'

interface Props {
  onBack: () => void
  onSubmit: (data: ExecuteFormData) => void
  githubRepo?: string
}

const DEMAND_TYPES = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'improvement', label: 'Melhoria' },
  { value: 'technical', label: 'Técnico' },
  { value: 'functional', label: 'Funcional' },
  { value: 'nonfunctional', label: 'Não-funcional' },
] as const

const PRIORITIES = [
  { value: 'low',      label: 'Baixa',    color: '#22c55e' },
  { value: 'medium',   label: 'Média',    color: '#f59e0b' },
  { value: 'high',     label: 'Alta',     color: '#f97316' },
  { value: 'critical', label: 'Crítica',  color: '#ef4444' },
] as const

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

  const set = <K extends keyof ExecuteFormData>(k: K, v: ExecuteFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) return
    onSubmit(form)
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
          <textarea className={`${inp} resize-none h-16`} placeholder="Qual problema esta demanda endereça?" value={form.problem} onChange={e => set('problem', e.target.value)} />
        </div>

        <div>
          <div className={lbl}>Resultado esperado</div>
          <textarea className={`${inp} resize-none h-16`} placeholder="O que deve funcionar ao final da execução?" value={form.expectedResult} onChange={e => set('expectedResult', e.target.value)} />
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

      {/* Critérios */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Qualidade</div>

        <div>
          <div className={lbl}>Critérios de aceite</div>
          <textarea className={`${inp} resize-none h-20`} placeholder="Dado... Quando... Então... (um por linha)" value={form.acceptanceCriteria} onChange={e => set('acceptanceCriteria', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Restrições</div>
            <textarea className={`${inp} resize-none h-16`} placeholder="Limitações técnicas ou de negócio" value={form.restrictions} onChange={e => set('restrictions', e.target.value)} />
          </div>
          <div>
            <div className={lbl}>Dependências</div>
            <textarea className={`${inp} resize-none h-16`} placeholder="Sistemas, APIs, serviços dependentes" value={form.dependencies} onChange={e => set('dependencies', e.target.value)} />
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
        <textarea className={`${inp} resize-none h-16`} placeholder="Padrões de código, convenções, observações específicas..." value={form.additionalInstructions} onChange={e => set('additionalInstructions', e.target.value)} />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 text-[12px] font-bold hover:bg-green-500/30 transition-colors"
      >
        Iniciar operação →
      </button>
    </form>
  )
}
