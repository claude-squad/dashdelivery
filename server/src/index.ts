import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Server as SocketServer } from 'socket.io'
import { createServer } from 'http'
import { registerEventRoutes } from './routes/events.js'
import { registerDemandRoutes } from './routes/demands.js'
import { registerGateRoutes } from './routes/gates.js'
import { getSnapshot, updateAgent } from './store/state.js'

const PORT = Number(process.env.PORT ?? 3001)

async function main() {
  const app = Fastify({ logger: { level: 'warn' } })

  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })

  // Socket.IO on top of the same HTTP server
  const httpServer = createServer(app.server)
  const io = new SocketServer(httpServer, {
    cors: { origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    // Send full state snapshot on connect
    socket.emit('state:snapshot', getSnapshot())

    socket.on('agent:set', ({ agentId, patch }: { agentId: string; patch: Record<string, unknown> }) => {
      updateAgent(agentId, patch as Parameters<typeof updateAgent>[1])
      io.emit('agent:update', { agentId, patch })
    })

    socket.on('disconnect', () => {})
  })

  registerEventRoutes(app, io)
  registerDemandRoutes(app, io)
  registerGateRoutes(app, io)

  // Duration ticker — increments duration for active agents every second
  const ACTIVE = new Set(['EXECUTING', 'RUNNING_TOOL', 'ANALYZING', 'PLANNING', 'VALIDATING'])
  setInterval(() => {
    const snap = getSnapshot()
    const patches: Array<{ agentId: string; patch: { duration: number } }> = []
    for (const [id, agent] of Object.entries(snap.agents)) {
      if (ACTIVE.has(agent.status)) {
        updateAgent(id, { duration: agent.duration + 1 })
        patches.push({ agentId: id, patch: { duration: agent.duration + 1 } })
      }
    }
    if (patches.length > 0) io.emit('agents:tick', patches)
  }, 1000)

  // Listen using raw httpServer (Socket.IO needs access to it)
  await new Promise<void>((resolve) => httpServer.listen(PORT, '0.0.0.0', resolve))
  console.log(`[DashDelivery] Server running on http://localhost:${PORT}`)
  console.log(`[DashDelivery] Socket.IO active`)
  console.log(`[DashDelivery] POST /api/events — receives Claude Code hook payloads`)
  console.log(`[DashDelivery] GET  /squad-state — compatible with office-hook.js`)
}

main().catch((err) => { console.error(err); process.exit(1) })
