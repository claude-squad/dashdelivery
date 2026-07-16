import { useState } from 'react'
import { FileText, CheckCircle, XCircle, SkipForward, Bug, GitCommit, ExternalLink, Terminal, Image } from 'lucide-react'
import type { SquadExecution } from '@/types/squad'

type Tab = 'resumo' | 'arquivos' | 'testes' | 'bugs' | 'logs' | 'evidencias'

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumo',     label: 'Resumo' },
  { id: 'arquivos',   label: 'Arquivos' },
  { id: 'testes',     label: 'Testes' },
  { id: 'bugs',       label: 'Bugs' },
  { id: 'logs',       label: 'Logs' },
  { id: 'evidencias', label: 'Evidências' },
]

const SEV_COLOR: Record<string, string> = {
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const FILE_STATUS_COLOR: Record<string, string> = {
  criado: 'text-green-400 bg-green-400/10 border-green-400/20',
  alterado: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  deletado: 'text-red-400 bg-red-400/10 border-red-400/20',
}

interface Props {
  execution: SquadExecution
}

export function DeliverablesPanel({ execution }: Props) {
  const [tab, setTab] = useState<Tab>('resumo')

  const passed = execution.tests.filter(t => t.result === 'passed').length
  const failed = execution.tests.filter(t => t.result === 'failed').length
  const skipped = execution.tests.filter(t => t.result === 'skipped').length
  const coverage = execution.tests.length ? Math.round((passed / execution.tests.length) * 100) : 0

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sub-tabs */}
      <div className="flex gap-0.5 p-1 bg-black/20 rounded-xl mb-3 shrink-0">
        {TABS.map(t => {
          const count =
            t.id === 'arquivos' ? execution.files.length :
            t.id === 'testes'   ? execution.tests.length :
            t.id === 'bugs'     ? execution.bugs.length  :
            t.id === 'logs'     ? execution.logs.length  : 0
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${tab === t.id ? 'bg-white/8 text-white/80' : 'text-white/30 hover:text-white/50'}`}
            >
              {t.label}
              {count > 0 && (
                <span className="text-[9px] text-white/30">({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* RESUMO */}
        {tab === 'resumo' && (
          <div className="flex flex-col gap-3">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Arquivos', value: execution.files.length, color: '#7c6cf0' },
                { label: 'Testes OK', value: `${passed}/${execution.tests.length}`, color: '#22c55e' },
                { label: 'Bugs', value: execution.bugs.length, color: execution.bugs.length > 0 ? '#f59e0b' : '#22c55e' },
              ].map(s => (
                <div key={s.label} className="bg-black/20 border border-border/40 rounded-xl p-3 text-center">
                  <div className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="bg-black/10 border border-border/40 rounded-xl p-4">
              <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-2">Status da operação</div>
              <div className="flex items-center gap-2">
                {execution.status === 'concluido' ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : execution.status === 'falhou' ? (
                  <XCircle size={14} className="text-red-400" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#7c6cf0] border-t-transparent animate-spin" />
                )}
                <span className="text-[12px] font-semibold text-white/80 capitalize">{execution.status}</span>
                {execution.finishedAt && (
                  <span className="ml-auto text-[10px] text-white/30">
                    {new Date(execution.finishedAt).toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* GitHub */}
            {execution.github && (
              <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-3">GitHub</div>
                <div className="flex flex-col gap-2">
                  {[
                    { k: 'Repositório', v: execution.github.repository },
                    { k: 'Branch', v: execution.github.workingBranch ?? '—' },
                    { k: 'Commit', v: execution.github.commitSha ? `${execution.github.commitSha.slice(0, 7)}...` : '—' },
                    { k: 'PR', v: execution.github.prNumber ? `#${execution.github.prNumber}` : '—' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">{k}</span>
                      <span className="text-[10px] font-medium text-white/70">{v}</span>
                    </div>
                  ))}
                  {execution.github.prUrl && (
                    <a
                      href={execution.github.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 mt-1 text-[10px] text-[#7c6cf0] hover:text-[#9d91f5] transition-colors"
                    >
                      <ExternalLink size={10} />
                      Ver Pull Request no GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ARQUIVOS */}
        {tab === 'arquivos' && (
          <div className="flex flex-col gap-2">
            {execution.files.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-[11px]">Nenhum arquivo gerado ainda</div>
            ) : (
              execution.files.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-black/10 border border-border/40 rounded-xl">
                  <FileText size={13} className="text-white/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-white/80 truncate">{f.name}</div>
                    <div className="text-[9px] text-white/30 font-mono truncate">{f.path}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {f.sizeBytes && <span className="text-[9px] text-white/25">{(f.sizeBytes / 1024).toFixed(1)}kb</span>}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${FILE_STATUS_COLOR[f.fileStatus]}`}>
                      {f.fileStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TESTES */}
        {tab === 'testes' && (
          <div className="flex flex-col gap-2">
            {execution.tests.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-[11px]">Nenhum teste executado ainda</div>
            ) : (
              <>
                <div className="flex gap-2 mb-1">
                  {[
                    { label: `${passed} passaram`, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
                    { label: `${failed} falharam`, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
                    { label: `${skipped} pulados`, color: 'text-white/30 bg-white/5 border-border/40' },
                    { label: `${coverage}% cobertura`, color: 'text-[#7c6cf0] bg-[#7c6cf0]/10 border-[#7c6cf0]/20' },
                  ].map(s => (
                    <span key={s.label} className={`text-[9px] font-bold px-2 py-1 rounded border ${s.color}`}>{s.label}</span>
                  ))}
                </div>
                {execution.tests.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-black/10 border border-border/40 rounded-xl">
                    {t.result === 'passed' ? <CheckCircle size={12} className="text-green-400 shrink-0" />
                      : t.result === 'failed' ? <XCircle size={12} className="text-red-400 shrink-0" />
                      : <SkipForward size={12} className="text-white/30 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white/70 truncate">{t.name}</div>
                      <div className="text-[9px] text-white/25">{t.type} · {t.durationMs}ms</div>
                    </div>
                    <span className={`text-[9px] font-bold ${t.result === 'passed' ? 'text-green-400' : t.result === 'failed' ? 'text-red-400' : 'text-white/30'}`}>
                      {t.result}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* BUGS */}
        {tab === 'bugs' && (
          <div className="flex flex-col gap-2">
            {execution.bugs.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <CheckCircle size={24} className="text-green-400/40" />
                <div className="text-[11px] text-white/20">Nenhum bug encontrado</div>
              </div>
            ) : (
              execution.bugs.map(b => (
                <div key={b.id} className="p-3 bg-black/10 border border-border/40 rounded-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <Bug size={12} className="text-white/30 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-white/80">{b.title}</div>
                      {b.file && <div className="text-[9px] text-white/25 font-mono">{b.file}{b.line ? `:${b.line}` : ''}</div>}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${SEV_COLOR[b.severity]}`}>
                      {b.severity}
                    </span>
                  </div>
                  {b.impact && <p className="text-[10px] text-white/35 ml-5">{b.impact}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* LOGS */}
        {tab === 'logs' && (
          <div className="bg-black/30 border border-border/30 rounded-xl p-3 font-mono">
            {execution.logs.length === 0 ? (
              <div className="text-[10px] text-white/20">Sem logs</div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {execution.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Terminal size={9} className="text-[#7c6cf0]/40 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-white/45 break-all">{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVIDÊNCIAS */}
        {tab === 'evidencias' && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Image size={28} className="text-white/10" />
            <div className="text-[11px] text-white/20">Evidências visuais disponíveis após conclusão</div>
            {execution.status === 'concluido' && execution.github?.prUrl && (
              <a
                href={execution.github.prUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] text-[#7c6cf0] hover:text-[#9d91f5]"
              >
                <GitCommit size={10} />
                Ver commit no GitHub
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
