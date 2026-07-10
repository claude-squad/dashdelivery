import type { FastifyInstance } from 'fastify'
import type { Server } from 'socket.io'
import { nanoid } from 'nanoid'

interface Demand {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  requestedBy: string
  createdAt: string
  repository?: string
  branch?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'not_requested'
  approvedBy?: string
  approvedAt?: string
  approveComment?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
}

// In-memory demands store (Phase 3: PostgreSQL/Prisma)
const demands = new Map<string, Demand>()

export function registerDemandRoutes(app: FastifyInstance, io: Server) {
  app.get('/api/demands', async (_req, reply) => {
    reply.send(Array.from(demands.values()))
  })

  app.get('/api/demands/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const demand = demands.get(id)
    if (!demand) return reply.status(404).send({ error: 'Not found' })
    reply.send(demand)
  })

  app.post('/api/demands', async (req, reply) => {
    const body = req.body as Omit<Demand, 'id' | 'createdAt' | 'status'>
    const demand: Demand = {
      id: `DE-${new Date().toISOString().substring(0, 10)}-${nanoid(4).toUpperCase()}`,
      ...body,
      status: 'INTAKE',
      createdAt: new Date().toISOString(),
    }
    demands.set(demand.id, demand)

    // Broadcast new demand to all connected clients
    io.emit('demand:created', demand)
    io.emit('event:new', {
      id: nanoid(), eventType: 'demand.created', timestamp: demand.createdAt,
      demandId: demand.id, summary: `Nova demanda criada: ${demand.title}`,
      metadata: { priority: demand.priority }, correlationId: nanoid(8),
    })

    reply.status(201).send(demand)
  })

  app.patch('/api/demands/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const demand = demands.get(id)
    if (!demand) return reply.status(404).send({ error: 'Not found' })

    const updated = { ...demand, ...(req.body as Partial<Demand>) }
    demands.set(id, updated)
    io.emit('demand:updated', updated)
    reply.send(updated)
  })

  // POST /api/demands/:id/approve
  app.post('/api/demands/:id/approve', async (req, reply) => {
    const { id } = req.params as { id: string }
    const demand = demands.get(id)
    if (!demand) return reply.status(404).send({ error: 'Not found' })

    const body = req.body as { comment?: string; approvedBy: string }
    if (!body.approvedBy) {
      return reply.status(400).send({ error: 'approvedBy is required' })
    }

    const now = new Date().toISOString()
    const updated: Demand = {
      ...demand,
      status: 'DONE',
      approvalStatus: 'approved',
      approvedBy: body.approvedBy,
      approvedAt: now,
      approveComment: body.comment,
    }
    demands.set(id, updated)

    io.emit('demand:approved', updated)
    io.emit('demand:updated', updated)
    io.emit('event:new', {
      id: nanoid(),
      eventType: 'demand.approved',
      timestamp: now,
      demandId: id,
      summary: `Demanda aprovada por ${body.approvedBy}`,
      metadata: { approvedBy: body.approvedBy, comment: body.comment },
      correlationId: nanoid(8),
    })

    reply.send(updated)
  })

  // POST /api/demands/:id/reject
  app.post('/api/demands/:id/reject', async (req, reply) => {
    const { id } = req.params as { id: string }
    const demand = demands.get(id)
    if (!demand) return reply.status(404).send({ error: 'Not found' })

    const body = req.body as { reason: string; rejectedBy: string }
    if (!body.reason) {
      return reply.status(400).send({ error: 'reason is required' })
    }
    if (!body.rejectedBy) {
      return reply.status(400).send({ error: 'rejectedBy is required' })
    }

    const now = new Date().toISOString()
    const updated: Demand = {
      ...demand,
      status: 'BLOCKED',
      approvalStatus: 'rejected',
      rejectedBy: body.rejectedBy,
      rejectedAt: now,
      rejectionReason: body.reason,
    }
    demands.set(id, updated)

    io.emit('demand:rejected', updated)
    io.emit('demand:updated', updated)
    io.emit('event:new', {
      id: nanoid(),
      eventType: 'demand.rejected',
      timestamp: now,
      demandId: id,
      summary: `Demanda reprovada por ${body.rejectedBy}: ${body.reason}`,
      metadata: { rejectedBy: body.rejectedBy, reason: body.reason },
      correlationId: nanoid(8),
    })

    reply.send(updated)
  })
}
