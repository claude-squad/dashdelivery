import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Play,
  ChevronDown,
  ChevronUp,
  FileDown,
  ShieldCheck,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'
import type { AcceptanceCriterion, QualityGate } from '@/types'

// ─── Tipos internos ──────────────────────────────────────────────────────────

type TabId =
  | 'overview'
  | 'criteria'
  | 'technical'
  | 'gates'
  | 'tests'
  | 'events'
  | 'approvals'
  | 'report'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'criteria', label: 'Critérios de Aceite' },
  { id: 'technical', label: 'Plano Técnico' },
  { id: 'gates', label: 'Quality Gates' },
  { id: 'tests', label: 'Testes' },
  { id: 'events', label: 'Eventos' },
  { id: 'approvals', label: 'Aprovações' },
  { id: 'report', label: 'Relatório Final' },
]

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-500/20 text-green-300 border-green-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  HIGH: 'bg-red-500/20 text-red-300 border-red-500/30',
  CRITICAL: 'bg-red-600/30 text-red-200 border-red-600/40',
}

const GATE_COLORS: Record<QualityGate['status'], string> = {
  passed: 'text-green-400 bg-green-500/10 border-green-500/20',
  running: 'text-[#a99cf4] bg-[#7c6cf0]/10 border-[#7c6cf0]/20',
  failed: 'text-red-400 bg-red-500/10 border-red-500/20',
  pending: 'text-white/40 bg-white/5 border-white/10',
  blocked: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

const CRITERION_STATUS_MAP: Record<AcceptanceCriterion['status'], { icon: React.ReactNode; color: string }> = {
  passed: { icon: <CheckCircle2 size={14} className="text-green-400" />, color: 'text-green-400' },
  failed: { icon: <XCircle size={14} className="text-red-400" />, color: 'text-red-400' },
  pending: { icon: <Clock size={14} className="text-white/40" />, color: 'text-white/40' },
}

// Cenários de teste fictícios
const MOCK_TEST_SCENARIOS = [
  { id: 1, name: 'Fluxo principal de criação', status: 'passing', duration: '0.42s' },
  { id: 2, name: 'Validação de campos obrigatórios', status: 'passing', duration: '0.18s' },
  { id: 3, name: 'Comportamento com dados inválidos', status: 'pending', duration: '-' },
  { id: 4, name: 'Integração com API externa', status: 'failing', duration: '2.10s' },
  { id: 5, name: 'Responsividade em mobile', status: 'pending', duration: '-' },
]

const TEST_STATUS_COLORS: Record<string, string> = {
  passing: 'text-green-400',
  failing: 'text-red-400',
  pending: 'text-white/40',
}

// ─── Sub-componentes de abas ──────────────────────────────────────────────────

function ProgressRing({ progress }: { progress: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ
  return (
    <svg width={72} height={72} className="rotate-[-90deg]">
      <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke="#7c6cf0"
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x={36}
        y={36}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={13}
        fontWeight={700}
        className="rotate-90 origin-center"
        style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}
      >
        {progress}%
      </text>
    </svg>
  )
}

function TabOverview({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Info principal */}
        <div className="col-span-2 space-y-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-white/70 leading-relaxed">{demand.description || '—'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Solicitado por', value: demand.requestedBy },
              { label: 'Repositório', value: demand.repository ?? '—' },
              { label: 'Branch', value: demand.branch ?? '—' },
              { label: 'Prazo', value: demand.dueDate ?? '—' },
              { label: 'Tempo decorrido', value: demand.elapsedTime },
              { label: 'Estimativa total', value: demand.estimatedTotal },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface border border-border rounded-lg px-3 py-2.5">
                <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-sm text-white/80 font-medium truncate">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress + Agents */}
        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center gap-2">
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Progresso</div>
            <ProgressRing progress={demand.progress} />
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">
              Agentes Atribuídos
            </div>
            {demand.assignedAgents.length === 0 ? (
              <p className="text-xs text-white/30 italic">Nenhum agente atribuído</p>
            ) : (
              <ul className="space-y-1.5">
                {demand.assignedAgents.map((a) => (
                  <li key={a} className="text-xs text-white/60 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c6cf0]" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabCriteria({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  const [criteria, setCriteria] = useState(demand.acceptanceCriteria)

  const toggle = (id: string) => {
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'passed' ? 'pending' : 'passed' }
          : c
      )
    )
  }

  if (criteria.length === 0) {
    return <p className="text-sm text-white/30 italic mt-4">Nenhum critério de aceite definido.</p>
  }

  return (
    <ul className="space-y-2 mt-1">
      {criteria.map((c) => {
        const { icon } = CRITERION_STATUS_MAP[c.status]
        return (
          <li
            key={c.id}
            className="flex items-start gap-3 bg-surface border border-border rounded-xl px-4 py-3 hover:border-white/15 transition-colors"
          >
            <button onClick={() => toggle(c.id)} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
              {icon}
            </button>
            <span className={clsx('text-sm leading-relaxed', c.status === 'failed' ? 'text-red-300' : 'text-white/80')}>
              {c.description}
            </span>
            <span
              className={clsx(
                'ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase',
                c.status === 'passed'
                  ? 'bg-green-500/15 text-green-400 border-green-500/20'
                  : c.status === 'failed'
                  ? 'bg-red-500/15 text-red-400 border-red-500/20'
                  : 'bg-white/5 text-white/30 border-white/10'
              )}
            >
              {c.status}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function TabTechnical({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(demand.technicalPlan ?? '')

  return (
    <div className="space-y-3 mt-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Plano Técnico</span>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs px-3 py-1.5 rounded-lg border border-border text-white/50 hover:text-white hover:border-white/20 transition-all"
        >
          {editing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      {editing ? (
        <textarea
          className="w-full min-h-[320px] bg-surface border border-[#7c6cf0]/40 rounded-xl px-4 py-3 text-sm text-white/80 font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-[#7c6cf0]/30"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div className="bg-surface border border-border rounded-xl px-4 py-4 min-h-[200px]">
          {value ? (
            <pre className="text-sm text-white/70 font-mono whitespace-pre-wrap leading-relaxed">{value}</pre>
          ) : (
            <p className="text-sm text-white/30 italic">Nenhum plano técnico definido.</p>
          )}
        </div>
      )}
    </div>
  )
}

function TabGates({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  const { updateDemandGate, updateAgentInstance, setSelectedDemand, setPendingExecution, gateExecution } = useStore()

  // Usa estado do store — sobrevive ao unmount do componente quando navega para o dashboard
  const isRunning = !!(gateExecution?.isRunning && gateExecution.demandId === demand.id)

  const runGate = async (gateId: string) => {
    const gate = demand.qualityGates.find((g) => g.id === gateId)
    const agentId = gate?.agentId

    if (agentId) {
      updateAgentInstance(agentId, {
        status: 'EXECUTING',
        currentTask: `Executando gate: ${gate?.name}`,
      })
    }

    updateDemandGate(demand.id, gateId, { status: 'running', result: undefined })
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))
    const pass = Math.random() > 0.12

    updateDemandGate(demand.id, gateId, {
      status: pass ? 'passed' : 'failed',
      result: pass ? 'Concluído sem erros' : 'Falha detectada — verifique o log',
    })

    if (agentId) {
      updateAgentInstance(agentId, {
        status: pass ? 'COMPLETED' : 'BLOCKED',
        currentTask: pass ? `Gate aprovado: ${gate?.name}` : `Falha em: ${gate?.name}`,
      })
      await new Promise((r) => setTimeout(r, 2000))
      updateAgentInstance(agentId, {
        status: 'EXECUTING',
        currentTask: 'Aguardando próxima validação',
      })
    }
  }

  // Dispara o sinal para o hook useGateExecution (montado em App.tsx) processar a execução
  // fora do ciclo de vida deste componente — evita race condition com AnimatePresence mode="wait"
  const runAll = () => {
    if (isRunning) return
    setSelectedDemand(null)
    setPendingExecution({ demandId: demand.id, gates: demand.qualityGates })
  }

  if (demand.qualityGates.length === 0) {
    return <p className="text-sm text-white/30 italic mt-4">Nenhum quality gate configurado.</p>
  }

  const running = demand.qualityGates.some((g) => g.status === 'running')

  return (
    <div className="space-y-3 mt-1">
      <div className="flex justify-end">
        <button
          onClick={runAll}
          disabled={isRunning || running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c6cf0]/20 border border-[#7c6cf0]/30 text-[#a99cf4] text-xs font-semibold hover:bg-[#7c6cf0]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning || running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
          {isRunning || running ? 'Executando...' : 'Executar Todos'}
        </button>
      </div>

      <ul className="space-y-2">
        {demand.qualityGates.map((gate) => (
          <li
            key={gate.id}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-4 py-3 border',
              GATE_COLORS[gate.status]
            )}
          >
            {gate.status === 'running' && <Loader2 size={14} className="animate-spin shrink-0" />}
            {gate.status === 'passed' && <CheckCircle2 size={14} className="shrink-0" />}
            {gate.status === 'failed' && <XCircle size={14} className="shrink-0" />}
            {(gate.status === 'pending' || gate.status === 'blocked') && (
              <Clock size={14} className="shrink-0" />
            )}

            <span className="text-sm font-medium flex-1">{gate.name}</span>

            {gate.mandatory && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-current opacity-60 font-semibold uppercase">
                obrigatório
              </span>
            )}

            {gate.result && (
              <span className="text-xs opacity-70 max-w-[200px] truncate">{gate.result}</span>
            )}

            <button
              onClick={() => runGate(gate.id)}
              disabled={isRunning || gate.status === 'running'}
              className="ml-2 flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-current/30 hover:bg-white/5 transition-colors opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={11} />
              Re-executar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TabTests({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  const { total, passing, pending, failing } = demand.testStats

  const stats = [
    { label: 'Total', value: total, color: 'text-white/80' },
    { label: 'Passando', value: passing, color: 'text-green-400' },
    { label: 'Pendente', value: pending, color: 'text-white/40' },
    { label: 'Falhando', value: failing, color: 'text-red-400' },
  ]

  return (
    <div className="space-y-5 mt-1">
      <div className="grid grid-cols-4 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-xl px-4 py-4 text-center">
            <div className={clsx('text-2xl font-bold', color)}>{value}</div>
            <div className="text-[11px] text-white/30 mt-1 uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                Cenário
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                Duração
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TEST_SCENARIOS.map((s, i) => (
              <tr key={s.id} className={i < MOCK_TEST_SCENARIOS.length - 1 ? 'border-b border-border/40' : ''}>
                <td className="px-4 py-3 text-white/70">{s.name}</td>
                <td className={clsx('px-4 py-3 font-medium capitalize', TEST_STATUS_COLORS[s.status])}>
                  {s.status}
                </td>
                <td className="px-4 py-3 text-right text-white/40 font-mono text-xs">{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EventRow({ event }: { event: NonNullable<ReturnType<typeof useDemand>>['events'][number] }) {
  const [expanded, setExpanded] = useState(false)
  const hasMetadata = Object.keys(event.metadata).length > 0

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => hasMetadata && setExpanded((e) => !e)}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#7c6cf0] mt-2 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#a99cf4]">{event.eventType}</span>
            {event.agentId && (
              <span className="text-[10px] text-white/30 font-mono">{event.agentId}</span>
            )}
          </div>
          <p className="text-sm text-white/70 mt-0.5 leading-relaxed">{event.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-white/30 font-mono">
            {new Date(event.timestamp).toLocaleString('pt-BR')}
          </div>
          {hasMetadata && (
            <div className="mt-1 flex justify-end">
              {expanded ? (
                <ChevronUp size={12} className="text-white/30" />
              ) : (
                <ChevronDown size={12} className="text-white/30" />
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && hasMetadata && (
        <div className="px-4 pb-4 border-t border-border/60">
          <pre className="text-[11px] text-white/50 font-mono mt-3 leading-relaxed overflow-x-auto">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function TabEvents({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  if (demand.events.length === 0) {
    return <p className="text-sm text-white/30 italic mt-4">Nenhum evento registrado.</p>
  }

  return (
    <div className="space-y-2 mt-1">
      {demand.events.map((ev) => (
        <EventRow key={ev.id} event={ev} />
      ))}
    </div>
  )
}

function TabApprovals({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  const { approveDemand, rejectDemand } = useStore()
  const [comment, setComment] = useState('')
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null)
  const [loading, setLoading] = useState(false)

  const isApproved = demand.status === 'DONE'
  const isRejected = demand.status === 'BLOCKED'
  const hasDecision = isApproved || isRejected || decision !== null

  const handleApprove = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    approveDemand(demand.id, comment)
    setDecision('approved')
    setLoading(false)
  }

  const handleReject = async () => {
    if (!comment.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    rejectDemand(demand.id, comment)
    setDecision('rejected')
    setLoading(false)
  }

  const approved = decision === 'approved' || isApproved
  const rejected = decision === 'rejected' || isRejected

  return (
    <div className="max-w-xl space-y-4 mt-1">
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">
            Validação Final da Entrega
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Revisão executiva da entrega. Confirme se todos os critérios foram atendidos antes de aprovar.
          </p>
          <div className="mt-2 text-xs text-white/40">
            Solicitado por: <span className="text-white/60">{demand.requestedBy}</span>
          </div>
        </div>

        {hasDecision ? (
          <div
            className={clsx(
              'flex items-center gap-3 rounded-xl px-4 py-3 border font-semibold text-sm',
              approved
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
            {approved ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <div>
              <div>{approved ? 'APROVADO' : 'REPROVADO'}</div>
              {comment && <div className="text-xs font-normal opacity-70 mt-0.5">{comment}</div>}
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Comentário / Motivo
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Obrigatório ao reprovar. Opcional ao aprovar."
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7c6cf0]/60 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/30 disabled:opacity-40 transition-all"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Aprovar
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !comment.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/30 disabled:opacity-40 transition-all"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={15} />}
                Reprovar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TabReport({ demand }: { demand: NonNullable<ReturnType<typeof useDemand>> }) {
  const gatesPassed = demand.qualityGates.filter((g) => g.status === 'passed').length
  const gatesTotal = demand.qualityGates.length
  const criteriaPassed = demand.acceptanceCriteria.filter((c) => c.status === 'passed').length
  const criteriaTotal = demand.acceptanceCriteria.length
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)

    await new Promise((r) => setTimeout(r, 200))

    const gateRows = demand.qualityGates
      .map(
        (g) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a4a;">${g.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a4a;text-align:center;">
              <span style="
                font-size:11px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:4px;
                background:${g.status === 'passed' ? 'rgba(34,197,94,0.15)' : g.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)'};
                color:${g.status === 'passed' ? '#4ade80' : g.status === 'failed' ? '#f87171' : '#9ca3af'};
              ">${g.status}</span>
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a4a;font-size:12px;color:#6b7280;">${g.result ?? '—'}</td>
          </tr>`
      )
      .join('')

    const criteriaRows = demand.acceptanceCriteria
      .map(
        (c) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a4a;">${c.description}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a2a4a;text-align:center;">
              <span style="
                font-size:11px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:4px;
                background:${c.status === 'passed' ? 'rgba(34,197,94,0.15)' : c.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)'};
                color:${c.status === 'passed' ? '#4ade80' : c.status === 'failed' ? '#f87171' : '#9ca3af'};
              ">${c.status}</span>
            </td>
          </tr>`
      )
      .join('')

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório — ${demand.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #1a1a2e; color: #e2e2f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 48px; }
    h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    h2 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #7c6cf0; margin-bottom: 16px; margin-top: 32px; }
    .meta { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .meta-item { background: #16213e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 10px 16px; min-width: 140px; }
    .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #6b7280; margin-bottom: 4px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #e2e2f0; }
    .progress-bar { background: #2a2a4a; border-radius: 4px; height: 8px; width: 100%; margin-top: 4px; }
    .progress-fill { background: #7c6cf0; border-radius: 4px; height: 8px; }
    table { width: 100%; border-collapse: collapse; background: #16213e; border: 1px solid #2a2a4a; border-radius: 8px; overflow: hidden; font-size: 13px; color: #c4c4d4; }
    thead tr { background: #0f0f23; }
    th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; }
    .summary { display: flex; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
    .summary-card { background: #16213e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 16px 20px; flex: 1; min-width: 120px; }
    .summary-num { font-size: 28px; font-weight: 700; color: #fff; }
    .summary-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .signature { margin-top: 48px; padding-top: 24px; border-top: 1px solid #2a2a4a; display: flex; justify-content: space-between; align-items: flex-end; }
    .sig-block { text-align: center; }
    .sig-line { width: 180px; border-top: 1px solid #4a4a6a; margin-bottom: 8px; }
    .sig-label { font-size: 11px; color: #6b7280; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; border: 1px solid #7c6cf0; background: rgba(124,108,240,.15); color: #a99cf4; margin-bottom: 8px; }
    .footer { margin-top: 32px; font-size: 11px; color: #4a4a6a; text-align: center; }
  </style>
</head>
<body>
  <div class="badge">Relatório Final de Entrega</div>
  <h1>${demand.title}</h1>
  <p style="color:#6b7280;font-size:13px;margin-top:4px;margin-bottom:24px;">ID: ${demand.id} &nbsp;·&nbsp; Emitido em: ${new Date().toLocaleString('pt-BR')}</p>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Prioridade</div>
      <div class="meta-value">${demand.priority}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Status</div>
      <div class="meta-value">${demand.status}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Solicitado por</div>
      <div class="meta-value">${demand.requestedBy}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Criado em</div>
      <div class="meta-value">${demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('pt-BR') : '—'}</div>
    </div>
    <div class="meta-item" style="min-width:200px;">
      <div class="meta-label">Progresso Geral</div>
      <div class="meta-value">${demand.progress}%</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${demand.progress}%"></div></div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="summary-num">${gatesPassed}<span style="font-size:18px;color:#4a4a6a;">/${gatesTotal}</span></div>
      <div class="summary-sub">Quality Gates aprovados</div>
    </div>
    <div class="summary-card">
      <div class="summary-num">${criteriaPassed}<span style="font-size:18px;color:#4a4a6a;">/${criteriaTotal}</span></div>
      <div class="summary-sub">Critérios de aceite atendidos</div>
    </div>
    <div class="summary-card">
      <div class="summary-num">${demand.testStats.passing}<span style="font-size:18px;color:#4a4a6a;">/${demand.testStats.total}</span></div>
      <div class="summary-sub">Testes passando</div>
    </div>
    <div class="summary-card">
      <div class="summary-num" style="color:${demand.testStats.failing > 0 ? '#f87171' : '#4ade80'}">${demand.testStats.failing}</div>
      <div class="summary-sub">Testes falhando</div>
    </div>
  </div>

  ${gatesTotal > 0 ? `
  <h2>Quality Gates</h2>
  <table>
    <thead><tr><th>Gate</th><th style="text-align:center;">Status</th><th>Resultado</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>` : ''}

  ${criteriaTotal > 0 ? `
  <h2>Critérios de Aceite</h2>
  <table>
    <thead><tr><th>Critério</th><th style="text-align:center;">Status</th></tr></thead>
    <tbody>${criteriaRows}</tbody>
  </table>` : ''}

  <div class="signature">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Aprovação Técnica</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Aprovação de Produto</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Aprovação Executiva</div>
    </div>
  </div>

  <div class="footer">Gerado automaticamente pelo DashDelivery &nbsp;·&nbsp; ${new Date().toLocaleString('pt-BR')}</div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `relatorio-${demand.id}.html`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    setExporting(false)
  }

  return (
    <div className="space-y-5 mt-1">
      {/* Badge de status */}
      <div className="flex items-center gap-3">
        <ShieldCheck size={18} className="text-[#7c6cf0]" />
        <span className="text-sm font-bold text-white uppercase tracking-widest">
          AGUARDANDO APROVAÇÃO HUMANA
        </span>
        <span className="ml-auto px-3 py-1 rounded-full text-[11px] font-bold border bg-[#7c6cf0]/20 border-[#7c6cf0]/30 text-[#a99cf4] uppercase">
          Em revisão
        </span>
      </div>

      {/* Resumo dos gates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Quality Gates</div>
          {gatesTotal === 0 ? (
            <p className="text-sm text-white/30 italic">Nenhum gate configurado.</p>
          ) : (
            <div className="space-y-2">
              {demand.qualityGates.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/60 truncate max-w-[180px]">{g.name}</span>
                  <span className={clsx('font-semibold text-xs uppercase', GATE_COLORS[g.status])}>
                    {g.status}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-border/40 text-xs text-white/40">
                {gatesPassed}/{gatesTotal} gates aprovados
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">
            Critérios de Aceite
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white">
              {criteriaPassed}
              <span className="text-lg text-white/30">/{criteriaTotal}</span>
            </div>
            <div className="text-xs text-white/40">critérios atendidos</div>
          </div>
        </div>
      </div>

      {/* Exportar */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-white/50 text-sm hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          {exporting ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  )
}

// ─── Hook auxiliar ────────────────────────────────────────────────────────────

function useDemand() {
  const { demands, selectedDemandId } = useStore()
  return demands.find((d) => d.id === selectedDemandId) ?? null
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DemandDetail() {
  const { setSelectedDemand } = useStore()
  const demand = useDemand()
  const { demandDetailTab, setDemandDetailTab } = useStore()
  const activeTab = (TABS.some(t => t.id === demandDetailTab) ? demandDetailTab : 'overview') as TabId
  const setActiveTab = (tab: TabId) => setDemandDetailTab(tab)

  if (!demand) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-white/30">Demanda não encontrada.</p>
      </div>
    )
  }

  const priorityClass = PRIORITY_COLORS[demand.priority] ?? 'bg-white/10 text-white/50 border-white/10'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Topo: voltar + header da demanda */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-border space-y-3">
        <button
          onClick={() => setSelectedDemand(null)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-white/30">{demand.id}</span>
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase', priorityClass)}>
                {demand.priority}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mt-1 leading-tight">{demand.title}</h2>
          </div>
        </div>

        {/* TabBar */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-[#7c6cf0]/20 text-[#a99cf4] border border-[#7c6cf0]/30'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'overview' && <TabOverview demand={demand} />}
        {activeTab === 'criteria' && <TabCriteria demand={demand} />}
        {activeTab === 'technical' && <TabTechnical demand={demand} />}
        {activeTab === 'gates' && <TabGates demand={demand} />}
        {activeTab === 'tests' && <TabTests demand={demand} />}
        {activeTab === 'events' && <TabEvents demand={demand} />}
        {activeTab === 'approvals' && <TabApprovals demand={demand} />}
        {activeTab === 'report' && <TabReport demand={demand} />}
      </div>
    </motion.div>
  )
}
