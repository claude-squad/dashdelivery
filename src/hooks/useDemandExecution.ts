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

const PHASES: Phase[] = [
  { agentId: 'pm',  status: 'ANALYZING',  durationMs: 5000,  progress: 15,
    taskFn: (t) => `Analisando requisitos: ${t}`,
    eventSummaryFn: (t) => `PM iniciou análise de produto: ${t}` },

  { agentId: 'pe',  status: 'PLANNING',   durationMs: 5000,  progress: 28,
    taskFn: (t) => `Estruturando prompt para: ${t}`,
    eventSummaryFn: (t) => `PE refinando instrução para agentes: ${t}` },

  { agentId: 'tl',  status: 'PLANNING',   durationMs: 7000,  progress: 42,
    taskFn: (t) => `Definindo arquitetura: ${t}`,
    eventSummaryFn: (t) => `TL planejando implementação técnica: ${t}` },

  { agentId: 'dev', status: 'EXECUTING',  durationMs: 14000, progress: 62,
    taskFn: (t) => `Implementando: ${t}`,
    eventSummaryFn: (t) => `Dev Agent iniciou implementação: ${t}` },

  { agentId: 'qa',  status: 'VALIDATING', durationMs: 8000,  progress: 78,
    taskFn: (t) => `Testando: ${t}`,
    eventSummaryFn: (t) => `QA validando entrega: ${t}` },

  { agentId: 'sec', status: 'ANALYZING',  durationMs: 5000,  progress: 88,
    taskFn: (t) => `Security scan: ${t}`,
    eventSummaryFn: (t) => `Security Agent auditando: ${t}` },

  { agentId: 'rel', status: 'EXECUTING',  durationMs: 4000,  progress: 100,
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

      const title = demand.title
      const demandId = demand.id
      let elapsed = 0

      PHASES.forEach((phase, index) => {
        const delay = elapsed
        const prevAgentId = index > 0 ? PHASES[index - 1].agentId : null

        setTimeout(() => {
          const store = useStore.getState()
          const now = new Date()
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

          if (prevAgentId) {
            store.updateAgentInstance(prevAgentId, { status: 'IDLE', currentTask: '' })
          }

          store.updateAgentInstance(phase.agentId, {
            status: phase.status,
            currentTask: phase.taskFn(title),
            lastActivity: timeStr,
            demandId,
          })

          store.updateDemand(demandId, { progress: phase.progress })

          const ev: DomainEvent = {
            id: `ev-exec-${demandId}-${index}`,
            eventType: 'agent.task_started',
            timestamp: now.toISOString(),
            demandId,
            agentId: phase.agentId,
            summary: phase.eventSummaryFn(title),
            metadata: { phase: index + 1 },
            correlationId: `corr-exec-${demandId}-${index}`,
          }
          store.pushEvent(ev)
        }, delay)

        // Dev: ciclo RUNNING_TOOL no meio da fase
        if (phase.agentId === 'dev') {
          setTimeout(() => {
            const store = useStore.getState()
            const dev = store.agentInstances['dev']
            if (dev && dev.status !== 'IDLE') {
              store.updateAgentInstance('dev', {
                status: 'RUNNING_TOOL',
                currentTask: 'Executando ferramentas de análise de código',
              })
            }
          }, delay + 5000)

          setTimeout(() => {
            const store = useStore.getState()
            const dev = store.agentInstances['dev']
            if (dev && dev.status !== 'IDLE') {
              store.updateAgentInstance('dev', {
                status: 'EXECUTING',
                currentTask: `Finalizando implementação: ${title}`,
              })
            }
          }, delay + 9000)
        }

        elapsed += phase.durationMs
      })

      const lastAgentId = PHASES[PHASES.length - 1].agentId
      setTimeout(() => {
        const store = useStore.getState()
        store.updateAgentInstance(lastAgentId, { status: 'IDLE', currentTask: '' })
        store.updateDemand(demandId, { status: 'DONE', progress: 100 })
        store.pushEvent({
          id: `ev-exec-${demandId}-done`,
          eventType: 'demand.completed',
          timestamp: new Date().toISOString(),
          demandId,
          summary: `Demanda "${title}" concluída com sucesso`,
          metadata: {},
          correlationId: `corr-exec-${demandId}-done`,
        })
      }, elapsed)
    }
  }, [demands])
}
