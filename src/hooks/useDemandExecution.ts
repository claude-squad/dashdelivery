import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import type { AgentStatus, DomainEvent } from '@/types'
import { STATIONS_3D } from '@/components/office/sceneConstants'

type Phase = {
  agentId:     string
  nextAgentId: string | null
  status:      AgentStatus
  taskFn:      (title: string) => string
  durationMs:  number
  progress:    number
  eventSummaryFn: (title: string) => string
}

// Positions around the meeting table
const MEETING_POSITIONS: Record<string, { x: number; z: number }> = {
  pm:  { x: -0.7, z: 0.8  },
  pe:  { x:  0.7, z: 0.8  },
  tl:  { x: -1.0, z: 1.8  },
  dev: { x:  1.0, z: 1.8  },
  qa:  { x:  0.7, z: 2.8  },
  sec: { x: -0.7, z: 2.8  },
  rel: { x:  0.0, z: 3.0  },
  ux:  { x:  0.0, z: 0.8  },
}

const MEETING_DURATION  = 8000   // ms all at table
const RETURN_DELAY      = 2000   // wait after meeting before first agent types
const DONE_FLASH_MS     = 1200   // how long ✓ shows before handoff walk
const HANDOFF_RETURN_MS = 2500   // time for handoff walk animation + return

const PHASES: Phase[] = [
  {
    agentId: 'pm', nextAgentId: 'pe', status: 'ANALYZING', durationMs: 7000, progress: 15,
    taskFn: (t) => `Analisando requisitos: ${t}`,
    eventSummaryFn: (t) => `PM iniciou análise de produto: ${t}`,
  },
  {
    agentId: 'pe', nextAgentId: 'tl', status: 'PLANNING', durationMs: 6000, progress: 28,
    taskFn: (t) => `Estruturando prompt para: ${t}`,
    eventSummaryFn: (t) => `PE refinando instrução para agentes: ${t}`,
  },
  {
    agentId: 'tl', nextAgentId: 'dev', status: 'PLANNING', durationMs: 7000, progress: 42,
    taskFn: (t) => `Definindo arquitetura: ${t}`,
    eventSummaryFn: (t) => `TL planejando implementação técnica: ${t}`,
  },
  {
    agentId: 'dev', nextAgentId: 'qa', status: 'EXECUTING', durationMs: 14000, progress: 62,
    taskFn: (t) => `Implementando: ${t}`,
    eventSummaryFn: (t) => `Dev Agent iniciou implementação: ${t}`,
  },
  {
    agentId: 'qa', nextAgentId: 'sec', status: 'VALIDATING', durationMs: 8000, progress: 78,
    taskFn: (t) => `Testando: ${t}`,
    eventSummaryFn: (t) => `QA validando entrega: ${t}`,
  },
  {
    agentId: 'sec', nextAgentId: 'rel', status: 'ANALYZING', durationMs: 6000, progress: 88,
    taskFn: (t) => `Security scan: ${t}`,
    eventSummaryFn: (t) => `Security Agent auditando: ${t}`,
  },
  {
    agentId: 'rel', nextAgentId: null, status: 'EXECUTING', durationMs: 4000, progress: 100,
    taskFn: (t) => `Preparando release: ${t}`,
    eventSummaryFn: (t) => `Release Agent preparando entrega: ${t}`,
  },
]

