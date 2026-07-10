// POST /api/events — receives hook payloads from office-hook.js and Claude Code hooks
import type { FastifyInstance } from 'fastify'
import type { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import { updateAgent, pushEvent, resetAgent, getSnapshot } from '../store/state.js'
import { mapSubagentToAgent } from '../store/types.js'

interface HookPayload {
  phase: 'pre' | 'post' | 'stop'
  toolName?: string
  subagentType?: string
  agentId?: string
  taskDescription?: string
  filePath?: string
  command?: string
  result?: string
  error?: string
  demandId?: string
  correlationId?: string
}

export function registerEventRoutes(app: FastifyInstance, io: Server) {
  // Receive hook events from office-hook.js / Claude Code hooks
  app.post('/api/events', async (req, reply) => {
    const payload = req.body as HookPayload
    const now = new Date().toISOString()
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const agentId = payload.agentId ?? (payload.subagentType ? mapSubagentToAgent(payload.subagentType) : 'dev')
    const demandId = payload.demandId ?? 'LIVE'
    const corrId = payload.correlationId ?? nanoid(8)

    if (payload.phase === 'pre') {
      // Agent started doing something
      const task = payload.taskDescription
        ?? (payload.filePath ? `Lendo ${payload.filePath}` : null)
        ?? (payload.command ? `Executando: ${payload.command.substring(0, 60)}` : null)
        ?? (payload.toolName ? `Usando ${payload.toolName}` : 'Processando...')

      const status = payload.toolName === 'Bash' ? 'RUNNING_TOOL'
        : payload.toolName === 'Agent' ? 'EXECUTING'
        : payload.toolName === 'Read' || payload.toolName === 'Grep' || payload.toolName === 'Glob' ? 'ANALYZING'
        : payload.toolName === 'Edit' || payload.toolName === 'Write' ? 'EXECUTING'
        : 'EXECUTING'

      updateAgent(agentId, { status, currentTask: task, lastActivity: time })

      const ev = {
        id: nanoid(), eventType: 'tool.started', timestamp: now,
        demandId, agentId,
        summary: task,
        metadata: { tool: payload.toolName, file: payload.filePath },
        correlationId: corrId,
      }
      pushEvent(ev)
      io.emit('agent:update', { agentId, patch: { status, currentTask: task } })
      io.emit('event:new', ev)
    }

    if (payload.phase === 'post') {
      // Agent completed a tool use
      const task = payload.result
        ? `Concluído: ${String(payload.result).substring(0, 80)}`
        : 'Ferramenta concluída'

      updateAgent(agentId, { status: 'EXECUTING', currentTask: task, lastActivity: time })

      const ev = {
        id: nanoid(), eventType: 'tool.completed', timestamp: now,
        demandId, agentId,
        summary: task,
        metadata: { tool: payload.toolName },
        correlationId: corrId,
      }
      pushEvent(ev)
      io.emit('agent:update', { agentId, patch: { status: 'EXECUTING', currentTask: task } })
      io.emit('event:new', ev)
    }

    if (payload.phase === 'stop') {
      // Session ended — reset all active agents
      Object.keys(getSnapshot().agents).forEach((id) => {
        const agent = getSnapshot().agents[id]
        if (agent.status !== 'IDLE') {
          resetAgent(id)
          io.emit('agent:update', { agentId: id, patch: { status: 'IDLE', currentTask: '' } })
        }
      })

      const ev = {
        id: nanoid(), eventType: 'workflow.completed', timestamp: now,
        demandId, summary: 'Sessão Claude Code encerrada',
        metadata: {}, correlationId: corrId,
      }
      pushEvent(ev)
      io.emit('event:new', ev)
    }

    reply.send({ ok: true })
  })

  // Direct agent state update (from any source)
  app.post('/api/agents/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const patch = req.body as Record<string, unknown>
    updateAgent(id, patch as Parameters<typeof updateAgent>[1])
    io.emit('agent:update', { agentId: id, patch })
    reply.send({ ok: true })
  })

  // Push a domain event
  app.post('/api/events/domain', async (req, reply) => {
    const ev = req.body as Parameters<typeof pushEvent>[0]
    ev.id = ev.id ?? nanoid()
    ev.timestamp = ev.timestamp ?? new Date().toISOString()
    pushEvent(ev)
    io.emit('event:new', ev)
    reply.send({ ok: true })
  })

  // Squad-state endpoint — compatible with existing office-hook.js polling
  app.get('/squad-state', async (_req, reply) => {
    const snap = getSnapshot()
    reply.send({
      timestamp: new Date().toISOString(),
      session: 'DashDelivery Live',
      project: 'Projeto_Claude_vscode',
      agents: Object.fromEntries(
        Object.entries(snap.agents).map(([id, a]) => [
          id,
          { status: a.status === 'IDLE' ? 'idle' : a.status === 'EXECUTING' || a.status === 'RUNNING_TOOL' ? 'working' : a.status === 'COMPLETED' ? 'done' : a.status === 'FAILED' ? 'error' : 'idle',
            task: a.currentTask,
            since: a.lastActivity,
          }
        ])
      ),
    })
  })

  // Full state snapshot
  app.get('/api/state', async (_req, reply) => {
    reply.send(getSnapshot())
  })
}
