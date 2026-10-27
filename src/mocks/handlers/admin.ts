import { http, HttpResponse } from 'msw'
import { db, save } from '../db/db'
import { broadcast } from '../socket/server'
import { notFound } from './helpers'
import type { Edition } from '@/modules/catalog/domain/types'

/**
 * Controle da simulação (só no ambiente de mocks): altera o "backend" pela rede e
 * publica o evento correspondente pelo servidor Socket.IO simulado.
 */
export const adminHandlers = [
  // Muda preço/disponibilidade de um NFT: atualiza o banco (REST) e emite `nft.updated` (versão + 1).
  http.post('/api/__mock__/nfts/:id', async ({ request, params }) => {
    const nft = db().nfts.find((n) => n.id === params.id)
    if (!nft) return notFound('NFT não encontrado.')
    const b = (await request.json()) as { priceEth?: string; editions?: Edition[]; silent?: boolean }
    if (b.priceEth) nft.priceEth = b.priceEth
    if (b.editions) nft.editions = b.editions
    nft.version += 1
    save()
    const event = {
      id: `evt-${nft.id}-v${nft.version}`,
      type: 'nft.updated',
      resource: { type: 'nft', id: nft.id },
      version: nft.version,
      occurredAt: new Date().toISOString(),
      data: { priceEth: nft.priceEth, editions: nft.editions },
    }
    // `silent`: muda só o REST, como se o evento tivesse se perdido (a API continua sendo a verdade).
    if (!b.silent) broadcast('nft.updated', event)
    return HttpResponse.json({ nft, event })
  }),

  // Reemite um evento já montado (duplicado ou antigo), sem tocar no banco.
  http.post('/api/__mock__/events', async ({ request }) => {
    const event = (await request.json()) as { type: string }
    broadcast(event.type, event)
    return HttpResponse.json({ ok: true }, { status: 202 })
  }),
]