export function useDemandExecution() {
  const { demands } = useStore()
  const processedIds = useRef(new Set<string>())

  useEffect(() => {
    const newDrafts = demands.filter(
      (d) => d.status === 'DRAFT' && !processedIds.current.has(d.id)
    )
    if (newDrafts.length === 0) return

    for (const demand of newDrafts) {
      processedIds.current.add(demand.id)

      const { setDemoMode, setActiveDemand } = useStore.getState()
      setDemoMode(false)
      setActiveDemand(demand.id)

      const title    = demand.title
      const demandId = demand.id

      // ── PHASE 0: MEETING — all agents walk to table simultaneously ──────
      setTimeout(() => {
        const store = useStore.getState()
        Object.keys(MEETING_POSITIONS).forEach((agentId) => {
          store.updateAgentInstance(agentId, {
            status:      'ANALYZING',
            currentTask: `Reunião: ${title}`,
            walkTarget:  MEETING_POSITIONS[agentId],
          })
        })
        store.updateDemand(demandId, { status: 'ANALYSIS' as const, progress: 5 })
      }, 0)

      // ── CLEAR MEETING: all return to stations ──────────────────────────
      setTimeout(() => {
        const store = useStore.getState()
        Object.keys(MEETING_POSITIONS).forEach((agentId) => {
          store.updateAgentInstance(agentId, {
            status:      'IDLE',
            currentTask: '',
            walkTarget:  null,
          })
        })
      }, MEETING_DURATION)

      // ── SEQUENTIAL DESK WORK ──────────────────────────────────────────
      let elapsed = MEETING_DURATION + RETURN_DELAY

      PHASES.forEach((phase, index) => {
        const phaseStart = elapsed

        // Agent starts working at their own desk (walkTarget stays null)
        setTimeout(() => {
          const store  = useStore.getState()
          const now    = new Date()
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

          store.updateAgentInstance(phase.agentId, {
            status:       phase.status,
            currentTask:  phase.taskFn(title),
            lastActivity: timeStr,
            demandId,
            walkTarget:   null,   // at own desk
            taskComplete: false,
          })
          store.updateDemand(demandId, { progress: phase.progress })

          const ev: DomainEvent = {
            id:           `ev-exec-${demandId}-${index}`,
            eventType:    'agent.task_started',
            timestamp:    now.toISOString(),
            demandId,
            agentId:      phase.agentId,
            summary:      phase.eventSummaryFn(title),
            metadata:     { phase: index + 1 },
            correlationId: `corr-exec-${demandId}-${index}`,
          }
          store.pushEvent(ev)
        }, phaseStart)

        // DEV tool cycle mid-phase
        if (phase.agentId === 'dev') {
          setTimeout(() => {
            const store = useStore.getState()
            const dev   = store.agentInstances['dev']
            if (dev && dev.status !== 'IDLE') {
              store.updateAgentInstance('dev', {
                status:      'RUNNING_TOOL',
                currentTask: 'Executando ferramentas de análise de código',
              })
            }
          }, phaseStart + 5000)

          setTimeout(() => {
            const store = useStore.getState()
            const dev   = store.agentInstances['dev']
            if (dev && dev.status !== 'IDLE') {
              store.updateAgentInstance('dev', {
                status:      'EXECUTING',
                currentTask: `Finalizando implementação: ${title}`,
              })
            }
          }, phaseStart + 9000)
        }

        elapsed += phase.durationMs

        // ── AGENT FINISHES: taskComplete flash ─────────────────────────
        setTimeout(() => {
          useStore.getState().updateAgentInstance(phase.agentId, { taskComplete: true })
        }, elapsed)

        if (phase.nextAgentId) {
          const nextStation = STATIONS_3D[phase.nextAgentId]

          // Handoff walk: current agent walks to next agent's desk
          setTimeout(() => {
            const store = useStore.getState()
            store.updateAgentInstance(phase.agentId, {
              status:       'IDLE',
              currentTask:  '',
              taskComplete: false,
              walkTarget:   nextStation ? { x: nextStation.x, z: nextStation.z } : null,
            })
          }, elapsed + DONE_FLASH_MS)

          // Current agent returns to own desk
          setTimeout(() => {
            useStore.getState().updateAgentInstance(phase.agentId, { walkTarget: null })
          }, elapsed + DONE_FLASH_MS + HANDOFF_RETURN_MS)

          // Next phase starts right after done flash
          elapsed += DONE_FLASH_MS
        } else {
          // Last agent (REL): cleanup and complete demand
          setTimeout(() => {
            const store = useStore.getState()
            store.updateAgentInstance(phase.agentId, {
              status:       'IDLE',
              currentTask:  '',
              taskComplete: false,
              walkTarget:   null,
            })
            store.updateDemand(demandId, { status: 'DONE' as const, progress: 100 })
            store.pushEvent({
              id:           `ev-exec-${demandId}-done`,
              eventType:    'demand.completed',
              timestamp:    new Date().toISOString(),
              demandId,
              summary:      `Demanda "${title}" concluída com sucesso`,
              metadata:     {},
              correlationId: `corr-exec-${demandId}-done`,
            })
          }, elapsed + DONE_FLASH_MS + 1500)
        }
      })
    }
  }, [demands])
}
