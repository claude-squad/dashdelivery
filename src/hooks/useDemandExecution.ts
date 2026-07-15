import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import type { AgentStatus, DomainEvent, Demand } from '@/types'
import { STATIONS_3D } from '@/components/office/sceneConstants'

// Module-level singleton for approval gate — resolved by ApprovalGateModal
let _approvalResolver: ((approved: boolean) => void) | null = null

export function resolveApprovalGate(approved: boolean) {
  _approvalResolver?.(approved)
  _approvalResolver = null
}

function waitForApproval(): Promise<boolean> {
  return new Promise(resolve => { _approvalResolver = resolve })
}

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms))

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

const MEETING_DURATION  = 8000
const RETURN_DELAY      = 2000
const DONE_FLASH_MS     = 1200
const HANDOFF_RETURN_MS = 2500

type MidCycle = { delayMs: number; status: AgentStatus; taskFn: (t: string) => string }

type Phase = {
  agentId:        string
  nextAgentId:    string | null
  status:         AgentStatus
  taskFn:         (t: string) => string
  durationMs:     number
  progress:       number
  eventSummaryFn: (t: string) => string
  midCycles?:     MidCycle[]
}

const PHASES: Phase[] = [
  {
    agentId: 'pm', nextAgentId: 'pe', status: 'ANALYZING', durationMs: 6000, progress: 12,
    taskFn: t => `Analisando requisitos: ${t}`,
    eventSummaryFn: t => `PM classificando escopo e impacto: ${t}`,
  },
  {
    agentId: 'pe', nextAgentId: 'tl', status: 'PLANNING', durationMs: 8000, progress: 26,
    taskFn: t => `Estruturando critérios de aceite: ${t}`,
    eventSummaryFn: t => `PE gerando critérios de aceite e prompt: ${t}`,
  },
  {
    agentId: 'tl', nextAgentId: 'dev', status: 'PLANNING', durationMs: 7000, progress: 40,
    taskFn: t => `Planejando arquitetura técnica: ${t}`,
    eventSummaryFn: t => `TL criando plano de execução: ${t}`,
  },
  {
    agentId: 'dev', nextAgentId: 'qa', status: 'EXECUTING', durationMs: 14000, progress: 62,
    taskFn: t => `Implementando: ${t}`,
    eventSummaryFn: t => `Dev Agent iniciou implementação: ${t}`,
    midCycles: [
      { delayMs: 5000, status: 'RUNNING_TOOL', taskFn: () => 'Executando análise estática de código' },
      { delayMs: 9000, status: 'EXECUTING',    taskFn: t => `Finalizando implementação: ${t}` },
    ],
  },
  {
    agentId: 'qa', nextAgentId: 'sec', status: 'VALIDATING', durationMs: 10000, progress: 70,
    taskFn: t => `Executando suite de testes: ${t}`,
    eventSummaryFn: t => `QA Agent iniciou validação: ${t}`,
    midCycles: [
      { delayMs: 4000, status: 'VALIDATING',   taskFn: t => `Validando critérios de aceite: ${t}` },
      { delayMs: 8000, status: 'RUNNING_TOOL', taskFn: () => 'Analisando cobertura de código' },
    ],
  },
  {
    agentId: 'sec', nextAgentId: 'rel', status: 'ANALYZING', durationMs: 6000, progress: 88,
    taskFn: () => 'Auditoria de segurança e SAST scan',
    eventSummaryFn: t => `Security Agent auditando: ${t}`,
    midCycles: [
      { delayMs: 3000, status: 'RUNNING_TOOL', taskFn: () => 'Executando SAST scan' },
    ],
  },
  {
    agentId: 'rel', nextAgentId: null, status: 'EXECUTING', durationMs: 5000, progress: 96,
    taskFn: t => `Gerando PR e publicando: ${t}`,
    eventSummaryFn: t => `Release Agent preparando deploy: ${t}`,
  },
]

function generatePRBody(demand: Demand): string {
  const acList = demand.acceptanceCriteria.length > 0
    ? demand.acceptanceCriteria.map(ac => `- [ ] ${ac.description}`).join('\n')
    : '- [ ] Funcionalidade implementada conforme especificado\n- [ ] Testes de regressão aprovados\n- [ ] Code review aprovado'

  const gateList = demand.qualityGates.filter(g => g.mandatory)
    .map(g => `- [x] ${g.name}`).join('\n') || '- [x] Build passing\n- [x] Testes passando\n- [x] Security scan clean'

  return `## ${demand.title}

**Tipo:** ${(demand.type ?? 'feature').toUpperCase()} | **Prioridade:** ${demand.priority} | **ID:** \`${demand.id}\`

### Descrição
${demand.description}

### Pipeline de Execução
\`PM → PE → TL → DEV → QA → SEC → REL\`

### Critérios de Aceite
${acList}

### Quality Gates
${gateList}

---
*Gerado automaticamente pelo **DashDelivery Squad***`
}

