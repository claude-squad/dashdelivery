import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, ShieldAlert, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

interface ApprovalPanelProps {
  demandId: string
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_requested'
  requestedBy?: string
  requestedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  blockedGates?: string[]
  onApprove: (comment: string) => void
  onReject: (reason: string) => void
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ApprovalPanel({
  approvalStatus,
  requestedBy,
  requestedAt,
  approvedBy,
  approvedAt,
  rejectionReason,
  blockedGates = [],
  onApprove,
  onReject,
}: ApprovalPanelProps) {
  const [approveComment, setApproveComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  // ─── not_requested ───────────────────────────────────────────────────────────
  if (approvalStatus === 'not_requested') {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-white/30" />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-white/60">
              Aprovação não solicitada ainda
            </p>
            <p className="text-xs text-white/40">
              Os quality gates precisam passar antes de solicitar aprovação humana.
            </p>

            {blockedGates.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/70">
                  Gates bloqueando aprovação
                </p>
                <ul className="flex flex-col gap-1">
                  {blockedGates.map((gate) => (
                    <li
                      key={gate}
                      className="flex items-center gap-2 text-xs text-amber-400/60"
                    >
                      <span className="h-1 w-1 rounded-full bg-amber-400/60" />
                      {gate}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // ─── approved ────────────────────────────────────────────────────────────────
  if (approvalStatus === 'approved') {
    return (
      <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={28} className="shrink-0 text-emerald-400" />
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold tracking-wide text-emerald-400">
              APROVADO
            </span>
            <span className="text-xs text-white/40">
              Por{' '}
              <span className="font-medium text-white/60">{approvedBy ?? '—'}</span>
              {' · '}
              {formatDateTime(approvedAt)}
            </span>
          </div>
        </div>
        {approveComment && (
          <p className="mt-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-4 py-2.5 text-sm text-white/70">
            {approveComment}
          </p>
        )}
      </section>
    )
  }

  // ─── rejected ────────────────────────────────────────────────────────────────
  if (approvalStatus === 'rejected') {
    return (
      <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <div className="flex items-center gap-3">
          <XCircle size={28} className="shrink-0 text-red-400" />
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold tracking-wide text-red-400">
              REPROVADO
            </span>
            <span className="text-xs text-white/40">
              Por{' '}
              <span className="font-medium text-white/60">{approvedBy ?? '—'}</span>
              {' · '}
              {formatDateTime(approvedAt)}
            </span>
          </div>
        </div>
        {rejectionReason && (
          <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400/70">
              Motivo
            </p>
            <p className="text-sm text-red-300/90">{rejectionReason}</p>
          </div>
        )}
      </section>
    )
  }

  // ─── pending ─────────────────────────────────────────────────────────────────
  return (
    <section className="flex flex-col gap-4">
      {/* Animated warning banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3"
      >
        <motion.div
          className="absolute inset-0 bg-amber-500/5"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          <p className="text-xs font-bold tracking-wide text-amber-300">
            AGUARDANDO APROVAÇÃO HUMANA — A execução está pausada
          </p>
        </div>
      </motion.div>

      {/* Request details */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-white/80">
            Aprovação pendente
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-white/30">Solicitado por</span>
            <span className="font-medium text-white/70">{requestedBy ?? '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white/30">Em</span>
            <span className="font-medium text-white/70">
              {formatDateTime(requestedAt)}
            </span>
          </div>
        </div>

        {/* Approve textarea */}
        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/40">
            Comentário (opcional)
          </label>
          <textarea
            rows={2}
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            placeholder="Adicione um comentário de aprovação..."
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition"
          />
        </div>

        {/* Reject textarea */}
        <div className="mb-5 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/40">
            Motivo da Rejeição{' '}
            <span className="text-red-400/70">(obrigatório para reprovar)</span>
          </label>
          <textarea
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Descreva o motivo da reprovação..."
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(approveComment)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/25 active:scale-[0.98]"
          >
            <CheckCircle2 size={16} />
            Aprovar Entrega
          </button>
          <button
            onClick={() => onReject(rejectReason)}
            disabled={!rejectReason.trim()}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-bold transition active:scale-[0.98]',
              rejectReason.trim()
                ? 'border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25'
                : 'cursor-not-allowed border-white/10 bg-white/[0.02] text-white/20',
            )}
          >
            <XCircle size={16} />
            Reprovar
          </button>
        </div>

        {/* Audit warning */}
        <p className="mt-3 text-center text-[11px] text-white/25">
          Esta ação é irreversível e será registrada em auditoria
        </p>
      </div>
    </section>
  )
}
