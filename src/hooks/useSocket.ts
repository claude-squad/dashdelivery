import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useStore } from '@/store/useStore'
import type { AgentInstance, Demand, DomainEvent } from '@/types'

const SERVER_URL = 'http://localhost:3001'

export function useSocket() {
  const { setDemoMode, updateAgentInstance, pushEvent, addDemand } = useStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 4000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[DashDelivery] Server connected — live mode activates on first real agent update')
      // Não força demo=false aqui: só muda quando receber update real de agente
    })

    socket.on('disconnect', () => {
      console.log('[DashDelivery] Server disconnected — demo mode')
      setDemoMode(true)
    })

    // Snapshot inicial — aplica apenas eventos; ignora agentes em demo mode
    // (servidor inicializa todos como IDLE, o que sobrescreveria os demo instances)
    socket.on('state:snapshot', (snap: { agents: Record<string, AgentInstance>; events: DomainEvent[] }) => {
      if (!useStore.getState().isDemoMode) {
        Object.entries(snap.agents).forEach(([id, agent]) => updateAgentInstance(id, agent))
      }
      snap.events.forEach((ev) => pushEvent(ev))
    })

    // Update incremental de agente — sinal de hook real rodando
    socket.on('agent:update', ({ agentId, patch }: { agentId: string; patch: Partial<AgentInstance> }) => {
      // Só sai do demo mode quando aparecer atividade real (não-IDLE)
      if (patch.status && patch.status !== 'IDLE') {
        setDemoMode(false)
      }
      updateAgentInstance(agentId, patch)
    })

    // Tick de duração em lote
    socket.on('agents:tick', (patches: Array<{ agentId: string; patch: { duration: number } }>) => {
      patches.forEach(({ agentId, patch }) => updateAgentInstance(agentId, patch))
    })

    socket.on('event:new', (ev: DomainEvent) => {
      pushEvent(ev)
    })

    socket.on('demand:created', (demand: Demand) => {
      addDemand(demand)
    })

    return () => { socket.disconnect() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
