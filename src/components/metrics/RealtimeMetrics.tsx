import { useActiveDemand } from '@/store/useStore'

function Sparkline({ color, positive }: { color: string; positive: boolean }) {
  // Deterministic fake sparkline polyline
  const pts = positive
    ? '0,28 8,24 16,26 24,20 32,22 40,16 48,18 56,12 64,14 72,8 80,10'
    : '0,10 8,14 16,12 24,18 32,16 40,22 48,20 56,26 64,24 72,28 80,26'
  return (
    <svg viewBox="0 0 80 36" className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RealtimeMetrics() {
  const demand = useActiveDemand()

  const TILES = [
    { label: 'Commits',             value: 48,  suffix: '',  change: +12, color: '#7c6cf0' },
    { label: 'Testes Executados',   value: 156, suffix: '',  change: +8,  color: '#3b82f6' },
    { label: 'Cobertura de Código', value: demand?.codeQuality.coverage ?? 87, suffix: '%', change: +5, color: '#22c55e' },
    { label: 'Bugs Encontrados',    value: demand?.testStats.failing ?? 12, suffix: '', change: -15, color: '#ef4444' },
  ]

  return (
    <div className="bg-[--c-surface-2] border border-[--c-border] rounded-xl p-4">
      <div className="text-[10px] font-bold tracking-widest text-white/35 uppercase mb-4">Métricas em Tempo Real</div>
      <div className="grid grid-cols-4 gap-3">
        {TILES.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-2">
            <div className="text-[10px] text-white/35 leading-snug">{tile.label}</div>
            <div className="flex items-end gap-2">
              <span className="text-[24px] font-bold text-white leading-none">{tile.value}{tile.suffix}</span>
              <span className={`text-[11px] font-semibold mb-0.5 ${tile.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tile.change >= 0 ? '+' : ''}{tile.change}%
              </span>
            </div>
            <Sparkline color={tile.color} positive={tile.change >= 0} />
          </div>
        ))}
      </div>
    </div>
  )
}
