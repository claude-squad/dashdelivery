export type AgentStatus =
  | 'IDLE'
  | 'QUEUED'
  | 'STARTING'
  | 'ANALYZING'
  | 'WAITING_CONTEXT'
  | 'PLANNING'
  | 'EXECUTING'
  | 'RUNNING_TOOL'
  | 'VALIDATING'
  | 'BLOCKED'
  | 'FAILED'
  | 'COMPLETED'
  | 'CANCELLED'

export type DemandStatus =
  | 'DRAFT'
  | 'INTAKE'
  | 'TRIAGE'
  | 'ANALYSIS'
  | 'PLANNING'
  | 'EXECUTION'
  | 'TESTING'
  | 'REVIEW'
  | 'APPROVAL'
  | 'DONE'
  | 'BLOCKED'
  | 'CANCELLED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type WorkflowStageId =
  | 'intake'
  | 'triage'
  | 'classification'
  | 'product_analysis'
  | 'ambiguity'
  | 'scope'
  | 'out_of_scope'
  | 'business_rules'
  | 'use_cases'
  | 'acceptance_criteria'
  | 'prompt_engineering'
  | 'technical_analysis'
  | 'ux_analysis'
  | 'decomposition'
  | 'agent_selection'
  | 'implementation_plan'
  | 'test_planning'
  | 'implementation'
  | 'automated_tests'
  | 'code_review'
  | 'security_review'
  | 'criteria_validation'
  | 'fix_failures'
  | 'retest'
  | 'evidence'
  | 'delivery_report'
  | 'human_approval'

export interface WorkflowStage {
  id: WorkflowStageId
  label: string
  shortLabel: string
  group: 'intake' | 'analysis' | 'planning' | 'execution' | 'testing' | 'delivery'
  status: 'pending' | 'active' | 'done' | 'blocked' | 'skipped'
  agentId?: string
  startedAt?: string
  completedAt?: string
}

export interface AcceptanceCriterion {
  id: string
  description: string
  status: 'pending' | 'passed' | 'failed'
  testScenarios?: string[]
}

export interface AgentDefinition {
  id: string
  name: string
  role: string
  station: string
  color: string
  accentColor: string
  robotVariant: 'pm' | 'tl' | 'dev' | 'qa' | 'ux' | 'pe' | 'sec' | 'rel'
}

export interface AgentInstance {
  definitionId: string
  status: AgentStatus
  currentTask: string
  duration: number
  lastActivity: string
  demandId?: string
  filesAccessed?: string[]
  filesChanged?: string[]
  toolsUsed?: string[]
  errorMessage?: string
}

export interface DomainEvent {
  id: string
  eventType: string
  timestamp: string
  demandId: string
  workflowId?: string
  runId?: string
  agentId?: string
  taskId?: string
  status?: string
  summary: string
  metadata: Record<string, unknown>
  correlationId: string
  causationId?: string
}

export interface QualityGate {
  id: string
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'blocked'
  mandatory: boolean
  agentId?: string
  result?: string
}

export interface Demand {
  id: string
  title: string
  description: string
  priority: Priority
  status: DemandStatus
  requestedBy: string
  createdAt: string
  updatedAt: string
  repository?: string
  branch?: string
  dueDate?: string
  workflowStages: WorkflowStage[]
  acceptanceCriteria: AcceptanceCriterion[]
  assignedAgents: string[]
  qualityGates: QualityGate[]
  generatedPrompt?: string
  technicalPlan?: string
  progress: number
  testStats: { total: number; passing: number; pending: number; failing: number }
  codeQuality: { score: number; noCriticalBugs: boolean; coverage: number; codeReview: string }
  elapsedTime: string
  estimatedTotal: string
  nextSteps: string[]
  events: DomainEvent[]
}
