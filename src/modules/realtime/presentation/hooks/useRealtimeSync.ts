import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createVersionGate } from '../../domain/services/version-gate'
import { connectRealtime } from '../../infrastructure/socket/client'
import { applyNftUpdated, reconcileActiveResources } from '../../application/use-cases/apply-nft-updated'

/**
 * Mantém a conexão Socket.IO enquanto `userKey` (usuário ou visitante) for o mesmo.
 * Trocar de usuário encerra a conexão e descarta o histórico de eventos da sessão anterior.
 * Devolve se a conexão está ativa.
 */
export function useRealtimeSync(userKey: string): boolean {
  const qc = useQueryClient()
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const gate = createVersionGate()
    let active = true
    const disconnect = connectRealtime({
      onNftUpdated: (event) => {
        if (active) applyNftUpdated(qc, gate, event)
      },
      onReconnect: () => {
        if (active) reconcileActiveResources(qc)
      },
      onStatus: (c) => {
        if (active) setConnected(c)
      },
    })
    return () => {
      active = false
      setConnected(false)
      disconnect()
    }
  }, [qc, userKey])
  return connected
}
