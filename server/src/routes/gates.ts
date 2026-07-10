// POST /api/demands/:id/gates/:gateId/run
// POST /api/demands/:id/gates/run-all
import type { FastifyInstance } from 'fastify'
import type { Server } from 'socket.io'
import { nanoid } from 'nanoid'

interface QualityGate {
  id: string
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'blocked'
  mandatory: boolean
  result?: string
}

// In-memory gate store keyed by demandId → gateId → QualityGate
const gateStore = new Map<string, Map<string, QualityGate>>()

function getGates(demandId: string): Map<string, QualityGate> {
  if (!gateStore.has(demandId)) {
    gateStore.set(demandId, new Map())
  }
  return gateStore.get(demandId)!
}

function simulateGateRun(
  demandId: string,
  gateId: string,
  io: Server,
): void {
  const gates = getGates(demandId)
  const gate = gates.get(gateId)
  if (!gate) return

  // Mark as running
  gate.status = 'running'
  gate.result = undefined
  gates.set(gateId, gate)

  io.emit('gate:update', {
    demandId,
    gateId,
    status: 'running',
    timestamp: new Date().toISOString(),
  })

  // Simulate execution: resolve after 2 seconds, 90% pass / 10% fail
  setTimeout(() => {
    const passed = Math.random() < 0.9
    gate.status = passed ? 'passed' : 'failed'
    gate.result = passed
      ? undefined
      : `Falha detectada: asserção inválida em ${gate.name} — verifique os logs de execução.`
    gates.set(gateId, gate)

    const eventPayload = {
      demandId,
      gateId,
      gate: { ...gate },
      timestamp: new Date().toISOString(),
    }

    io.emit('gate:update', { ...eventPayload, status: gate.status })
    io.emit('gate:completed', eventPayload)

    // Also emit domain event
    io.emit('event:new', {
      id: nanoid(),
      eventType: passed ? 'gate.passed' : 'gate.failed',
      timestamp: new Date().toISOString(),
      demandId,
      summary: passed
        ? `Gate "${gate.name}" passou com sucesso`
        : `Gate "${gate.name}" falhou`,
      metadata: { gateId, gateName: gate.name, result: gate.result },
      correlationId: nanoid(8),
    })
  }, 2000)
}

export function registerGateRoutes(app: FastifyInstance, io: Server) {
  // Seed a gate if not present (so the route is useful even without persistence)
  function ensureGate(demandId: string, gateId: string): QualityGate {
    const gates = getGates(demandId)
    if (!gates.has(gateId)) {
      gates.set(gateId, {
        id: gateId,
        name: gateId,
        status: 'pending',
        mandatory: false,
      })
    }
    return gates.get(gateId)!
  }

  // Run a single gate
  app.post('/api/demands/:id/gates/:gateId/run', async (req, reply) => {
    const { id, gateId } = req.params as { id: string; gateId: string }

    const gate = ensureGate(id, gateId)

    if (gate.status === 'running') {
      return reply.status(409).send({ error: 'Gate already running' })
    }

    // Accept optional body to upsert gate metadata
    const body = (req.body ?? {}) as Partial<QualityGate>
    const gates = getGates(id)
    gates.set(gateId, {
      ...gate,
      name: body.name ?? gate.name,
      mandatory: body.mandatory ?? gate.mandatory,
    })

    simulateGateRun(id, gateId, io)

    reply.send({ ok: true, gateId, status: 'running' })
  })

  // Run all gates for a demand
  app.post('/api/demands/:id/gates/run-all', async (req, reply) => {
    const { id } = req.params as { id: string }

    // Accept body with gates array to seed/upsert gates
    const body = (req.body ?? {}) as {
      gates?: Array<Partial<QualityGate> & { id: string }>
    }

    const gates = getGates(id)

    // Upsert from body if provided
    if (Array.isArray(body.gates)) {
      for (const g of body.gates) {
        if (!g.id) continue
        gates.set(g.id, {
          id: g.id,
          name: g.name ?? g.id,
          status: 'pending',
          mandatory: g.mandatory ?? false,
          result: undefined,
        })
      }
    }

    // Collect gates that need to run (pending or failed)
    const toRun = Array.from(gates.values()).filter(
      (g) => g.status === 'pending' || g.status === 'failed',
    )

    if (toRun.length === 0) {
      return reply.send({ ok: true, ran: 0, message: 'No runnable gates' })
    }

    // Stagger gate runs by 300ms to avoid thundering herd on the socket
    toRun.forEach((gate, idx) => {
      setTimeout(() => {
        simulateGateRun(id, gate.id, io)
      }, idx * 300)
    })

    reply.send({ ok: true, ran: toRun.length })
  })

  // GET all gates for a demand
  app.get('/api/demands/:id/gates', async (req, reply) => {
    const { id } = req.params as { id: string }
    const gates = getGates(id)
    reply.send(Array.from(gates.values()))
  })
}
