import { useEffect, useRef, useState } from 'react'
import { Pause, Play, X, Terminal, RefreshCw, Cpu } from 'lucide-react'
import { useSquadStore } from '@/store/useSquadStore'
import { useStore } from '@/store/useStore'
import { OperationTypeSelector } from './OperationTypeSelector'
import { LearnForm } from './LearnForm'
import { ExecuteForm } from './ExecuteForm'
import { ValidateForm } from './ValidateForm'
import { ExecutionStepper } from './ExecutionStepper'
import { HumanApprovalModal } from './HumanApprovalModal'
import { DeliverablesPanel } from './DeliverablesPanel'
import { useSyncSquadToOffice } from '@/hooks/useSyncSquadToOffice'
import type { OperationType } from '@/types/squad'

const TABS = [
  { id: 'entrada',      label: 'Entrada' },
  { id: 'plano',        label: 'Plano' },
  { id: 'execucao',     label: 'Execução' },
  { id: 'validacao',    label: 'Validação' },
  { id: 'entregaveis',  label: 'Entregáveis' },
  { id: 'github',       label: 'GitHub' },
] as const

const STATUS_LABEL: Record<string, { label: string; color: string; pulse: boolean }> = {
  idle:                  { label: 'Aguardando',      color: 'text-white/30',  pulse: false },
  selecionando:          { label: 'Selecionando',     color: 'text-white/50',  pulse: false },
  formulario:            { label: 'Formulário',       color: 'text-white/50',  pulse: false },
  executando:            { label: 'Em execução',      color: 'text-[#7c6cf0]', pulse: true  },
  pausado:               { label: 'Pausado',          color: 'text-amber-400', pulse: false },
  aguardando_aprovacao:  { label: 'Aguard. aprovação',color: 'text-amber-400', pulse: true  },
  concluido:             { label: 'Concluído',        color: 'text-green-400', pulse: false },
  falhou:                { label: 'Falhou',           color: 'text-red-400',   pulse: false },
  cancelado:             { label: 'Cancelado',        color: 'text-white/30',  pulse: false },
}

function ElapsedTimer({ startedAt }: { startedAt?: string }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startedAt) return
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
    }, 1000)
    return () => clearInterval(iv)
  }, [startedAt])
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const s = (elapsed % 60).toString().padStart(2, '0')
  return <span className="text-[10px] font-mono text-white/25">{m}:{s}</span>
}

