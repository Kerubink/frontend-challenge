import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

/**
 * Servidor Socket.IO simulado: o MSW intercepta o WebSocket do `socket.io-client`
 * (transporte `websocket`) e o binding codifica/decodifica o protocolo.
 * Limitações: sem rooms, namespaces nem polling HTTP; handshake e ping são simulados aqui.
 */
const PING_INTERVAL_MS = 20_000
const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
// Sem o path `/socket.io/`: o msw 3 o remove da URL do cliente antes de casar o handler.
const link = ws.link(`${protocol}://${location.host}`)

type Emit = (event: string, ...data: unknown[]) => void
const clients = new Set<Emit>()

/** Envia o evento a todos os clientes conectados (como `io.emit` num servidor real). */
export function broadcast(event: string, payload: unknown) {
  clients.forEach((emit) => emit(event, payload))
}

export const socketHandlers = [
  link.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    // O binding só envia o handshake se `server.socket` lançar; no msw 3 isso não acontece,
    // então o handshake do Engine.IO (0) e a admissão ao namespace (40) são enviados aqui.
    connection.client.send('0' + JSON.stringify({ sid: 'mock', upgrades: [], pingInterval: 25000, pingTimeout: 5000 }))
    connection.client.send('40' + JSON.stringify({ sid: 'mock' }))
    const emit: Emit = (event, ...data) => io.client.emit(event, ...data)
    clients.add(emit)
    // O cliente derruba a conexão se o servidor ficar mudo além de pingInterval + pingTimeout.
    const ping = setInterval(() => connection.client.send('2'), PING_INTERVAL_MS)
    connection.client.addEventListener('close', () => {
      clearInterval(ping)
      clients.delete(emit)
    })
  }),
]
