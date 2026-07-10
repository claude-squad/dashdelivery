export type AgentStatus =
  | 'IDLE' | 'QUEUED' | 'STARTING' | 'ANALYZING' | 'WAITING_CONTEXT'
  | 'PLANNING' | 'EXECUTING' | 'RUNNING_TOOL' | 'VALIDATING'
  | 'BLOCKED' | 'FAILED' | 'COMPLETED' | 'CANCELLED'

// Map Claude Code subagent types → agent IDs in the dashboard
export const AGENT_TYPE_MAP: Record<string, string> = {
  'orchestrator': 'tl',
  'prompt-engineer': 'pe',
  'product-manager': 'pm',
  'frontend-developer': 'dev',
  'backend-developer': 'dev',
  'qa-test-engineer': 'qa',
  'code-reviewer': 'qa',
  'security-auditor': 'sec',
  'ux-researcher': 'ux',
  'financial-systems-architect': 'tl',
  'solution-architect': 'tl',
  'technical-lead': 'tl',
  'data-product-strategist': 'dev',
  'execution-engine': 'rel',
  'executive-reviewer': 'rel',
  'Explore': 'pm',
  'Plan': 'tl',
  'general-purpose': 'dev',
}

export function mapSubagentToAgent(subagentType: string): string {
  return AGENT_TYPE_MAP[subagentType] ?? 'dev'
}
