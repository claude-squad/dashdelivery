import { create } from 'zustand'
import type {
  OperationType,
  SquadExecution,
  SquadFormData,
  StepId,
  StepStatus,
  SquadStep,
  ActiveSquadAgent,
  HumanApproval,
  ApprovalAction,
  DeliverableFile,
  TestResult,
  BugReport,
  GitHubPublicationState,
} from '@/types/squad'
import { INITIAL_STEPS, SQUAD_AGENTS } from '@/types/squad'

export type ActiveTab = 'entrada' | 'plano' | 'execucao' | 'validacao' | 'entregaveis' | 'github'

interface SquadState {
  selectedType: OperationType | null
  activeTab: ActiveTab
  execution: SquadExecution | null
  _timerId: ReturnType<typeof setTimeout> | null

  selectType: (type: OperationType) => void
  clearType: () => void
  setActiveTab: (tab: ActiveTab) => void
  startExecution: (formData: SquadFormData, githubToken?: string, githubRepo?: string) => void
  pauseExecution: () => void
  resumeExecution: () => void
  cancelExecution: () => void
  approveAction: (approvalId: string) => void
  cancelApproval: (approvalId: string) => void
  reset: () => void

  // internal
  _advanceStep: () => void
  _setStep: (id: StepId, status: StepStatus, extra?: Partial<SquadStep>) => void
  _addLog: (msg: string) => void
  _setGitHub: (state: GitHubPublicationState) => void
  _addFiles: (files: DeliverableFile[]) => void
  _addTests: (tests: TestResult[]) => void
  _addBugs: (bugs: BugReport[]) => void
  _requestApproval: (action: ApprovalAction, summary: string, opts?: Partial<HumanApproval>) => void
}

function makeId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase()
}

function now() {
  return new Date().toISOString()
}

function deriveTitle(formData: SquadFormData, type: OperationType): string {
  if (type === 'learn') return `Aprender: ${(formData as { subject?: string }).subject || 'Novo tema'}`
  if (type === 'execute') return `Executar: ${(formData as { title?: string }).title || 'Nova demanda'}`
  return `Validar: ${(formData as { githubUrl?: string }).githubUrl?.replace('https://github.com/', '') || 'GitHub PR'}`
}

const STEP_ORDER: StepId[] = [
  'entrada', 'analise', 'plano', 'squad',
  'execucao', 'testes', 'validacao',
  'aprovacao', 'commit', 'pull_request', 'conclusao',
]

const STEP_DELAY_MS: Record<StepId, number> = {
  entrada: 800,
  analise: 2200,
  plano: 1800,
  squad: 1000,
  execucao: 4500,
  testes: 3000,
  validacao: 2000,
  aprovacao: 0,
  commit: 2500,
  pull_request: 3000,
  conclusao: 1000,
}

const STEP_AGENTS: Record<StepId, string> = {
  entrada: 'pm',
  analise: 'ba',
  plano: 'pe',
  squad: 'tl',
  execucao: 'dev',
  testes: 'qa',
  validacao: 'review',
  aprovacao: 'pm',
  commit: 'github_agent',
  pull_request: 'github_agent',
  conclusao: 'pm',
}

const STEP_LOGS: Record<StepId, string[]> = {
  entrada: ['Entrada recebida pelo PM Agent', 'Contexto validado', 'Parâmetros extraídos com sucesso'],
  analise: ['BA Agent analisando contexto...', 'Requisitos mapeados', 'Dependências identificadas', 'Análise de impacto concluída'],
  plano: ['PE Agent estruturando prompt...', 'Estratégia de execução definida', 'Agentes selecionados para o plano'],
  squad: ['TL Agent definindo squad...', 'Capacidades verificadas', 'Squad configurada e pronta'],
  execucao: ['Dev Agent iniciando implementação...', 'Arquivos sendo processados', 'Código gerado', 'Revisão interna concluída'],
  testes: ['QA Agent executando testes...', 'Testes unitários: OK', 'Testes de integração: OK', 'Cobertura validada'],
  validacao: ['Review Agent validando...', 'Qualidade verificada', 'Critérios de aceite atendidos'],
  aprovacao: ['Aguardando aprovação humana...'],
  commit: ['GitHub Agent criando branch...', 'Commit sendo preparado', 'Push realizado com sucesso'],
  pull_request: ['Criando Pull Request...', 'PR aberto com sucesso', 'Reviewers notificados'],
  conclusao: ['Operação concluída com sucesso', 'Entregáveis disponíveis', 'Squad liberada'],
}

