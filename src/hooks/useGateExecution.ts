import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function useGateExecution() {
  const pendingExecution = useStore((s) => s.pendingExecution)
  const setPendingExecution = useStore((s) => s.setPendingExecution)
  const setGateExecution = useStore((s) => s.setGateExecution)
  const updateAgentInstance = useStore((s) => s.updateAgentInstance)
  const updateDemandGate = useStore((s) => s.updateDemandGate)
  const runningRef = useRef(false)

  useEffect(() => {
    if (!pendingExecution || runningRef.current) return

    const { demandId, gates } = pendingExecution
    runningRef.current = true
    setPendingExecution(null)

    const demandTitle =
      useStore.getState().demands.find((d) => d.id === demandId)?.title ?? ''

    const run = async () => {
      setGateExecution({
        isRunning: true,
        demandId,
        demandTitle,
        currentGateName: null,
        currentAgentId: null,
        completed: 0,
        total: gates.length,
        failed: 0,
      })

      let failedCount = 0

      for (let i = 0; i < gates.length; i++) {
        const gate = gates[i]
        const agentId = gate.agentId

        setGateExecution({
          isRunning: true,
          demandId,
          demandTitle,
          currentGateName: gate.name,
          currentAgentId: agentId ?? null,
          completed: i,
          total: gates.length,
          failed: failedCount,
        })

        if (agentId) {
          updateAgentInstance(agentId, {
            status: 'EXECUTING',
            currentTask: `Executando gate: ${gate.name}`,
          })
        }

        updateDemandGate(demandId, gate.id, { status: 'running', result: undefined })
        await sleep(1200 + Math.random() * 800)
        const pass = Math.random() > 0.12

        updateDemandGate(demandId, gate.id, {
          status: pass ? 'passed' : 'failed',
          result: pass ? 'Concluído sem erros' : 'Falha detectada — verifique o log',
        })

        if (agentId) {
          updateAgentInstance(agentId, {
            status: pass ? 'COMPLETED' : 'BLOCKED',
            currentTask: pass ? `Gate aprovado: ${gate.name}` : `Falha em: ${gate.name}`,
          })
          await sleep(2000)
          if (i < gates.length - 1) {
            updateAgentInstance(agentId, {
              status: 'EXECUTING',
              currentTask: 'Aguardando próxima validação',
            })
          }
        }

        const updatedGate = useStore
          .getState()
          .demands.find((d) => d.id === demandId)
          ?.qualityGates.find((g) => g.id === gate.id)
        if (updatedGate?.status === 'failed') failedCount++

        await sleep(200)
      }

      // Reseta todos os agentes participantes para IDLE
      const participatingIds = new Set<string>()
      gates.forEach((g) => {
        if (g.agentId) participatingIds.add(g.agentId)
      })
      participatingIds.forEach((id) => {
        updateAgentInstance(id, { status: 'IDLE', currentTask: '' })
      })

      setGateExecution({
        isRunning: false,
        demandId,
        demandTitle,
        currentGateName: null,
        currentAgentId: null,
        completed: gates.length,
        total: gates.length,
        failed: failedCount,
      })

      runningRef.current = false
    }

    run()
  }, [pendingExecution]) // eslint-disable-line react-hooks/exhaustive-deps
}
