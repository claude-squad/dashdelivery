import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PipelineSteps } from '@/components/pipeline/PipelineSteps'
import { AgentOffice3D } from '@/components/office/AgentOffice3D'
import { AgentList } from '@/components/agents/AgentList'
import { ActivityStream } from '@/components/activity/ActivityStream'
import { MetricsBar } from '@/components/metrics/MetricsBar'
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

export default function App() {
  useSocket()
  useDemoTick()
  useGateExecution()
  useDemandExecution()

  const { selectedDemandId } = useStore()

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <PipelineSteps />

        <AnimatePresence mode="wait">
          {selectedDemandId ? (
            <motion.div
              key="detail"
              className="flex-1 min-h-0 overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DemandDetail />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              className="flex-1 overflow-y-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 space-y-3">
                {/* Top info cards row */}
                <div className="grid grid-cols-4 gap-3">
                  <DemandSummaryCard />
                  <AcceptanceCriteriaCard />
                  <PromptEngineerCard />
                  <ExecutionPlanCard />
                </div>

                {/* Central row: Agent List | Virtual Office | Activity Stream */}
                <div className="grid grid-cols-[220px_1fr_220px] gap-3">
                  <div className="bg-surface-2 border border-border rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                        Agentes em Ação
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">
                        Tempo Real
                      </span>
                    </div>
                    <AgentList />
                  </div>

                  <AgentOffice3D />

                  <div className="bg-surface-2 border border-border rounded-xl p-3 flex flex-col gap-2">
                    <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                      Atividades Recentes
                    </div>
                    <ActivityStream />
                  </div>
                </div>

                <MetricsBar />
                <DemandListPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GateExecutionBar />
      <AgentDrawer />
      <NewDemandModal />
    </div>
  )
}
