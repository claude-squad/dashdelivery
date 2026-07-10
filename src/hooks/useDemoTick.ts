import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import type { AgentStatus, DomainEvent } from '@/types'

const WORKING_STATUSES: AgentStatus[] = ['EXECUTING', 'RUNNING_TOOL', 'ANALYZING', 'PLANNING', 'VALIDATING']

let tickId = 0

const TASK_VARIANTS: Record<string, string[]> = {
  dev: ['Refatorando componente de checkout', 'Aplicando validação de CEP', 'Otimizando re-renders'],
  qa:  ['Executando suite de testes', 'Verificando edge case de pagamento', 'Gerando relatório de cobertura'],
  tl:  ['Revisando arquitetura do módulo', 'Avaliando dependências externas', 'Aprovando PR de integração'],
  pm:  ['Refinando critério de aceite', 'Alinhando scope com stakeholder', 'Atualizando Definition of Done'],
  ux:  ['Ajustando fluxo de confirmação', 'Validando acessibilidade', 'Revisando estados de erro'],
  pe:  ['Refinando instrução do Dev Agent', 'Testando temperatura do prompt', 'Adicionando guardrails'],
}

export function useDemoTick() {
  const { isDemoMode } = useStore()

  useEffect(() => {
    if (!isDemoMode) return

    const interval = setInterval(() => {
      tickId++

      // Sempre lê o estado fresco via getState() — sem stale closure
      const { agentInstances, agentDefinitions, updateAgentInstance, pushEvent } = useStore.getState()

      // Tick duration forward on active agents
      agentDefinitions.forEach((def) => {
        const inst = agentInstances[def.id]
        if (!inst) return
        if (WORKING_STATUSES.includes(inst.status)) {
          updateAgentInstance(def.id, { duration: inst.duration + 1 })
        }
      })

      // Synthetic event every ~15s
      if (tickId % 15 === 0) {
        const activeAgents = agentDefinitions.filter(
          (d) => WORKING_STATUSES.includes(agentInstances[d.id]?.status ?? 'IDLE')
        )
        if (activeAgents.length === 0) return

        const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
        const tasks = TASK_VARIANTS[agent.id] ?? ['Processando...']
        const task = tasks[Math.floor(Math.random() * tasks.length)]

        const ev: DomainEvent = {
          id: `ev-demo-${tickId}`,
          eventType: 'agent.task_started',
          timestamp: new Date().toISOString(),
          demandId: 'DE-2024-05-15-001',
          agentId: agent.id,
          summary: task,
          metadata: {},
          correlationId: `corr-demo-${tickId}`,
        }

        updateAgentInstance(agent.id, {
          currentTask: task,
          lastActivity: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        })
        pushEvent(ev)
      }

      // Cycle EXECUTING ↔ RUNNING_TOOL for dev every 8s
      if (tickId % 8 === 0) {
        const dev = useStore.getState().agentInstances['dev']
        if (dev && WORKING_STATUSES.includes(dev.status)) {
          updateAgentInstance('dev', {
            status: dev.status === 'RUNNING_TOOL' ? 'EXECUTING' : 'RUNNING_TOOL',
          })
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isDemoMode]) // só isDemoMode — sem agentInstances no dep array
}
