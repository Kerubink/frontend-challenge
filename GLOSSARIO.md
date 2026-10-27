# Glossário do Marketplace de NFTs

Fonte única dos termos: o `README.md` do desafio (enunciado, papel de dono do negócio).
Cada termo aponta a frase do README de onde veio.

## Contexto 1 — Catálogo (descoberta)

Pasta: `src/modules/catalog/`

| Termo | O que significa neste contexto | Frase do README |
|---|---|---|
| **NFT** | Item colecionável à venda, com nome, coleção, raridade, galeria e preço em ETH. | §3 "Detalhes do NFT: Galeria, informações, edição, quantidade, favoritos e compra" |
| **Edição** | A tiragem do NFT que ainda pode ser comprada; quando acaba, o NFT fica indisponível. | §3 "O detalhe deve suportar ... edição indisponível e limite de quantidade" |
| **Filtro** | Critério (coleção, raridade, faixa de preço) que restringe a lista; vive na URL e reinicia a paginação ao mudar. | §3 "Filtros devem ser combináveis; mudança de filtro deve reiniciar a paginação" |

## Contexto 2 — Checkout (compra)

Pasta: `src/modules/checkout/`

| Termo | O que significa neste contexto | Frase do README |
|---|---|---|
| **Cotação** | Valores calculados pela API para o carrinho naquele instante (subtotal, desconto, taxa de rede, total); é a referência para fechar o pedido. | §3 "A cotação da API é a referência para finalizar o pedido" |
| **Pedido** | A compra enviada, com estado pendente, confirmado ou recusado; os dois últimos são terminais e a mesma tentativa nunca gera dois. | §3 "Impedir pedidos duplicados ..."; §7 "Pedidos confirmados ou recusados são terminais" |
| **Recibo** | Retrato imutável do pedido (itens, taxas, total) mostrado na confirmação. | §3 "O recibo deve reproduzir o snapshot do pedido" |

## Palavra que muda de sentido entre os contextos: **Preço**

- **No Catálogo:** é o valor **anunciado** do NFT, que pode mudar a qualquer momento
  (evento `nft.updated`) e é o que a vitrine mostra. Fonte: §7 "`nft.updated` — Atualizar preço e disponibilidade no catálogo".
- **No Checkout:** é o valor **cotado e aceito** pela pessoa naquele momento; se o preço anunciado
  mudar depois, o pedido não pode confirmar sem nova confirmação, e no Recibo ele nunca mais muda.
  Fonte: §3 "Revalidar preço ... antes de confirmar a compra. Mudanças devem exigir nova confirmação" e
  "Alterações posteriores no catálogo não podem modificar seus valores".

Mesmo nome, dois significados: no Catálogo o preço é vivo; no Checkout ele é uma promessa
congelada. Por isso o código não compartilha um tipo `Price` entre os contextos.
