// In-memory state store (Phase 2 — Redis can replace this later)
import type { AgentStatus } from './types.js'

export interface AgentState {
  id: string
  status: AgentStatus
  currentTask: string
  duration: number
  lastActivity: string
  demandId?: string
  filesAccessed: string[]
  filesChanged: string[]
  toolsUsed: string[]
  errorMessage?: string
}

export interface DomainEvent {
  id: string
  eventType: string
  timestamp: string
  demandId: string
  agentId?: string
  summary: string
  metadata: Record<string, unknown>
  correlationId: string
}

export interface AppState {
  agents: Record<string, AgentState>
  events: DomainEvent[]
  isDemoMode: boolean
}

const initialAgents: Record<string, AgentState> = {
  pm:  { id: 'pm',  status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  tl:  { id: 'tl',  status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  dev: { id: 'dev', status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  qa:  { id: 'qa',  status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  ux:  { id: 'ux',  status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  pe:  { id: 'pe',  status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  sec: { id: 'sec', status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
  rel: { id: 'rel', status: 'IDLE', currentTask: '',  duration: 0, lastActivity: '--', filesAccessed: [], filesChanged: [], toolsUsed: [] },
}

export const state: AppState = {
  agents: { ...initialAgents },
  events: [],
  isDemoMode: false,
}

export function updateAgent(id: string, patch: Partial<AgentState>) {
  if (!state.agents[id]) return
  state.agents[id] = { ...state.agents[id], ...patch }
}

export function pushEvent(ev: DomainEvent) {
  state.events.unshift(ev)
  if (state.events.length > 500) state.events.pop()
}

export function resetAgent(id: string) {
  if (!state.agents[id]) return
  state.agents[id] = { ...initialAgents[id] }
}

export function getSnapshot() {
  return {
    agents: state.agents,
    events: state.events.slice(0, 50),
    isDemoMode: state.isDemoMode,
  }
}
