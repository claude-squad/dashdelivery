import { AlertTriangle, GitBranch, Shield, X, Check } from 'lucide-react'
import type { HumanApproval } from '@/types/squad'

const ACTION_LABELS: Record<string, string> = {
  create_branch: 'Criar branch',
  commit: 'Commit & push',
  create_pr: 'Criar Pull Request',
  overwrite_file: 'Sobrescrever arquivo',
  save_project: 'Salvar projeto',
  fix_code: 'Aplicar correção de código',
  merge_pr: 'Fazer merge do PR',
}

interface Props {
  approval: HumanApproval
  onApprove: (id: string) => void
  onCancel: (id: string) => void
}

export function HumanApprovalModal({ approval, onApprove, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onCancel(approval.id)} />

      <div className="relative w-full max-w-md bg-[--c-surface-2] border border-[--c-border] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Shield size={13} className="text-amber-400" />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-white/90">Aprovação humana necessária</div>
              <div className="text-[9px] text-white/30">Ação crítica detectada pelo squad</div>
            </div>
          </div>
          <button onClick={() => onCancel(approval.id)} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Action badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-amber-300">{ACTION_LABELS[approval.action] ?? approval.action}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{approval.summary}</div>
            </div>
          </div>

          {/* Repository & branch */}
          {(approval.repository || approval.branch) && (
            <div className="flex gap-2 flex-wrap">
              {approval.repository && (
                <div className="flex items-center gap-1.5 bg-black/20 border border-border/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-[9px] text-white/30">Repositório:</span>
                  <span className="text-[10px] font-medium text-white/70">{approval.repository}</span>
                </div>
              )}
              {approval.branch && (
                <div className="flex items-center gap-1.5 bg-black/20 border border-border/50 rounded-lg px-2.5 py-1.5">
                  <GitBranch size={10} className="text-[#7c6cf0]" />
                  <span className="text-[10px] font-medium text-white/70">{approval.branch}</span>
                </div>
              )}
            </div>
          )}

          {/* Files */}
          {approval.affectedFiles.length > 0 && (
            <div>
              <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase mb-2">Arquivos afetados</div>
              <div className="bg-black/20 border border-border/40 rounded-xl p-3 max-h-28 overflow-y-auto">
                {approval.affectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#7c6cf0]/60 shrink-0" />
                    <span className="text-[10px] text-white/50 font-mono">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {approval.risks.length > 0 && (
            <div>
              <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase mb-2">Riscos</div>
              <div className="flex flex-col gap-1">
                {approval.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle size={10} className="text-amber-400/60 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-white/40">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border/50">
          <button
            onClick={() => onCancel(approval.id)}
            className="flex-1 py-2 rounded-xl border border-border text-[12px] text-white/40 hover:text-white/60 hover:border-border/80 transition-colors"
          >
            <X size={12} className="inline mr-1" />
            Cancelar operação
          </button>
          <button
            onClick={() => onApprove(approval.id)}
            className="flex-1 py-2 rounded-xl bg-[#7c6cf0]/20 border border-[#7c6cf0]/40 text-[#a799ff] text-[12px] font-semibold hover:bg-[#7c6cf0]/30 transition-colors"
          >
            <Check size={12} className="inline mr-1" />
            Autorizar
          </button>
        </div>
      </div>
    </div>
  )
}
