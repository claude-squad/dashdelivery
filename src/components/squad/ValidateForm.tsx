import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { ValidateFormData } from '@/types/squad'
import { parseGitHubUrl } from '@/services/githubService'
import { useStore } from '@/store/useStore'

interface Props {
  onBack: () => void
  onSubmit: (data: ValidateFormData) => void
}

export function ValidateForm({ onBack, onSubmit }: Props) {
  const githubToken = useStore(s => s.githubToken)
  const [form, setForm] = useState<ValidateFormData>({
    githubUrl: '',
    detectedType: '',
    detectedOwner: '',
    detectedRepo: '',
    detectedRef: '',
    targetDirectory: '.',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    testCommand: 'npm test',
    environment: 'node',
    acceptanceCriteria: '',
    qualityRules: '',
  })
  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [urlError, setUrlError] = useState('')

  const set = <K extends keyof ValidateFormData>(k: K, v: ValidateFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const url = form.githubUrl.trim()
    if (!url) { setUrlStatus('idle'); return }

    setUrlStatus('validating')
    setUrlError('')

    const t = setTimeout(async () => {
      const parsed = parseGitHubUrl(url)
      if (!parsed) {
        setUrlStatus('invalid')
        setUrlError('URL inválida — use formato github.com/owner/repo ou .../pull/N')
        return
      }

      setForm(f => ({
        ...f,
        detectedType: parsed.type,
        detectedOwner: parsed.owner,
        detectedRepo: parsed.repo,
        detectedRef: parsed.ref,
      }))

      if (githubToken) {
        try {
          const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
            headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' },
          })
          if (res.ok) { setUrlStatus('valid'); return }
        } catch { /* fallback below */ }
      }

      setUrlStatus('valid')
    }, 600)

    return () => clearTimeout(t)
  }, [form.githubUrl, githubToken])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.githubUrl || urlStatus !== 'valid') return
    onSubmit(form)
  }

  const inp = 'w-full bg-black/20 border border-border rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#7c6cf0]/60 transition-colors'
  const lbl = 'text-[9px] font-bold tracking-widest text-white/35 uppercase mb-1'

  const TYPE_LABELS: Record<string, string> = { repo: 'Repositório', pr: 'Pull Request', branch: 'Branch', commit: 'Commit' }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
        <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">Validar GitHub — configuração</span>
      </div>

      {/* URL */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Alvo GitHub *</div>

        <div>
          <div className={lbl}>URL do GitHub</div>
          <div className="relative">
            <input
              className={`${inp} pr-8 ${urlStatus === 'invalid' ? 'border-red-500/60' : urlStatus === 'valid' ? 'border-green-500/40' : ''}`}
              placeholder="https://github.com/owner/repo/pull/42"
              value={form.githubUrl}
              onChange={e => set('githubUrl', e.target.value)}
              required
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {urlStatus === 'validating' && <Loader2 size={12} className="text-white/30 animate-spin" />}
              {urlStatus === 'valid' && <CheckCircle size={12} className="text-green-400" />}
              {urlStatus === 'invalid' && <AlertCircle size={12} className="text-red-400" />}
            </div>
          </div>
          {urlError && <p className="text-[10px] text-red-400 mt-1">{urlError}</p>}
        </div>

        {urlStatus === 'valid' && form.detectedType && (
          <div className="flex gap-2 flex-wrap">
            {[
              { k: 'Tipo', v: TYPE_LABELS[form.detectedType] ?? form.detectedType },
              { k: 'Owner', v: form.detectedOwner },
              { k: 'Repo', v: form.detectedRepo },
              ...(form.detectedRef ? [{ k: form.detectedType === 'pr' ? 'PR' : 'Ref', v: `#${form.detectedRef}` }] : []),
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1">
                <span className="text-[9px] text-white/30">{k}:</span>
                <span className="text-[10px] font-medium text-violet-300">{v}</span>
              </div>
            ))}
          </div>
        )}

        {!githubToken && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle size={12} className="text-amber-400 shrink-0" />
            <p className="text-[10px] text-amber-300">GitHub token não configurado — validação de acesso limitada. Configure em Configurações.</p>
          </div>
        )}
      </div>

      {/* Validação */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Critérios de validação</div>

        <div>
          <div className={lbl}>Critérios de aceite</div>
          <textarea className={`${inp} resize-none h-20`} placeholder="O que deve ser validado? Funcionalidades, contratos, performance..." value={form.acceptanceCriteria} onChange={e => set('acceptanceCriteria', e.target.value)} />
        </div>

        <div>
          <div className={lbl}>Regras de qualidade</div>
          <textarea className={`${inp} resize-none h-16`} placeholder="Cobertura mínima, padrões de código, SLA..." value={form.qualityRules} onChange={e => set('qualityRules', e.target.value)} />
        </div>
      </div>

      {/* Execução */}
      <div className="bg-black/10 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Execução</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={lbl}>Diretório alvo</div>
            <input className={inp} value={form.targetDirectory} onChange={e => set('targetDirectory', e.target.value)} placeholder="." />
          </div>
          <div>
            <div className={lbl}>Ambiente</div>
            <input className={inp} value={form.environment} onChange={e => set('environment', e.target.value)} placeholder="node, python, java..." />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className={lbl}>Install</div>
            <input className={inp} value={form.installCommand} onChange={e => set('installCommand', e.target.value)} />
          </div>
          <div>
            <div className={lbl}>Build</div>
            <input className={inp} value={form.buildCommand} onChange={e => set('buildCommand', e.target.value)} />
          </div>
          <div>
            <div className={lbl}>Test</div>
            <input className={inp} value={form.testCommand} onChange={e => set('testCommand', e.target.value)} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={urlStatus !== 'valid'}
        className="w-full py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 text-[12px] font-bold hover:bg-violet-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {urlStatus === 'validating' ? 'Validando URL...' : 'Iniciar operação →'}
      </button>
    </form>
  )
}
