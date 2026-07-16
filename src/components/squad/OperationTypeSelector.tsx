import { BookOpen, Play, GitPullRequest } from 'lucide-react'
import type { OperationType } from '@/types/squad'

const TYPES = [
  {
    type: 'learn' as OperationType,
    icon: BookOpen,
    label: 'Aprender',
    sub: 'Pesquisa & Documentação',
    description: 'O squad pesquisa um tema, estrutura o conhecimento e gera documentação com commit no repositório.',
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20 hover:border-cyan-500/50',
  },
  {
    type: 'execute' as OperationType,
    icon: Play,
    label: 'Executar',
    sub: 'Implementação de Demanda',
    description: 'O squad analisa, planeja, implementa e entrega código com testes, validação e Pull Request.',
    color: '#22c55e',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20 hover:border-green-500/50',
  },
  {
    type: 'validate' as OperationType,
    icon: GitPullRequest,
    label: 'Validar',
    sub: 'Auditoria GitHub',
    description: 'O squad analisa um PR, branch ou repositório GitHub — code review, testes e relatório de qualidade.',
    color: '#8b5cf6',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20 hover:border-violet-500/50',
  },
]

interface Props {
  onSelect: (type: OperationType) => void
}

export function OperationTypeSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7c6cf0] shrink-0" />
        <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">Selecione a modalidade de operação</span>
      </div>

      <div className="flex flex-col gap-3">
        {TYPES.map(({ type, icon: Icon, label, sub, description, color, bg, border }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group ${bg} ${border}`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${color}20`, border: `1px solid ${color}40` }}
            >
              <Icon size={16} style={{ color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px] font-semibold text-white/90">{label}</span>
                <span
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color, background: `${color}15` }}
                >
                  {sub}
                </span>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed">{description}</p>
            </div>

            <div
              className="shrink-0 mt-1 w-5 h-5 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ borderColor: color, color }}
            >
              <span className="text-[10px] font-bold">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