const SYNTHETIC_BUGS = [
  'Validação de campo obrigatório ausente no formulário principal',
  'Race condition identificada no fluxo de autenticação assíncrono',
  'Cobertura de testes abaixo do threshold mínimo (atual: 74%, mínimo: 80%)',
  'Endpoint sem rate limiting — risco de abuso em produção',
  'Inconsistência de tipos TypeScript entre camada de serviço e interface',
  'Tratamento de erro ausente em chamada assíncrona crítica',
]

function pickBugs(seed: string, count = 2): string[] {
  const h = seed.split('').reduce((a, c) => ((a << 5) + a) ^ c.charCodeAt(0), 5381)
  const start = Math.abs(h) % SYNTHETIC_BUGS.length
  return Array.from({ length: count }, (_, i) => SYNTHETIC_BUGS[(start + i) % SYNTHETIC_BUGS.length])
}

function fireAdapter(payload: Record<string, string>): void {
  fetch('/claw3d-adapter/hook', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).catch(() => { /* Claw3D adapter optional — silent fail */ })
}

export function useDemandExecution() {
  const { demands } = useStore()
  const processedIds = useRef(new Set<string>())

  useEffect(() => {
    const newDrafts = demands.filter(d => d.status === 'DRAFT' && !processedIds.current.has(d.id))

    for (const demand of newDrafts) {
      processedIds.current.add(demand.id)

      ;(async () => {
        const title    = demand.title
        const demandId = demand.id
        let evIdx      = 0

        const st  = () => useStore.getState()
        const agentRole = (agentId: string): string =>
          st().agentDefinitions.find(d => d.id === agentId)?.role ?? agentId.toUpperCase()
        const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const ev  = (eventType: string, agentId: string, summary: string): DomainEvent => ({
          id:            `ev-${demandId}-${evIdx++}`,
          eventType,
          timestamp:     new Date().toISOString(),
          demandId,
          agentId,
          summary,
          metadata:      {},
          correlationId: `corr-${demandId}-${evIdx}`,
        })

        st().setDemoMode(false)
        st().setActiveDemand(demandId)

        // ── PHASE 0: MEETING ────────────────────────────────────────────────
        Object.keys(MEETING_POSITIONS).forEach(agentId => {
          st().updateAgentInstance(agentId, {
            status:      'ANALYZING',
            currentTask: `Reunião de kick-off: ${title}`,
            walkTarget:  MEETING_POSITIONS[agentId],
            taskComplete: false,
          })
        })
        // Register all agents in Claw3D for the meeting
        Object.keys(MEETING_POSITIONS).forEach(agentId => {
          fireAdapter({ hook_event_name: 'SubagentStart', session_id: `dashdelivery-${demandId}`, agent_id: `dd-meet-${agentId}-${demandId}`, agent_type: agentRole(agentId) })
        })
        st().updateDemand(demandId, { status: 'ANALYSIS' as const, progress: 5 })
        st().pushEvent(ev('demand.started', 'pm', `Nova demanda recebida: ${title}`))

        await sleep(MEETING_DURATION)

        // All return to stations
        Object.keys(MEETING_POSITIONS).forEach(agentId => {
          st().updateAgentInstance(agentId, { status: 'IDLE', currentTask: '', walkTarget: null })
        })
        // Remove meeting agents from Claw3D
        Object.keys(MEETING_POSITIONS).forEach(agentId => {
          fireAdapter({ hook_event_name: 'SubagentStop', session_id: `dashdelivery-${demandId}`, agent_id: `dd-meet-${agentId}-${demandId}` })
        })

        await sleep(RETURN_DELAY)

        // ── SEQUENTIAL DESK WORK ────────────────────────────────────────────
        for (const phase of PHASES) {
          st().updateAgentInstance(phase.agentId, {
            status:       phase.status,
            currentTask:  phase.taskFn(title),
            lastActivity: now(),
            demandId,
            walkTarget:   null,
            taskComplete: false,
          })
          st().updateDemand(demandId, { progress: phase.progress })
          st().pushEvent(ev('agent.task_started', phase.agentId, phase.eventSummaryFn(title)))
          fireAdapter({ hook_event_name: 'SubagentStart', session_id: `dashdelivery-${demandId}`, agent_id: `dd-${phase.agentId}-${demandId}`, agent_type: agentRole(phase.agentId) })

          // Schedule mid-cycle status changes (fire-and-forget, no await)
          if (phase.midCycles) {
            for (const mid of phase.midCycles) {
              sleep(mid.delayMs).then(() => {
                const inst = st().agentInstances[phase.agentId]
                if (inst && inst.status !== 'IDLE') {
                  st().updateAgentInstance(phase.agentId, {
                    status:      mid.status,
                    currentTask: mid.taskFn(title),
                  })
                }
              })
            }
          }

          await sleep(phase.durationMs)

          // ── APPROVAL GATE after QA ────────────────────────────────────────
          if (phase.agentId === 'qa') {
            const bugs = pickBugs(demandId)
            st().updateAgentInstance('qa', {
              currentTask: `${bugs.length} issues encontrados — aguardando aprovação`,
            })
            st().updateDemand(demandId, { status: 'REVIEW' as const, progress: 72 })
            st().setPendingApproval({ demandId, bugs })
            st().pushEvent(ev('qa.review_required', 'qa', `QA encontrou ${bugs.length} issues. Aguardando aprovação.`))

            const approved = await waitForApproval()
            st().setPendingApproval(null)

            if (approved) {
              st().updateDemand(demandId, { status: 'EXECUTION' as const })
              st().pushEvent(ev('qa.fixes_approved', 'pm', 'Correções aprovadas — DEV iniciando fix loop'))

              // DEV fix loop
              st().updateAgentInstance('dev', {
                status:      'EXECUTING',
                currentTask: `Corrigindo ${bugs.length} issues reportados pelo QA`,
                walkTarget:  null,
                taskComplete: false,
              })
              fireAdapter({ hook_event_name: 'SubagentStart', session_id: `dashdelivery-${demandId}`, agent_id: `dd-dev-fix-${demandId}`, agent_type: agentRole('dev') })
              await sleep(8000)
              fireAdapter({ hook_event_name: 'SubagentStop', session_id: `dashdelivery-${demandId}`, agent_id: `dd-dev-fix-${demandId}` })

              st().updateAgentInstance('dev', { taskComplete: true })
              await sleep(DONE_FLASH_MS)
              st().updateAgentInstance('dev', { taskComplete: false, status: 'IDLE', currentTask: '' })
              st().pushEvent(ev('dev.fixes_done', 'dev', 'DEV concluiu correções — QA retestando'))

              // QA retest
              st().updateAgentInstance('qa', {
                status:      'VALIDATING',
                currentTask: 'Retestando após correções — todos os critérios aprovados ✓',
                walkTarget:  null,
                taskComplete: false,
              })
              await sleep(5000)
              st().updateDemand(demandId, { progress: 80 })
              st().pushEvent(ev('qa.retest_passed', 'qa', 'Retest aprovado — prosseguindo para SEC'))
            } else {
              st().pushEvent(ev('qa.fixes_skipped', 'pm', 'Issues ignorados — prosseguindo sem correções'))
            }
          }

          // Task complete flash
          st().updateAgentInstance(phase.agentId, { taskComplete: true })
          await sleep(DONE_FLASH_MS)
          fireAdapter({ hook_event_name: 'SubagentStop', session_id: `dashdelivery-${demandId}`, agent_id: `dd-${phase.agentId}-${demandId}` })

          // Handoff walk to next agent desk
          if (phase.nextAgentId) {
            const nextStation = STATIONS_3D[phase.nextAgentId]
            st().updateAgentInstance(phase.agentId, {
              status:       'IDLE',
              currentTask:  '',
              taskComplete: false,
              walkTarget:   nextStation ? { x: nextStation.x, z: nextStation.z } : null,
            })
            sleep(HANDOFF_RETURN_MS).then(() => {
              st().updateAgentInstance(phase.agentId, { walkTarget: null })
            })
          }
        }

        // ── PR GENERATION ───────────────────────────────────────────────────
        const finalDemand = st().demands.find(d => d.id === demandId) ?? demand
        const prTitle = `feat: ${title}`
        const prBody  = generatePRBody(finalDemand)

        const { githubToken, githubRepo } = st()
        let prUrl: string | undefined

        if (githubToken && githubRepo) {
          try {
            const resp = await fetch(`https://api.github.com/repos/${githubRepo}/pulls`, {
              method:  'POST',
              headers: {
                Authorization: `token ${githubToken}`,
                Accept:        'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ title: prTitle, body: prBody, head: `feat/${demandId.slice(0, 8)}`, base: 'main' }),
            })
            if (resp.ok) {
              const pr = await resp.json() as { html_url: string }
              prUrl = pr.html_url
            }
          } catch { /* network error — proceed without URL */ }
        }

        st().updateAgentInstance('rel', { taskComplete: false, status: 'IDLE', currentTask: '' })
        st().setPendingPR({ demandId, title: prTitle, body: prBody, url: prUrl })
        st().updateDemand(demandId, { status: 'DONE' as const, progress: 100 })
        st().pushEvent(ev('demand.completed', 'rel', `"${title}" concluída — PR gerado`))
      })()
    }
  }, [demands])
}
