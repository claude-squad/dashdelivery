export type OperationType = 'learn' | 'execute' | 'validate'

export type StepId =
  | 'entrada' | 'analise' | 'plano' | 'squad'
  | 'execucao' | 'testes' | 'validacao'
  | 'aprovacao' | 'commit' | 'pull_request' | 'conclusao'

export type StepStatus =
  | 'aguardando' | 'em_analise' | 'em_execucao' | 'pausado'
  | 'aguardando_aprovacao' | 'concluido' | 'concluido_com_alerta'
  | 'falhou' | 'cancelado'

export interface SquadStep {
  id: StepId
  label: string
  status: StepStatus
  startedAt?: string
  completedAt?: string
  agentId?: string
  currentActivity?: string
  result?: string
  errors: string[]
  attempts: number
  durationMs?: number
}

export type SquadAgentId =
  | 'pm' | 'ba' | 'pe' | 'tl' | 'dev' | 'qa' | 'sec' | 'review' | 'doc' | 'github_agent'

export interface SquadAgentDef {
  id: SquadAgentId
  name: string
  role: string
  color: string
  icon: string
}

export const SQUAD_AGENTS: SquadAgentDef[] = [
  { id: 'pm',          name: 'PM Agent',     role: 'Product Manager',   color: '#7c6cf0', icon: '🧠' },
  { id: 'ba',          name: 'BA Agent',     role: 'Business Analyst',  color: '#3b82f6', icon: '📋' },
  { id: 'pe',          name: 'PE Agent',     role: 'Prompt Engineer',   color: '#06b6d4', icon: '✏️' },
  { id: 'tl',          name: 'TL Agent',     role: 'Tech Lead',         color: '#f59e0b', icon: '🏗️' },
  { id: 'dev',         name: 'Dev Agent',    role: 'Developer',         color: '#22c55e', icon: '💻' },
  { id: 'qa',          name: 'QA Agent',     role: 'Quality Assurance', color: '#ec4899', icon: '🔍' },
  { id: 'sec',         name: 'Sec Agent',    role: 'Security',          color: '#ef4444', icon: '🛡️' },
  { id: 'review',      name: 'Review Agent', role: 'Code Review',       color: '#8b5cf6', icon: '👁️' },
  { id: 'doc',         name: 'Doc Agent',    role: 'Documentation',     color: '#14b8a6', icon: '📄' },
  { id: 'github_agent',name: 'GitHub Agent', role: 'CI/CD & Publishing',color: '#f97316', icon: '🚀' },
]

export interface ActiveSquadAgent {
  id: SquadAgentId
  status: 'aguardando' | 'ativo' | 'pausado' | 'bloqueado' | 'concluido' | 'erro'
  currentTask?: string
  stepId?: StepId
  tokensUsed?: number
  logs: string[]
  startedAt?: string
}

export type ApprovalAction =
  | 'create_branch' | 'commit' | 'create_pr'
  | 'overwrite_file' | 'save_project' | 'fix_code' | 'merge_pr'

export interface HumanApproval {
  id: string
  executionId: string
  action: ApprovalAction
  requestedAt: string
  status: 'pendente' | 'aprovado' | 'cancelado'
  approvedAt?: string
  summary: string
  repository?: string
  branch?: string
  affectedFiles: string[]
  risks: string[]
}

export interface DeliverableFile {
  id: string
  name: string
  path: string
  type: string
  fileStatus: 'criado' | 'alterado' | 'deletado'
  sizeBytes?: number
  content?: string
  url?: string
}

export interface TestResult {
  id: string
  name: string
  type: 'unit' | 'integration' | 'functional' | 'security' | 'regression'
  result: 'passed' | 'failed' | 'skipped'
  durationMs: number
  evidence?: string
  file?: string
  attempt: number
  runAt: string
}

export interface BugReport {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'aberto' | 'corrigido' | 'ignorado'
  file?: string
  line?: number
  evidence?: string
  impact?: string
  recommendation?: string
}

export interface GitHubPublicationState {
  repository: string
  baseBranch: string
  workingBranch?: string
  commitSha?: string
  prNumber?: number
  prUrl?: string
  prTitle?: string
  ciStatus?: 'pending' | 'running' | 'passed' | 'failed'
  reviewCount?: number
  approvalCount?: number
}

export type ExecutionStatus =
  | 'idle' | 'selecionando' | 'formulario' | 'executando'
  | 'pausado' | 'aguardando_aprovacao' | 'concluido' | 'falhou' | 'cancelado'

export interface LearnFormData {
  subject: string
  objective: string
  context: string
  audience: string
  depth: 'basico' | 'intermediario' | 'avancado'
  sources: string
  targetDirectory: string
  relatedProject: string
  repository: string
  baseBranch: string
  newBranchName: string
  outputFileName: string
  outputFormat: 'markdown' | 'html' | 'json' | 'txt'
  additionalInstructions: string
}

export interface ExecuteFormData {
  title: string
  description: string
  problem: string
  expectedResult: string
  demandType: 'feature' | 'bug' | 'improvement' | 'technical' | 'functional' | 'nonfunctional'
  priority: 'low' | 'medium' | 'high' | 'critical'
  repository: string
  baseBranch: string
  targetDirectory: string
  stack: string
  acceptanceCriteria: string
  restrictions: string
  dependencies: string
  additionalInstructions: string
}

export interface ValidateFormData {
  githubUrl: string
  detectedType: 'repo' | 'pr' | 'branch' | 'commit' | ''
  detectedOwner: string
  detectedRepo: string
  detectedRef: string
  targetDirectory: string
  installCommand: string
  buildCommand: string
  testCommand: string
  environment: string
  acceptanceCriteria: string
  qualityRules: string
}

export type SquadFormData = LearnFormData | ExecuteFormData | ValidateFormData

export const INITIAL_STEPS: SquadStep[] = [
  { id: 'entrada',      label: 'Entrada recebida',  status: 'aguardando', errors: [], attempts: 0 },
  { id: 'analise',      label: 'Contexto analisado', status: 'aguardando', errors: [], attempts: 0 },
  { id: 'plano',        label: 'Plano gerado',       status: 'aguardando', errors: [], attempts: 0 },
  { id: 'squad',        label: 'Squad definida',     status: 'aguardando', errors: [], attempts: 0 },
  { id: 'execucao',     label: 'Execução',           status: 'aguardando', errors: [], attempts: 0 },
  { id: 'testes',       label: 'Testes',             status: 'aguardando', errors: [], attempts: 0 },
  { id: 'validacao',    label: 'Validação QA',       status: 'aguardando', errors: [], attempts: 0 },
  { id: 'aprovacao',    label: 'Aprovação humana',   status: 'aguardando', errors: [], attempts: 0 },
  { id: 'commit',       label: 'Commit',             status: 'aguardando', errors: [], attempts: 0 },
  { id: 'pull_request', label: 'Pull Request',       status: 'aguardando', errors: [], attempts: 0 },
  { id: 'conclusao',    label: 'Conclusão',          status: 'aguardando', errors: [], attempts: 0 },
]

export interface SquadExecution {
  id: string
  operationType: OperationType
  title: string
  status: ExecutionStatus
  currentStepId?: StepId
  formData: SquadFormData | null
  steps: SquadStep[]
  agents: ActiveSquadAgent[]
  files: DeliverableFile[]
  tests: TestResult[]
  bugs: BugReport[]
  logs: string[]
  approvals: HumanApproval[]
  github: GitHubPublicationState | null
  pendingApproval: HumanApproval | null
  startedAt?: string
  finishedAt?: string
  executionTimeMs: number
}
