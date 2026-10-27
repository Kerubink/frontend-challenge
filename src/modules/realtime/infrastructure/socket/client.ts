import { NFT_UPDATED, type NftUpdatedEvent } from '../../domain/events/nft-updated'
import { toNftUpdated } from '../mappers/events'

export interface RealtimeHandlers {
  onNftUpdated: (event: NftUpdatedEvent) => void
  /** Chamado em toda reconexão (não na primeira conexão): hora de reconciliar via REST. */
  onReconnect: () => void
  /** Estado da conexão, para feedback na UI. */
  onStatus?: (connected: boolean) => void
}

/**
 * Conecta via socket.io-client e devolve a função que libera listeners e conexão.
 * O import é dinâmico de propósito: o engine.io captura `WebSocket` na carga do módulo,
 * então ele precisa carregar depois de o MSW (mocks) ter instalado o seu interceptador.
 */
export function connectRealtime(handlers: RealtimeHandlers): () => void {
  let disposed = false
  let release = () => {}

  void import('socket.io-client').then(({ io }) => {
    if (disposed) return
    const socket = io({ path: '/socket.io', transports: ['websocket'], reconnectionDelay: 500, reconnectionDelayMax: 5000 })
    let connectedBefore = false

    const onConnect = () => {
      handlers.onStatus?.(true)
      if (connectedBefore) handlers.onReconnect()
      connectedBefore = true
    }
    const onDisconnect = () => handlers.onStatus?.(false)
    const onNft = (payload: unknown) => {
      const event = toNftUpdated(payload)
      if (event) handlers.onNftUpdated(event)
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on(NFT_UPDATED, onNft)

    release = () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(NFT_UPDATED, onNft)
      socket.disconnect()
    }
  })

  return () => {
    disposed = true
    release()
  }
}
