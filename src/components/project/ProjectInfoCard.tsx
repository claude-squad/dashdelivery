import { useActiveDemand } from '@/store/useStore'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-white/30">{label}</span>
      <span className="text-[12px] font-semibold text-white/80">{value}</span>
    </div>
  )
}

export function ProjectInfoCard() {
  const demand = useActiveDemand()

  const createdAt = demand
    ? new Date(demand.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ', ' + new Date(demand.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--'

  const updatedAt = demand
    ? new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--'

  return (
    <div className="bg-[--c-surface-2] border border-[--c-border] rounded-xl p-4">
      <div className="text-[10px] font-bold tracking-widest text-white/35 uppercase mb-4">Informações do Projeto</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <InfoRow label="Cliente" value="BRQ Digital Solutions" />
        <InfoRow label="Criado em" value={createdAt} />
        <InfoRow label="Projeto" value={demand?.title ?? 'Sem projeto ativo'} />
        <InfoRow label="Última atualização" value={updatedAt} />
      </div>
    </div>
  )
}
