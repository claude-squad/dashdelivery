import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Demand, AgentInstance, AgentDefinition, DomainEvent, QualityGate } from '@/types'
import { DEMO_DEMAND, DEMO_AGENT_INSTANCES, AGENT_DEFINITIONS } from '@/lib/demo'

interface AppState {
  isDemoMode: boolean
  activeDemandId: string | null
  demands: Demand[]
  agentDefinitions: AgentDefinition[]
  agentInstances: Record<string, AgentInstance>
  events: DomainEvent[]
  selectedAgentId: string | null
  sidebarTab: 'overview' | 'demand' | 'monitor'

  // Nova Demanda Modal
  isNewDemandOpen: boolean
  openNewDemand: () => void
  closeNewDemand: () => void

  // Demanda selecionada para detalhe
  selectedDemandId: string | null
  setSelectedDemand: (id: string | null) => void

  // Gate Execution (não persiste no F5)
  gateExecution: {
    isRunning: boolean
    demandId: string
    demandTitle: string
    currentGateName: string | null
    currentAgentId: string | null
    completed: number
    total: number
    failed: number
  } | null

  // Execução pendente — sinaliza ao hook em App.tsx para iniciar sem depender do componente montado
  pendingExecution: {
    demandId: string
    gates: import('@/types').QualityGate[]
  } | null
  setPendingExecution: (v: AppState['pendingExecution']) => void

  setDemoMode: (v: boolean) => void
  setActiveDemand: (id: string) => void
  setSelectedAgent: (id: string | null) => void
  setSidebarTab: (tab: AppState['sidebarTab']) => void
  updateAgentInstance: (id: string, patch: Partial<AgentInstance>) => void
  pushEvent: (event: DomainEvent) => void
  setGateExecution: (state: AppState['gateExecution']) => void

  addDemand: (demand: Demand) => void
  approveDemand: (id: string, comment: string) => void
  rejectDemand: (id: string, reason: string) => void
  updateDemandGate: (demandId: string, gateId: string, patch: Partial<QualityGate>) => void
}

export const useStore = create<AppState>()(persist((set) => ({
  isDemoMode: true,
  activeDemandId: DEMO_DEMAND.id,
  demands: [DEMO_DEMAND],
  agentDefinitions: AGENT_DEFINITIONS,
  agentInstances: DEMO_AGENT_INSTANCES,
  events: DEMO_DEMAND.events,
  selectedAgentId: null,
  sidebarTab: 'overview',

  isNewDemandOpen: false,
  openNewDemand: () => set({ isNewDemandOpen: true }),
  closeNewDemand: () => set({ isNewDemandOpen: false }),

  selectedDemandId: null,
  setSelectedDemand: (id) => set({ selectedDemandId: id }),

  gateExecution: null,

  pendingExecution: null,
  setPendingExecution: (v) => set({ pendingExecution: v }),

  setDemoMode: (v) => set({ isDemoMode: v }),
  setActiveDemand: (id) => set({ activeDemandId: id }),
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  updateAgentInstance: (id, patch) =>
    set((s) => ({
      agentInstances: { ...s.agentInstances, [id]: { ...s.agentInstances[id], ...patch } },
    })),
  pushEvent: (event) => set((s) => ({ events: [event, ...s.events] })),
  setGateExecution: (state) => set({ gateExecution: state }),

  addDemand: (demand) =>
    set((s) => ({ demands: [...s.demands, demand] })),

  approveDemand: (id) =>
    set((s) => ({
      demands: s.demands.map((d) =>
        d.id === id ? { ...d, status: 'DONE' as const } : d
      ),
    })),

  rejectDemand: (id) =>
    set((s) => ({
      demands: s.demands.map((d) =>
        d.id === id ? { ...d, status: 'BLOCKED' as const } : d
      ),
    })),

  updateDemandGate: (demandId, gateId, patch) =>
    set((s) => ({
      demands: s.demands.map((d) => {
        if (d.id !== demandId) return d

        const updatedGates = d.qualityGates.map((g) =>
          g.id === gateId ? { ...g, ...patch } : g
        )

        const mandatoryGates = updatedGates.filter((g) => g.mandatory)
        const allPassed = mandatoryGates.length > 0 && mandatoryGates.every((g) => g.status === 'passed')
        const anyFailed = mandatoryGates.some((g) => g.status === 'failed')

        if (allPassed) {
          const DONE_STAGES = ['code_review', 'security_review', 'criteria_validation', 'evidence', 'delivery_report']
          const updatedStages = d.workflowStages.map((stage) => {
            if (DONE_STAGES.includes(stage.id) && (stage.status === 'active' || stage.status === 'pending')) {
              return { ...stage, status: 'done' as const }
            }
            if (stage.id === 'human_approval') {
              return { ...stage, status: 'active' as const }
            }
            return stage
          })
          return { ...d, qualityGates: updatedGates, workflowStages: updatedStages, progress: 90, status: 'APPROVAL' as const }
        }

        if (anyFailed) {
          const updatedStages = d.workflowStages.map((stage) =>
            stage.id === 'fix_failures' ? { ...stage, status: 'active' as const } : stage
          )
          return { ...d, qualityGates: updatedGates, workflowStages: updatedStages, status: 'BLOCKED' as const }
        }

        return { ...d, qualityGates: updatedGates }
      }),
    })),
}), {
  name: 'dashdelivery-demands',
  version: 3,
  // DEMO_DEMAND nunca persiste — sempre carrega fresco de demo.ts
  partialize: (state) => ({
    demands: state.demands.filter(d => d.id !== DEMO_DEMAND.id),
  }),
  // Migração: versões antigas salvavam DEMO_DEMAND corrompido — descarta e reinicia com fresco
  migrate: (_persisted: unknown, version: number) => {
    if (version < 3) return { demands: [] }
    return _persisted as { demands: Demand[] }
  },
  // Na reidratação: injeta DEMO_DEMAND fresco + demandas do usuário (sem DEMO_DEMAND antigo)
  merge: (persisted: unknown, current: AppState) => ({
    ...current,
    demands: [
      DEMO_DEMAND,
      ...((persisted as { demands?: Demand[] }).demands ?? []).filter(d => d.id !== DEMO_DEMAND.id),
    ],
  }),
}))

export const useActiveDemand = () => {
  const { demands, activeDemandId } = useStore()
  return demands.find((d) => d.id === activeDemandId) ?? null
}
