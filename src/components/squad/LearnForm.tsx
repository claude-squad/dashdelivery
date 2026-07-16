import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { LearnFormData } from '@/types/squad'

interface Props {
  onBack: () => void
  onSubmit: (data: LearnFormData) => void
  githubRepo?: string
}

const DEPTH_OPTS = [
  { value: 'basico', label: 'Básico', desc: 'Visão geral e conceitos' },
  { value: 'intermediario', label: 'Intermediário', desc: 'Análise aplicada' },
  { value: 'avancado', label: 'Avançado', desc: 'Deep-dive técnico' },
] as const

export function LearnForm({ onBack, onSubmit, githubRepo = 'claude-squad/dashdelivery' }: Props) {
  const [form, setForm] = useState<LearnFormData>({
    subject: '',
    objective: '',
    context: '',
    audience: '',
    depth: 'intermediario',
    sources: '',
    targetDirectory: 'docs/',
    relatedProject: '',
    repository: githubRepo,
    baseBranch: 'main',
    newBranchName: '',
    outputFileName: '',
    outputFormat: 'markdown',
    additionalInstructions: '',
  })

  const set = <K extends keyof LearnFormData>(k: K, v: LearnFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.objective) return
    const branch = form.newBranchName || `squad/learn-${form.subject.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`
    const file = form.outputFileName || `${form.subject.toLowerCase().replace(/\s+/g, '-')}.${form.outputFormat === 'markdown' ? 'md' : form.outputFormat}`
    onSubmit({ ...form, newBranchName: branch, outputFileName: file })
  }

  const inp = 'w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#7c6cf0]/60 transition-colors'
  const lbl = 'text-[9px] font-bold tracking-widest text-white/35 uppercase mb-1'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
        <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">Aprender — configuração</span>
      </div>

      {/* Tema & Objetivo */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Tema</div>

        <div>
          <div className={lbl}>Assunto *</div>
          <input className={inp} placeholder="Ex: PIX Automático — arquitetura de integração SPI" value={form.subject} onChange={e => set('subject', e.target.value)} required />
        </div>

        <div>
          <div className={lbl}>Objetivo da pesquisa *</div>
          <textarea className={`${inp} resize-none h-16`} placeholder="O que preciso entender após esta operação?" value={form.objective} onChange={e => set('objective', e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Contexto</div>
            <input className={inp} placeholder="Projeto ou contexto de uso" value={form.context} onChange={e => set('context', e.target.value)} />
          </div>
          <div>
            <div className={lbl}>Público-alvo</div>
            <input className={inp} placeholder="PM, Dev, C-Level..." value={form.audience} onChange={e => set('audience', e.target.value)} />
          </div>
        </div>

        <div>
          <div className={lbl}>Profundidade</div>
          <div className="flex gap-2">
            {DEPTH_OPTS.map(o => (
              <button
                type="button"
                key={o.value}
                onClick={() => set('depth', o.value)}
                className={`flex-1 py-2 px-2 rounded-lg border text-center transition-colors ${form.depth === o.value ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400' : 'border-border text-white/40 hover:border-border/80'}`}
              >
                <div className="text-[11px] font-semibold">{o.label}</div>
                <div className="text-[9px] text-white/30">{o.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={lbl}>Fontes / referências</div>
          <textarea className={`${inp} resize-none h-16`} placeholder="URLs, documentos, normas, bases de conhecimento..." value={form.sources} onChange={e => set('sources', e.target.value)} />
        </div>
      </div>

      {/* Projeto relacionado */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Projeto</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Projeto relacionado</div>
            <input className={inp} placeholder="Opea, Edenred, BRQ..." value={form.relatedProject} onChange={e => set('relatedProject', e.target.value)} />
          </div>
          <div>
            <div className={lbl}>Diretório de saída</div>
            <input className={inp} placeholder="docs/" value={form.targetDirectory} onChange={e => set('targetDirectory', e.target.value)} />
          </div>
        </div>
      </div>

      {/* GitHub */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">GitHub</div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Branch de saída</div>
            <input className={inp} value={form.newBranchName} onChange={e => set('newBranchName', e.target.value)} placeholder="squad/learn-tema (auto)" />
          </div>
          <div>
            <div className={lbl}>Formato do arquivo</div>
            <select className={inp} value={form.outputFormat} onChange={e => set('outputFormat', e.target.value as LearnFormData['outputFormat'])}>
              <option value="markdown">Markdown (.md)</option>
              <option value="html">HTML (.html)</option>
              <option value="json">JSON (.json)</option>
              <option value="txt">Plain Text (.txt)</option>
            </select>
          </div>
        </div>

        <div>
          <div className={lbl}>Nome do arquivo</div>
          <input className={inp} value={form.outputFileName} onChange={e => set('outputFileName', e.target.value)} placeholder="Gerado automaticamente pelo assunto" />
        </div>
      </div>

      {/* Instruções adicionais */}
      <div>
        <div className={lbl}>Instruções adicionais</div>
        <textarea className={`${inp} resize-none h-16`} placeholder="Restrições, formatos específicos, personas, idioma..." value={form.additionalInstructions} onChange={e => set('additionalInstructions', e.target.value)} />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[12px] font-bold hover:bg-cyan-500/30 transition-colors"
      >
        Iniciar operação →
      </button>
    </form>
  )
}
