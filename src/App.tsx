import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { ApprovalGateModal } from '@/components/demand/ApprovalGateModal'
import { PRPreviewModal } from '@/components/demand/PRPreviewModal'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PipelineSteps } from '@/components/pipeline/PipelineSteps'
import { AgentOffice3D } from '@/components/office/AgentOffice3D'
import { AgentList } from '@/components/agents/AgentList'
import { ActivityStream } from '@/components/activity/ActivityStream'
import { MetricsBar } from '@/components/metrics/MetricsBar'
import { RealtimeMetrics } from '@/components/metrics/RealtimeMetrics'
import { ProjectInfoCard } from '@/components/project/ProjectInfoCard'
import {
  DemandSummaryCard,
  AcceptanceCriteriaCard,
  PromptEngineerCard,
  ExecutionPlanCard,
} from '@/components/demand/DemandCards'
import { DemandListPanel } from '@/components/demand/DemandListPanel'
import { AgentDrawer } from '@/components/agents/AgentDrawer'
import { NewDemandModal } from '@/components/demand/NewDemandModal'
import { DemandDetail } from '@/components/demand/DemandDetail'
import { GateExecutionBar } from '@/components/gates/GateExecutionBar'
import { useDemoTick } from '@/hooks/useDemoTick'
import { useSocket } from '@/hooks/useSocket'
import { useGateExecution } from '@/hooks/useGateExecution'
import { useDemandExecution } from '@/hooks/useDemandExecution'
import { useStore } from '@/store/useStore'
import { SettingsPanel } from '@/components/layout/SettingsPanel'
import { Users } from 'lucide-react'

export default function App() {
  useSocket()
  useDemoTick()
  useGateExecution()
  useDemandExecution()

  const { selectedDemandId, isSettingsOpen, closeSettings, sidebarView, theme, pendingApproval, pendingPR } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <PipelineSteps />

        {/* ── Main content — switches based on sidebar nav ─────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selectedDemandId ? (
              <motion.div key="detail" className="flex-1 min-h-0 overflow-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <DemandDetail />
              </motion.div>
            ) : sidebarView === 'demands' ? (
              <motion.div key="demands" className="flex-1 overflow-y-auto p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <DemandListPanel />
              </motion.div>
            ) : sidebarView === 'live-agents' ? (
              <motion.div key="live-agents" className="flex-1 min-h-0 flex gap-3 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="flex-1 min-h-0"><AgentOffice3D /></div>
                <div className="w-52 bg-surface-2 border border-border rounded-xl p-3 overflow-y-auto shrink-0">
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">Squad</div>
                  <AgentList />
                </div>
              </motion.div>
            ) : sidebarView === 'live-logs' ? (
              <motion.div key="live-logs" className="flex-1 overflow-y-auto p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="bg-surface-2 border border-border rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3">Logs em Tempo Real</div>
                  <ActivityStream />
                </div>
              </motion.div>
            ) : sidebarView === 'metrics' ? (
              <motion.div key="metrics" className="flex-1 overflow-y-auto p-4 space-y-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <MetricsBar />
              </motion.div>
            ) : sidebarView === 'agents' ? (
              <motion.div key="agents" className="flex-1 overflow-y-auto p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="bg-surface-2 border border-border rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3">Agentes do Squad</div>
                  <AgentList />
                </div>
              </motion.div>
            ) : sidebarView === 'reports' ? (
              <motion.div key="reports" className="flex-1 overflow-y-auto p-4 space-y-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <MetricsBar />
                <div className="bg-surface-2 border border-border rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3">Atividades Recentes</div>
                  <ActivityStream />
                </div>
              </motion.div>
            ) : sidebarView === 'squads' ? (
              <motion.div key="squads" className="flex-1 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="text-center space-y-2">
                  <Users size={40} className="text-white/10 mx-auto" />
                  <div className="text-sm text-white/30">Gestão de Squads em desenvolvimento</div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="dashboard" className="flex-1 min-h-0 flex flex-col overflow-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {/* Metrics strip — full width */}
                <div className="px-4 pt-4 shrink-0">
                  <MetricsBar />
                </div>

                {/* Two-column body */}
                <div className="flex-1 min-h-0 grid grid-cols-[2fr_3fr] gap-3 p-4 pt-3 overflow-hidden">

                  {/* LEFT — Gestão da Demanda */}
                  <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7c6cf0] shrink-0" />
                      <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">Gestão da Demanda</span>
                    </div>
                    <div className="shrink-0"><ProjectInfoCard /></div>
                    <div className="shrink-0"><RealtimeMetrics /></div>
                    <div className="flex-1 min-h-0 bg-[--c-surface-2] border border-[--c-border] rounded-xl flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[--c-border] shrink-0">
                        <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Atividades Recentes</span>
                        <button className="text-[10px] text-[#7c6cf0] hover:text-[#9d91f5] font-medium transition-colors">Ver todas</button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-3 py-2">
                        <ActivityStream />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Escritório Virtual */}
                  <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                      <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">Escritório Virtual</span>
                    </div>
                    <div className="flex-1 min-h-0">
                      <AgentOffice3D />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <GateExecutionBar />
      <AgentDrawer />
      <NewDemandModal />
      {isSettingsOpen && <SettingsPanel onClose={closeSettings} />}
      {pendingApproval && <ApprovalGateModal />}
      {pendingPR && <PRPreviewModal />}
    </div>
  )
}