export function OperationCenter() {
  const { githubToken, githubRepo } = useStore(s => ({ githubToken: s.githubToken, githubRepo: s.githubRepo }))
  const {
    selectedType, activeTab, execution,
    selectType, clearType, setActiveTab,
    startExecution, pauseExecution, resumeExecution, cancelExecution,
    approveAction, cancelApproval, reset,
  } = useSquadStore()

  const [showLogs, setShowLogs] = useState(false)
  useSyncSquadToOffice()
  const logsRef = useRef<HTMLDivElement>(null)

  // auto-scroll logs
  useEffect(() => {
    if (showLogs && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [execution?.logs.length, showLogs])

  const status = execution?.status ?? 'idle'
  const statusMeta = STATUS_LABEL[status] ?? STATUS_LABEL.idle
  const isRunning = status === 'executando'
  const isPaused = status === 'pausado'
  const isDone = status === 'concluido' || status === 'cancelado' || status === 'falhou'
  const isWaiting = status === 'aguardando_aprovacao'
  const hasExecution = !!execution

  // Claw3D height: bigger in execucao tab
  return (
    <div className="flex flex-col h-full min-h-0 bg-[--c-surface-2] border border-[--c-border] rounded-xl overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Cpu size={13} className="text-[#7c6cf0] shrink-0" />
          <span className="text-[11px] font-bold text-white/80 truncate">Central de Operações</span>
          {execution?.id && (
            <span className="text-[9px] font-mono text-white/20 shrink-0">{execution.id}</span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {execution?.startedAt && <ElapsedTimer startedAt={execution.startedAt} />}

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta.color.replace('text-', 'bg-').replace('/30', '/60').replace('/50', '/70')} ${statusMeta.pulse ? 'animate-pulse' : ''}`} />
            <span className={`text-[9px] font-semibold ${statusMeta.color}`}>{statusMeta.label}</span>
          </div>

          {hasExecution && !isDone && (
            <div className="flex items-center gap-1">
              {isRunning && (
                <button onClick={pauseExecution} className="p-1 rounded text-white/30 hover:text-amber-400 transition-colors" title="Pausar">
                  <Pause size={12} />
                </button>
              )}
              {isPaused && (
                <button onClick={resumeExecution} className="p-1 rounded text-white/30 hover:text-green-400 transition-colors" title="Retomar">
                  <Play size={12} />
                </button>
              )}
              {!isWaiting && (
                <button onClick={cancelExecution} className="p-1 rounded text-white/30 hover:text-red-400 transition-colors" title="Cancelar">
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {isDone && (
            <button onClick={reset} className="p-1 rounded text-white/30 hover:text-[#7c6cf0] transition-colors" title="Nova operação">
              <RefreshCw size={12} />
            </button>
          )}

          <button
            onClick={() => setShowLogs(v => !v)}
            className={`p-1 rounded transition-colors ${showLogs ? 'text-[#7c6cf0]' : 'text-white/30 hover:text-white/60'}`}
            title="Logs"
          >
            <Terminal size={12} />
          </button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      {hasExecution && (
        <div className="shrink-0 flex gap-0 border-b border-border/50 px-2 pt-2">
          {TABS.map(t => {
            const disabled = !hasExecution && t.id !== 'entrada'
            return (
              <button
                key={t.id}
                disabled={disabled}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`px-3 pb-2 text-[10px] font-semibold border-b-2 transition-colors ${
                  activeTab === t.id
                    ? 'border-[#7c6cf0] text-[#a799ff]'
                    : 'border-transparent text-white/30 hover:text-white/55 disabled:text-white/15 disabled:cursor-not-allowed'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Log overlay ──────────────────────────────────────────── */}
      {showLogs && execution && (
        <div
          ref={logsRef}
          className="shrink-0 max-h-32 overflow-y-auto bg-black/40 border-b border-border/40 px-3 py-2 font-mono"
        >
          {execution.logs.map((log, i) => (
            <div key={i} className="text-[9px] text-white/35 leading-relaxed">{log}</div>
          ))}
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">

        {/* ENTRADA — type selector or form */}
        {activeTab === 'entrada' && (
          !selectedType ? (
            <OperationTypeSelector onSelect={(t: OperationType) => { selectType(t); }} />
          ) : !hasExecution ? (
            selectedType === 'learn' ? (
              <LearnForm
                onBack={clearType}
                onSubmit={data => startExecution(data, githubToken, githubRepo)}
                githubRepo={githubRepo}
              />
            ) : selectedType === 'execute' ? (
              <ExecuteForm
                onBack={clearType}
                onSubmit={(data, _files) => startExecution(data, githubToken, githubRepo)}
                githubRepo={githubRepo}
              />
            ) : (
              <ValidateForm
                onBack={clearType}
                onSubmit={data => startExecution(data, githubToken, githubRepo)}
              />
            )
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase">Operação em curso</div>
              <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                <div className="text-[12px] font-semibold text-white/80 mb-1">{execution.title}</div>
                <div className="text-[10px] text-white/35 capitalize">{execution.operationType} · {execution.status}</div>
              </div>
              {isDone && (
                <button onClick={reset} className="w-full py-2.5 rounded-xl bg-[#7c6cf0]/15 border border-[#7c6cf0]/30 text-[#a799ff] text-[12px] font-semibold hover:bg-[#7c6cf0]/25 transition-colors">
                  Nova operação
                </button>
              )}
            </div>
          )
        )}

        {/* PLANO */}
        {activeTab === 'plano' && (
          <div className="flex flex-col gap-3">
            <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-1">Plano de execução</div>
            {execution ? (
              <>
                <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                  <div className="text-[12px] font-semibold text-white/80 mb-1">{execution.title}</div>
                  <div className="text-[10px] text-white/35 capitalize">{execution.operationType}</div>
                </div>
                <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                  <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-3">Passos da operação</div>
                  <ExecutionStepper steps={execution.steps} compact />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-[11px] text-white/20">Inicie uma operação na aba Entrada</div>
            )}
          </div>
        )}

        {/* EXECUÇÃO */}
        {activeTab === 'execucao' && (
          <div className="flex flex-col gap-3">
            {execution ? (
              <>
                <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-1">Progresso em tempo real</div>
                <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                  <ExecutionStepper steps={execution.steps} />
                </div>
                {isWaiting && execution.pendingApproval && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-pulse">
                    <span className="text-[11px] text-amber-300 font-semibold">Aguardando aprovação humana</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-[11px] text-white/20">Inicie uma operação na aba Entrada</div>
            )}
          </div>
        )}

        {/* VALIDAÇÃO */}
        {activeTab === 'validacao' && (
          <div className="flex flex-col gap-3">
            <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-1">Validação QA</div>
            {execution ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Testes passou', value: execution.tests.filter(t => t.result === 'passed').length, color: '#22c55e' },
                    { label: 'Testes falhou', value: execution.tests.filter(t => t.result === 'failed').length, color: '#ef4444' },
                    { label: 'Bugs críticos', value: execution.bugs.filter(b => b.severity === 'critical').length, color: '#f97316' },
                    { label: 'Bugs total', value: execution.bugs.length, color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="bg-black/10 border border-border/40 rounded-xl p-3 text-center">
                      <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[9px] text-white/30">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                  <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-2">Aprovações</div>
                  {execution.approvals.length === 0 ? (
                    <div className="text-[10px] text-white/20">Nenhuma aprovação necessária até o momento</div>
                  ) : (
                    execution.approvals.map(a => (
                      <div key={a.id} className="flex items-center justify-between py-1.5">
                        <span className="text-[10px] text-white/50">{a.action}</span>
                        <span className={`text-[9px] font-bold ${a.status === 'aprovado' ? 'text-green-400' : a.status === 'cancelado' ? 'text-red-400' : 'text-amber-400'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-[11px] text-white/20">Inicie uma operação na aba Entrada</div>
            )}
          </div>
        )}

        {/* ENTREGÁVEIS */}
        {activeTab === 'entregaveis' && (
          execution ? (
            <DeliverablesPanel execution={execution} />
          ) : (
            <div className="text-center py-8 text-[11px] text-white/20">Inicie uma operação na aba Entrada</div>
          )
        )}

        {/* GITHUB */}
        {activeTab === 'github' && (
          <div className="flex flex-col gap-3">
            <div className="text-[9px] font-bold tracking-widest text-white/25 uppercase mb-1">GitHub</div>
            {execution?.github ? (
              <>
                <div className="bg-black/10 border border-border/40 rounded-xl p-4">
                  {[
                    { k: 'Repositório', v: execution.github.repository },
                    { k: 'Branch base', v: execution.github.baseBranch },
                    { k: 'Branch de trabalho', v: execution.github.workingBranch ?? '—' },
                    { k: 'Commit SHA', v: execution.github.commitSha ? `${execution.github.commitSha.slice(0, 10)}...` : '—' },
                    { k: 'Pull Request', v: execution.github.prNumber ? `#${execution.github.prNumber}` : '—' },
                    { k: 'CI Status', v: execution.github.ciStatus ?? '—' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                      <span className="text-[10px] text-white/30">{k}</span>
                      <span className="text-[10px] font-medium text-white/70">{v}</span>
                    </div>
                  ))}
                </div>
                {execution.github.prUrl && (
                  <a
                    href={execution.github.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7c6cf0]/15 border border-[#7c6cf0]/30 text-[#a799ff] text-[12px] font-semibold hover:bg-[#7c6cf0]/25 transition-colors"
                  >
                    Abrir Pull Request no GitHub →
                  </a>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-[11px] text-white/20">
                {execution ? 'Pull Request ainda não criado' : 'Inicie uma operação na aba Entrada'}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Approval Modal ───────────────────────────────────────── */}
      {isWaiting && execution?.pendingApproval && (
        <HumanApprovalModal
          approval={execution.pendingApproval}
          onApprove={approveAction}
          onCancel={cancelApproval}
        />
      )}
    </div>
  )
}
