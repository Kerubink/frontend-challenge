# Contrato de eventos (Socket.IO)

Transporte: `socket.io-client` (somente WebSocket, path `/socket.io`). Nos mocks, o MSW intercepta o
WebSocket (`ws.link`) e `@mswjs/socket.io-binding` codifica o protocolo (`src/mocks/socket/server.ts`).
Limitações da simulação: sem rooms, namespaces nem polling HTTP; handshake e ping são simulados.

## `nft.updated`

```json
{
  "id": "evt-nft-002-v2",
  "type": "nft.updated",
  "resource": { "type": "nft", "id": "nft-002" },
  "version": 2,
  "occurredAt": "2026-10-27T12:00:00.000Z",
  "data": {
    "priceEth": "1.20",
    "editions": [{ "label": "1/50", "available": 4 }]
  }
}
```

- `id` é estável: o mesmo id nunca é aplicado duas vezes.
- `version` por recurso: evento com versão menor ou igual à já conhecida é descartado (sem aviso e sem refetch).
- Evento válido não é aplicado direto no estado: o cliente rebusca a cotação na API (a referência para fechar o pedido).
- Após reconexão, carrinho e NFTs ativos são reconciliados via REST.

## Controle da simulação (apenas mocks)

- `POST /api/__mock__/nfts/:id` com `{ priceEth?, editions?, silent? }`: altera o NFT (versão + 1) e emite `nft.updated`;
  com `silent: true` só muda o REST (evento "perdido").
- `POST /api/__mock__/events` com um envelope pronto: reemite pelo servidor Socket.IO simulado (duplicado/antigo).
