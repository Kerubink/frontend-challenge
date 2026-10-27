# ADR-0001: Exigir nova confirmação do colecionador quando a cotação mudar no Checkout

## Status

Aceita

## Contexto

O colecionador coloca NFTs no carrinho com o preço de vitrine do Catálogo e, até o pedido ser confirmado, o preço ou a disponibilidade pode mudar. Na fala reconstruída dele: "Coloquei no carrinho por um valor, abri o pagamento e o total era outro. Eu nem vi o preço mudar." No Checkout o preço deixa de ser informação viva e vira compromisso (o valor cotado e aceito), então a travessia entre os dois sentidos é onde a dor aparece. Confirmar com cotação antiga é tratado como falha grave no enunciado do desafio. A dor tem consequência em dinheiro (pagar em ETH valor diferente do aceito), mas o RESEARCH.md não traz número nenhum; as falas são reconstrução e ainda não foram validadas com um colecionador real.

## Decisão

Vamos tratar a cotação mais recente como a única referência para fechar o pedido. Quando o preço ou a disponibilidade mudar, o Checkout avisa o colecionador, atualiza o resumo (subtotal, desconto, taxa de rede e total) e exige nova confirmação; o pedido nunca é confirmado com cotação antiga.

## Alternativas consideradas

- **Avisar da mudança, mas deixar confirmar o pedido com a cotação antiga:** descartada. É a falha grave descrita no enunciado e o colecionador pagaria valor diferente do que aceitou.
- **Atualizar o resumo em silêncio e confirmar com a cotação nova:** descartada. O enunciado pede que mudanças exijam nova confirmação, e a queixa do colecionador é justamente não ter visto o preço mudar.

## Consequências

**Positivas:**
- O valor cobrado é sempre o que o colecionador viu e aceitou; o Recibo reproduz esse retrato.
- Cupom e taxas passam pela mesma regra, porque também são revalidados no pagamento.

**Negativas / trade-offs:**
- O colecionador refaz revisão e confirmação a cada mudança; em catálogo volátil isso pode irritar.
- Não está decidido aqui (o RESEARCH.md não sustenta): com que frequência o preço muda, que antecedência o aviso exige e o que fazer quando só parte da quantidade é afetada. Fica para a implementação ou para uma ADR nova.