const MOCK_FILES: DeliverableFile[] = [
  { id: '1', name: 'output.md', path: 'docs/output.md', type: 'markdown', fileStatus: 'criado', sizeBytes: 4800 },
  { id: '2', name: 'README.md', path: 'README.md', type: 'markdown', fileStatus: 'alterado', sizeBytes: 2100 },
]

const MOCK_TESTS: TestResult[] = [
  { id: '1', name: 'Unit — core logic', type: 'unit', result: 'passed', durationMs: 142, attempt: 1, runAt: now() },
  { id: '2', name: 'Integration — API flow', type: 'integration', result: 'passed', durationMs: 387, attempt: 1, runAt: now() },
  { id: '3', name: 'Security — input validation', type: 'security', result: 'passed', durationMs: 210, attempt: 1, runAt: now() },
]

export const useSquadStore = create<SquadState>((set, get) => ({
  selectedType: null,
  activeTab: 'entrada',
  execution: null,
  _timerId: null,

  selectType: (type) => set({ selectedType: type }),
  clearType: () => set({ selectedType: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  startExecution: (formData, _githubToken, _githubRepo) => {
    const { selectedType } = get()
    if (!selectedType) return

    const execution: SquadExecution = {
      id: `EXEC-${makeId()}`,
      operationType: selectedType,
      title: deriveTitle(formData, selectedType),
      status: 'executando',
      formData,
      steps: INITIAL_STEPS.map(s => ({ ...s })),
      agents: SQUAD_AGENTS.map(a => ({
        id: a.id,
        status: 'aguardando' as const,
        logs: [],
      })),
      files: [],
      tests: [],
      bugs: [],
      logs: [`[${new Date().toLocaleTimeString('pt-BR')}] Execução iniciada — ${deriveTitle(formData, selectedType)}`],
      approvals: [],
      github: null,
      pendingApproval: null,
      startedAt: now(),
      executionTimeMs: 0,
      currentStepId: 'entrada',
    }

    set({ execution, activeTab: 'execucao' })
    get()._advanceStep()
  },

  _setStep: (id, status, extra = {}) => {
    set(state => {
      if (!state.execution) return state
      return {
        execution: {
          ...state.execution,
          currentStepId: id,
          steps: state.execution.steps.map(s =>
            s.id === id
              ? { ...s, status, attempts: s.attempts + (status === 'em_execucao' ? 1 : 0), ...extra }
              : s,
          ),
        },
      }
    })
  },

  _addLog: (msg) => {
    set(state => {
      if (!state.execution) return state
      const ts = new Date().toLocaleTimeString('pt-BR')
      return {
        execution: {
          ...state.execution,
          logs: [...state.execution.logs, `[${ts}] ${msg}`],
        },
      }
    })
  },

  _setGitHub: (gh) => {
    set(state => {
      if (!state.execution) return state
      return { execution: { ...state.execution, github: gh } }
    })
  },

  _addFiles: (files) => {
    set(state => {
      if (!state.execution) return state
      return { execution: { ...state.execution, files: [...state.execution.files, ...files] } }
    })
  },

  _addTests: (tests) => {
    set(state => {
      if (!state.execution) return state
      return { execution: { ...state.execution, tests: [...state.execution.tests, ...tests] } }
    })
  },

  _addBugs: (bugs) => {
    set(state => {
      if (!state.execution) return state
      return { execution: { ...state.execution, bugs: [...state.execution.bugs, ...bugs] } }
    })
  },

  _requestApproval: (action, summary, opts = {}) => {
    const { execution } = get()
    if (!execution) return
    const approval: HumanApproval = {
      id: makeId(),
      executionId: execution.id,
      action,
      requestedAt: now(),
      status: 'pendente',
      summary,
      affectedFiles: opts.affectedFiles ?? MOCK_FILES.map(f => f.path),
      risks: opts.risks ?? ['Operação irreversível no repositório', 'Requer revisão antes de merge'],
      repository: opts.repository,
      branch: opts.branch,
    }
    set(state => {
      if (!state.execution) return state
      return {
        execution: {
          ...state.execution,
          status: 'aguardando_aprovacao',
          pendingApproval: approval,
          approvals: [...state.execution.approvals, approval],
        },
      }
    })
  },

  _advanceStep: () => {
    const { execution } = get()
    if (!execution || execution.status !== 'executando') return

    const currentIdx = STEP_ORDER.indexOf(execution.currentStepId ?? 'entrada')
    const stepId = STEP_ORDER[currentIdx] as StepId

    get()._setStep(stepId, 'em_execucao', { startedAt: now() })

    const logs = STEP_LOGS[stepId] ?? []
    let logIdx = 0
    const logInterval = setInterval(() => {
      if (logIdx < logs.length) {
        get()._addLog(logs[logIdx])
        logIdx++
      } else {
        clearInterval(logInterval)
      }
    }, STEP_DELAY_MS[stepId] / Math.max(logs.length, 1))

    if (stepId === 'aprovacao') {
      get()._requestApproval('commit', 'Autorizar commit e criação de branch no repositório', {
        repository: (execution.formData as { repository?: string }).repository ?? 'claude-squad/dashdelivery',
        branch: `squad/${execution.id.toLowerCase()}`,
      })
      return
    }

    if (stepId === 'testes') get()._addTests(MOCK_TESTS)
    if (stepId === 'execucao') get()._addFiles(MOCK_FILES)

    const tid = setTimeout(() => {
      get()._setStep(stepId, 'concluido', { completedAt: now(), durationMs: STEP_DELAY_MS[stepId] })

      const nextIdx = currentIdx + 1
      if (nextIdx >= STEP_ORDER.length) {
        const repo = (execution.formData as { repository?: string }).repository ?? 'claude-squad/dashdelivery'
        get()._setGitHub({
          repository: repo,
          baseBranch: (execution.formData as { baseBranch?: string }).baseBranch ?? 'main',
          workingBranch: `squad/${execution.id.toLowerCase()}`,
          commitSha: makeId().toLowerCase(),
          prNumber: Math.floor(Math.random() * 900) + 100,
          prUrl: `https://github.com/${repo}/pull/${Math.floor(Math.random() * 900) + 100}`,
          prTitle: execution.title,
          ciStatus: 'passed',
          reviewCount: 0,
          approvalCount: 0,
        })
        set(state => ({
          execution: state.execution
            ? { ...state.execution, status: 'concluido', finishedAt: now() }
            : state.execution,
          activeTab: 'entregaveis' as ActiveTab,
        }))
        return
      }

      set(state => ({
        execution: state.execution
          ? { ...state.execution, currentStepId: STEP_ORDER[nextIdx] as StepId }
          : state.execution,
      }))
      get()._advanceStep()
    }, STEP_DELAY_MS[stepId])

    set({ _timerId: tid })
  },

  approveAction: (approvalId) => {
    set(state => {
      if (!state.execution) return state
      return {
        execution: {
          ...state.execution,
          status: 'executando',
          pendingApproval: null,
          approvals: state.execution.approvals.map(a =>
            a.id === approvalId ? { ...a, status: 'aprovado', approvedAt: now() } : a,
          ),
        },
      }
    })
    get()._addLog('Aprovação humana concedida — continuando execução')
    const currentIdx = STEP_ORDER.indexOf(get().execution?.currentStepId ?? 'aprovacao')
    set(state => ({
      execution: state.execution
        ? { ...state.execution, currentStepId: STEP_ORDER[Math.min(currentIdx + 1, STEP_ORDER.length - 1)] as StepId }
        : state.execution,
    }))
    get()._advanceStep()
  },

  cancelApproval: (approvalId) => {
    set(state => {
      if (!state.execution) return state
      return {
        execution: {
          ...state.execution,
          status: 'cancelado',
          pendingApproval: null,
          approvals: state.execution.approvals.map(a =>
            a.id === approvalId ? { ...a, status: 'cancelado' } : a,
          ),
        },
      }
    })
    get()._addLog('Execução cancelada pelo usuário na etapa de aprovação')
  },

  pauseExecution: () => {
    const { _timerId } = get()
    if (_timerId) clearTimeout(_timerId)
    set(state => ({
      execution: state.execution ? { ...state.execution, status: 'pausado' } : state.execution,
    }))
  },

  resumeExecution: () => {
    set(state => ({
      execution: state.execution ? { ...state.execution, status: 'executando' } : state.execution,
    }))
    get()._advanceStep()
  },

  cancelExecution: () => {
    const { _timerId } = get()
    if (_timerId) clearTimeout(_timerId)
    set(state => ({
      execution: state.execution ? { ...state.execution, status: 'cancelado', finishedAt: now() } : state.execution,
    }))
  },

  reset: () => {
    const { _timerId } = get()
    if (_timerId) clearTimeout(_timerId)
    set({ execution: null, selectedType: null, activeTab: 'entrada' })
  },
}))
