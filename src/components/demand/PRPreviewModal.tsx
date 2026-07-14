import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitPullRequest, ExternalLink, Copy, Check, X, Github, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '@/store/useStore'

type PublishState = 'idle' | 'publishing' | 'success' | 'error'

export function PRPreviewModal() {
  const { pendingPR, setPendingPR, closePR, githubToken, githubRepo, setGithubToken, setGithubRepo } = useStore()

  const [copied, setCopied]               = useState(false)
  const [publishState, setPublishState]   = useState<PublishState>('idle')
  const [publishError, setPublishError]   = useState<string | null>(null)
  const [showGithubForm, setShowGithubForm] = useState(false)
  const [localToken, setLocalToken]       = useState(githubToken)
  const [localRepo, setLocalRepo]         = useState(githubRepo)
  const [showBody, setShowBody]           = useState(false)

  if (!pendingPR) return null

  const isConfigured   = !!githubToken && !!githubRepo
  const isPublished    = !!pendingPR.url
  const isPublishing   = publishState === 'publishing'

  function copyBody() {
    navigator.clipboard.writeText(pendingPR!.body).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function publish(token: string, repo: string) {
    if (!pendingPR) return
    setPublishState('publishing')
    setPublishError(null)
    try {
      const resp = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
        method:  'POST',
        headers: {
          Authorization:  `token ${token}`,
          Accept:         'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: pendingPR.title,
          body:  pendingPR.body,
          head:  `feat/${pendingPR.demandId.slice(0, 8)}`,
          base:  'main',
        }),
      })
      const data = await resp.json() as { html_url?: string; message?: string; errors?: Array<{message: string}> }
      if (resp.ok && data.html_url) {
        setPendingPR({ ...pendingPR, url: data.html_url })
        setPublishState('success')
        setShowGithubForm(false)
      } else {
        const msg = data.errors?.[0]?.message ?? data.message ?? 'Erro desconhecido'
        setPublishError(msg)
        setPublishState('error')
      }
    } catch {
      setPublishError('Erro de rede — verifique a conexão')
      setPublishState('error')
    }
  }

  async function handlePublish() {
    if (!isConfigured) {
      setShowGithubForm(true)
      return
    }
    await publish(githubToken, githubRepo)
  }

  async function handleSaveAndPublish() {
    if (!localToken.trim() || !localRepo.trim()) return
    setGithubToken(localToken.trim())
    setGithubRepo(localRepo.trim())
    await publish(localToken.trim(), localRepo.trim())
  }

  const inputClass = 'w-full bg-[#0d1117] border border-white/12 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#7c6cf0]/50 font-mono transition-all'

  return (
    <AnimatePresence>
      <motion.div
        key="pr-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closePR}
      >
        <motion.div
          key="pr-panel"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ duration: 0.22 }}
          className="w-full max-w-xl bg-[#161b26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
            <div className="w-9 h-9 rounded-xl bg-[#7c6cf0]/15 flex items-center justify-center shrink-0">
              <GitPullRequest size={17} className="text-[#9d91f5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">Pull Request Gerado</div>
              <div className="text-[11px] text-white/40 font-mono truncate mt-0.5">{pendingPR.title}</div>
            </div>
            <button onClick={closePR} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Published success banner */}
            {isPublished && (
              <div className="flex items-center gap-2.5 px-5 py-3 bg-green-500/10 border-b border-green-500/15">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={11} className="text-green-400" />
                </div>
                <span className="text-[12px] text-green-300 flex-1">PR publicado com sucesso no GitHub</span>
                <a
                  href={pendingPR.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 font-semibold"
                >
                  <ExternalLink size={11} />
                  Abrir PR
                </a>
              </div>
            )}

            {/* Error banner */}
            {publishState === 'error' && publishError && (
              <div className="flex items-start gap-2.5 px-5 py-3 bg-red-500/10 border-b border-red-500/15">
                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] text-red-300 font-medium">Falha ao criar PR</div>
                  <div className="text-[11px] text-red-400/70 mt-0.5 font-mono">{publishError}</div>
                </div>
              </div>
            )}

            {/* GitHub form (inline — shown when not configured OR after error) */}
            {(showGithubForm || (!isConfigured && !isPublished)) && (
              <div className="px-5 py-4 border-b border-white/8 space-y-3 bg-[#7c6cf0]/5">
                <div className="flex items-center gap-2">
                  <Github size={13} className="text-white/40" />
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Configurar GitHub para publicar PR</span>
                  {(isConfigured || showGithubForm) && (
                    <button onClick={() => setShowGithubForm(v => !v)} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
                      {showGithubForm ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Personal Access Token</label>
                  <input
                    type="password"
                    value={localToken}
                    onChange={e => setLocalToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className={inputClass}
                    autoComplete="off"
                  />
                  <p className="text-[10px] text-white/20 mt-1">Permissão necessária: <code className="bg-white/10 px-1 rounded">repo</code></p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Repositório</label>
                  <input
                    type="text"
                    value={localRepo}
                    onChange={e => setLocalRepo(e.target.value)}
                    placeholder="owner/repositorio"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* PR body preview (collapsible) */}
            <div className="px-5 py-3">
              <button
                onClick={() => setShowBody(v => !v)}
                className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white/70 transition-colors w-full"
              >
                {showBody ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                <span className="font-semibold uppercase tracking-wider">Body do PR</span>
                <div className="ml-auto flex items-center gap-1.5 text-white/30 hover:text-white/60" onClick={e => { e.stopPropagation(); copyBody() }}>
                  {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </div>
              </button>

              {showBody && (
                <pre className="mt-3 text-[11px] text-white/60 font-mono whitespace-pre-wrap leading-relaxed bg-black/25 border border-white/8 rounded-xl p-4 overflow-x-auto max-h-64">
                  {pendingPR.body}
                </pre>
              )}
            </div>
          </div>

          {/* Footer — primary CTA */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-white/8">
            <button
              onClick={closePR}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 border border-white/10 transition-all"
            >
              Fechar
            </button>

            <div className="flex-1" />

            {isPublished ? (
              <a
                href={pendingPR.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-500 transition-all"
              >
                <ExternalLink size={14} />
                Abrir PR no GitHub
              </a>
            ) : showGithubForm || !isConfigured ? (
              <button
                onClick={handleSaveAndPublish}
                disabled={isPublishing || !localToken.trim() || !localRepo.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#7c6cf0] text-white hover:bg-[#6b5ce0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
                {isPublishing ? 'Publicando...' : 'Salvar e Publicar PR'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#7c6cf0] text-white hover:bg-[#6b5ce0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
                {isPublishing ? 'Publicando...' : 'Publicar PR no GitHub'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
