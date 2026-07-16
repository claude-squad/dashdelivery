import { useEffect } from 'react'
import { useSquadStore } from '@/store/useSquadStore'
import { useStore } from '@/store/useStore'
import type { AgentStatus } from '@/types'

// Maps squad step agent IDs → main store agentDefinition IDs
const SQUAD_TO_OFFICE: Record<string, string> = {
  pm:           'pm',
  ba:           'pm',   // BA maps to PM (closest role in office)
  pe:           'pe',
  tl:           'tl',
  dev:          'dev',
  qa:           'qa',
  sec:          'sec',
  review:       'rel',  // code review → release agent
  doc:          'ux',   // documentation → ux agent
  github_agent: 'rel',  // github/CI → release agent
}

const STEP_TO_OFFICE_STATUS: Record<string, AgentStatus> = {
  aguardando:           'IDLE',
  em_analise:           'ANALYZING',
  em_execucao:          'EXECUTING',
  pausado:              'QUEUED',
  aguardando_aprovacao: 'WAITING_CONTEXT',
  concluido:            'COMPLETED',
  concluido_com_alerta: 'COMPLETED',
  falhou:               'FAILED',
  cancelado:            'CANCELLED',
}

// Maps squad step IDs → which main store agent should be active for that step
const STEP_AGENT_MAP: Record<string, string> = {
  entrada:      'pm',
  analise:      'pm',   // BA → pm in office
  plano:        'pe',
  squad:        'tl',
  execucao:     'dev',
  testes:       'qa',
  validacao:    'rel',  // review → rel in office
  aprovacao:    'pm',
  commit:       'rel',  // github → rel in office
  pull_request: 'rel',
  conclusao:    'pm',
}

export function useSyncSquadToOffice() {
  const execution = useSquadStore(s => s.execution)
  const updateAgentInstance = useStore(s => s.updateAgentInstance)
  const agentDefinitions = useStore(s => s.agentDefinitions)

  useEffect(() => {
    if (!execution) {
      // Reset all agents to IDLE when no execution
      agentDefinitions.forEach(def => {
        updateAgentInstance(def.id, { status: 'IDLE', currentTask: '' })
      })
      return
    }

    const { steps, status } = execution

    if (status === 'cancelado' || status === 'falhou') {
      agentDefinitions.forEach(def => {
        updateAgentInstance(def.id, { status: status === 'cancelado' ? 'CANCELLED' : 'FAILED', currentTask: '' })
      })
      return
    }

    if (status === 'concluido') {
      agentDefinitions.forEach(def => {
        updateAgentInstance(def.id, { status: 'COMPLETED', currentTask: '' })
      })
      return
    }

    // For each step, update the corresponding office agent
    steps.forEach(step => {
      const officeAgentId = STEP_AGENT_MAP[step.id]
      if (!officeAgentId) return

      const officeStatus = STEP_TO_OFFICE_STATUS[step.status] ?? 'IDLE'

      updateAgentInstance(officeAgentId, {
        status: officeStatus,
        currentTask: step.status === 'em_execucao' || step.status === 'em_analise'
          ? `[Squad] ${step.label}`
          : step.status === 'concluido'
          ? `[✓] ${step.label}`
          : '',
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execution?.status, execution?.currentStepId, execution?.steps])
}
