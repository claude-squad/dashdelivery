import React from 'react'
import {
  LayoutDashboard, List, Users, Bot, BarChart2,
  FileText, CheckSquare, TestTube, Clock, Activity,
  Radio, LineChart, Zap
} from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'
import { SettingsButton } from '@/components/layout/SettingsPanel'

interface NavItem { icon: React.ReactNode; label: string; key: string }
const nav = (icon: React.ReactNode, label: string, key: string): NavItem => ({ icon, label, key })
const section = (label: string, items: NavItem[]) => ({ label, items })

// Map sidebar keys → DemandDetail tab IDs (for DEMANDA ATUAL section)
const DETAIL_TAB_MAP: Record<string, string> = {
  summary:    'overview',
  briefing:   'technical',
  criteria:   'criteria',
  tests:      'tests',
  timeline:   'events',
  activities: 'events',
}

const SECTIONS = [
  section('VISÃO GERAL', [
    nav(<LayoutDashboard size={15} />, 'Dashboard',  'dashboard'),
    nav(<List size={15} />,            'Demandas',   'demands'),
    nav(<Users size={15} />,           'Squads',     'squads'),
    nav(<Bot size={15} />,             'Agentes',    'agents'),
    nav(<BarChart2 size={15} />,       'Relatórios', 'reports'),
  ]),
  section('DEMANDA ATUAL', [
    nav(<FileText size={15} />,    'Resumo',              'summary'),
    nav(<FileText size={15} />,    'Briefing',            'briefing'),
    nav(<CheckSquare size={15} />, 'Critérios de Aceite', 'criteria'),
    nav(<TestTube size={15} />,    'Testes',              'tests'),
    nav(<Clock size={15} />,       'Timeline',            'timeline'),
    nav(<Activity size={15} />,    'Atividades',          'activities'),
  ]),
  section('MONITORAMENTO', [
    nav(<Radio size={15} />,     'Agentes em Ação',   'live-agents'),
    nav(<LineChart size={15} />, 'Logs em Tempo Real', 'live-logs'),
    nav(<BarChart2 size={15} />, 'Métricas',           'metrics'),
  ]),
]

export function Sidebar() {
  const {
    sidebarView,
    setSidebarView,
    activeDemandId,
    setSelectedDemand,
    setDemandDetailTab,
  } = useStore()

  function handleNav(key: string) {
    setSidebarView(key)
    const detailTab = DETAIL_TAB_MAP[key]
    if (detailTab) {
      // Open DemandDetail with the correct tab
      setDemandDetailTab(detailTab)
      if (activeDemandId) setSelectedDemand(activeDemandId)
    } else {
      // Non-detail views: close any open demand detail
      setSelectedDemand(null)
    }
  }

  return (
    <aside className="w-[196px] shrink-0 bg-surface-1 border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-none">AgentFlow</div>
            <div className="text-[10px] text-white/40 mt-0.5 leading-none">AI Squad Orchestration</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.label}>
            <div className="px-2 mb-1.5 text-[9px] font-semibold tracking-widest text-white/30 uppercase">
              {s.label}
            </div>
            {s.items.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 text-left',
                  sidebarView === item.key
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <span className="opacity-80">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="px-2 py-3 border-t border-border flex items-center gap-1">
        <SettingsButton />
        <span className="text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors">
          Configurações
        </span>
      </div>
    </aside>
  )
}
