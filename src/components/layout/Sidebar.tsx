import React from 'react'
import {
  LayoutDashboard, List, Users, Bot, BarChart2,
  FileText, CheckSquare, TestTube, Clock, Activity,
  Radio, LineChart, Settings, ChevronLeft
} from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'
import { SettingsButton } from '@/components/layout/SettingsPanel'

interface NavItem { icon: React.ReactNode; label: string; key: string }
const nav = (icon: React.ReactNode, label: string, key: string): NavItem => ({ icon, label, key })

const SIDEBAR_TO_DETAIL_TAB: Record<string, string> = {
  summary:    'overview',
  briefing:   'technical',
  criteria:   'criteria',
  tests:      'tests',
  timeline:   'events',
  activities: 'events',
}

const DEMANDA_ITEMS: NavItem[] = [
  nav(<FileText size={14} />,    'Resumo',              'summary'),
  nav(<FileText size={14} />,    'Briefing',            'briefing'),
  nav(<CheckSquare size={14} />, 'Critérios de Aceite', 'criteria'),
  nav(<TestTube size={14} />,    'Testes',              'tests'),
  nav(<Clock size={14} />,       'Timeline',            'timeline'),
  nav(<Activity size={14} />,    'Atividades',          'activities'),
]

const MONITOR_ITEMS: NavItem[] = [
  nav(<Radio size={14} />,      'Agentes em Ação',    'live-agents'),
  nav(<LineChart size={14} />,  'Logs em Tempo Real', 'live-logs'),
  nav(<BarChart2 size={14} />,  'Métricas',           'metrics'),
]

function NavBtn({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all duration-150 text-left',
        active
          ? 'bg-[#7c6cf0] text-white shadow-sm shadow-[#7c6cf0]/30'
          : 'text-white/45 hover:text-white/75 hover:bg-white/5'
      )}
    >
      <span className={clsx('shrink-0', active ? 'text-white/90' : 'text-white/35')}>{item.icon}</span>
      {item.label}
    </button>
  )
}

export function Sidebar() {
  const {
    sidebarView, setSidebarView,
    activeDemandId, setSelectedDemand, setDemandDetailTab,
    openSettings,
  } = useStore()

  function handleNav(key: string) {
    setSidebarView(key)
    const detailTab = SIDEBAR_TO_DETAIL_TAB[key]
    if (detailTab) {
      setDemandDetailTab(detailTab)
      if (activeDemandId) setSelectedDemand(activeDemandId)
    } else {
      setSelectedDemand(null)
    }
  }

  return (
    <aside className="w-[200px] shrink-0 bg-[--c-surface-1] border-r border-[--c-border] flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-[--c-border]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1a2035] border border-[#7c6cf0]/30 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-black text-[#7c6cf0] tracking-tighter leading-none">BRQ</span>
          </div>
          <div>
            <div className="text-[13px] font-bold text-white leading-tight">AgentFlow</div>
            <div className="text-[9px] text-white/30 leading-none mt-0.5">AI Contact Center</div>
          </div>
        </div>
      </div>

      {/* Dashboard (top-level, no section header) */}
      <div className="px-2 pt-3 pb-1">
        <NavBtn
          item={nav(<LayoutDashboard size={14} />, 'Dashboard', 'dashboard')}
          active={sidebarView === 'dashboard'}
          onClick={() => handleNav('dashboard')}
        />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
        {/* Demanda Atual */}
        <div>
          <div className="px-2 py-1.5 text-[9px] font-bold tracking-widest text-white/25 uppercase">
            Demanda Atual
          </div>
          <div className="space-y-0.5">
            {DEMANDA_ITEMS.map(item => (
              <NavBtn key={item.key} item={item} active={sidebarView === item.key} onClick={() => handleNav(item.key)} />
            ))}
          </div>
        </div>

        {/* Monitoramento */}
        <div>
          <div className="px-2 py-1.5 text-[9px] font-bold tracking-widest text-white/25 uppercase">
            Monitoramento
          </div>
          <div className="space-y-0.5">
            {MONITOR_ITEMS.map(item => (
              <NavBtn key={item.key} item={item} active={sidebarView === item.key} onClick={() => handleNav(item.key)} />
            ))}
          </div>
        </div>
      </nav>

      {/* BRQ tagline block */}
      <div className="px-4 py-4 border-t border-[--c-border]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-[#1a2035] border border-[#7c6cf0]/20 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-[#7c6cf0]">BRQ</span>
          </div>
        </div>
        <p className="text-[10px] text-white/25 leading-relaxed">
          Inteligência<br />que conecta.<br />
          <span className="text-white/18">Resultados</span><br />
          <span className="text-white/18">que transformam.</span>
        </p>
      </div>

      {/* Settings footer */}
      <div className="px-3 py-2.5 border-t border-[--c-border] flex items-center gap-2">
        <button
          onClick={openSettings}
          className="flex items-center gap-2 flex-1 text-white/35 hover:text-white/65 transition-colors"
        >
          <Settings size={13} />
          <span className="text-[12px] font-medium">Configurações</span>
        </button>
        <ChevronLeft size={13} className="text-white/20" />
      </div>
    </aside>
  )
}
