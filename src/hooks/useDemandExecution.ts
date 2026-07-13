import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import type { AgentStatus, DomainEvent } from '@/types'

type Phase = {
  agentId: string
  status: AgentStatus
  taskFn: (title: string) => string
  durationMs: number
  progress: number
  eventSummaryFn: (title: string) => string
}

// Seats around the meeting table at [0, 1.8] — agents walk here during their phase
const MEETING_POSITIONS: Record<string, { x: number; z: number }> = {
  pm:  { x: -0.7, z: 0.8  },  // north-west
  pe:  { x:  0.7, z: 0.8  },  // north-east
  tl:  { x: -1.0, z: 1.8  },  // west
  dev: { x:  1.0, z: 1.8  },  // east
  qa:  { x:  0.7, z: 2.8  },  // south-east
  sec: { x: -0.7, z: 2.8  },  // south-west
  rel: { x:  0.0, z: 3.0  },  // south
  ux:  { x:  0.0, z: 0.8  },  // north
}

const PHASES: Phase[] = [
  { agentId: 'pm',  status: 'ANALYZING',  durationMs: 6000,  progress: 15,
    taskFn: (t) => `Analisando requisitos: ${t}`,
    eventSummaryFn: (t) => `PM iniciou análise de produto: ${t}` },

  { agentId: 'pe',  status: 'PLANNING',   durationMs: 6000,  progress: 28,
    taskFn: (t) => `Estruturando prompt para: ${t}`,
    eventSummaryFn: (t) => `PE refinando instrução para agentes: ${t}` },

  { agentId: 'tl',  status: 'PLANNING',   durationMs: 8000,  progress: 42,
    taskFn: (t) => `Definindo arquitetura: ${t}`,
    eventSummaryFn: (t) => `TL planejando implementação técnica: ${t}` },

  { agentId: 'dev', status: 'EXECUTING',  durationMs: 16000, progress: 62,
    taskFn: (t) => `Implementando: ${t}`,
    eventSummaryFn: (t) => `Dev Agent iniciou implementação: ${t}` },

  { agentId: 'qa',  status: 'VALIDATING', durationMs: 9000,  progress: 78,
    taskFn: (t) => `Testando: ${t}`,
    eventSummaryFn: (t) => `QA validando entrega: ${t}` },

  { agentId: 'sec', status: 'ANALYZING',  durationMs: 6000,  progress: 88,
    taskFn: (t) => `Security scan: ${t}`,
    eventSummaryFn: (t) => `Security Agent auditando: ${t}` },

  { agentId: 'rel', status: 'EXECUTING',  durationMs: 5000,  progress: 100,
    taskFn: (t) => `Preparando release: ${t}`,
    eventSummaryFn: (t) => `Release Agent preparando entrega: ${t}` },
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
      let elapsed    = 0

      PHASES.forEach((phase, index) => {
        const delay      = elapsed
        const prevAgentId = index > 0 ? PHASES[index - 1].agentId : null

        // Phase start: walk to meeting table + begin working status
        setTimeout(() => {
          const store = useStore.getState()
          const now   = new Date()
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

          // Previous agent walks back to station and becomes idle
          if (prevAgentId) {
            store.updateAgentInstance(prevAgentId, {
              status:     'IDLE',
              currentTask: '',
              walkTarget:  null,  // triggers walk-back to station
            })
          }

          // Current agent walks to meeting table and starts working
          store.updateAgentInstance(phase.agentId, {
            status:     phase.status,
            currentTask: phase.taskFn(title),
            lastActivity: timeStr,
            demandId,
            walkTarget:  MEETING_POSITIONS[phase.agentId] ?? null,
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
        }, delay)

        // Dev: RUNNING_TOOL cycle in the middle of its phase
        if (phase.agentId === 'dev') {
          setTimeout(() => {
            const store = useStore.getState()
            const dev   = store.agentInstances['dev']
            if (dev && dev.status !== 'IDLE') {
              store.updateAgentInstance('dev', {
                status:     'RUNNING_TOOL',
                currentTask: 'Executando ferramentas de análise de código',
              })
            }
          }, delay + 6000)

          setTimeout(() => {
            const store = useStore.getState()
            const dev   = store.agentInstances['dev']
            if (dev && dev.status !== 'IDLE') {
              store.updateAgentInstance('dev', {
                status:     'EXECUTING',
                currentTask: `Finalizando implementação: ${title}`,
              })
            }
          }, delay + 11000)
        }

        elapsed += phase.durationMs
      })

      // Final cleanup: last agent walks back, demand completes
      const lastAgentId = PHASES[PHASES.length - 1].agentId
      setTimeout(() => {
        const store = useStore.getState()
        store.updateAgentInstance(lastAgentId, {
          status:     'IDLE',
          currentTask: '',
          walkTarget:  null,
        })
        store.updateDemand(demandId, { status: 'DONE', progress: 100 })
        store.pushEvent({
          id:           `ev-exec-${demandId}-done`,
          eventType:    'demand.completed',
          timestamp:    new Date().toISOString(),
          demandId,
          summary:      `Demanda "${title}" concluída com sucesso`,
          metadata:     {},
          correlationId: `corr-exec-${demandId}-done`,
        })
      }, elapsed)
    }
  }, [demands])
}
