# Cotação desatualizada no Checkout — spec

**Bounded context (semana 5):** Checkout
**ADR relacionada:** [docs/adr/0001-cotacao-desatualizada-no-checkout.md](adr/0001-cotacao-desatualizada-no-checkout.md)
**Escala:** M — ver régua no README.md

## Contexto

O colecionador escolhe NFTs, coloca no carrinho e vai pagar em ETH. No meio do caminho o preço ou a disponibilidade muda, e ele diz: "Coloquei no carrinho por um valor, abri o pagamento e o total era outro. Eu nem vi o preço mudar. Como confio no que vou pagar?" Outra queixa: "A edição que eu queria acabou enquanto eu preenchia os dados, e eu só descobri no fim." O custo sustentado pelo enunciado é qualitativo (pagar valor diferente do aceito, compra impossível, perda de confiança); não há número. As falas são reconstrução e precisam de validação com um colecionador real.

## Decisão

A cotação mais recente é a referência para fechar o pedido. Quando o preço ou a disponibilidade muda, o Checkout avisa o colecionador, atualiza o resumo (subtotal, desconto, taxa de rede, total) e exige nova confirmação. O pedido nunca é confirmado com cotação antiga. Ver a ADR-0001.

## Fora de escopo

- Pedido duplicado e interrupção de conexão com pedido pendente: o RESEARCH.md os cita como dor, mas esta spec trata só da cotação desatualizada.
- Como a mudança chega ao Checkout e qualquer escolha técnica: o RESEARCH.md não define, e isso é implementação.
- Frequência das mudanças, prazo de validade da cotação e tratamento de mudança que afeta só parte da quantidade: o RESEARCH.md não traz esses dados.
- Conteúdo do Recibo e validação das falas com um colecionador real.

## Critérios (EARS)

> Nota sobre "Origem": a seção do enunciado é a que o RESEARCH.md cita (seção 7; seção 3, trechos "Carrinho" e "Pagamento e confirmação"). O RESEARCH.md não diz qual trecho sustenta cada frase; por isso cada origem aponta o trecho que o RESEARCH.md cita para aquele assunto.

1. **Ubíqua.** O Checkout deve usar a cotação mais recente como referência para fechar o pedido.
   **Origem:** "A cotação mais recente é a referência para finalizar o pedido." (RESEARCH.md, "O que já foi tentado"). Enunciado: seção 3, "Carrinho e Pagamento" ("A cotação da API é a referência para finalizar o pedido").

2. **Orientada a evento.** Quando o preço ou a disponibilidade de um NFT no carrinho mudar, o Checkout deve avisar o colecionador, atualizar o resumo (subtotal, desconto, taxa de rede e total) e exigir nova confirmação.
   **Origem:** "A interface precisa informar a alteração e atualizar o resumo (subtotal, desconto, taxa de rede e total)." e "mudanças devem exigir nova confirmação do usuário" (RESEARCH.md, "Em que momento ela aparece" e "Tempo e retrabalho"). Enunciado: seção 3, "Pagamento e confirmação" ("Mudanças devem exigir nova confirmação do usuário") e seção 7, passo 3 do cenário.

3. **Orientada a estado.** Enquanto a cotação exibida for mais antiga que a cotação mais recente, o Checkout não deve confirmar o pedido.
   **Origem:** "No pagamento, a confirmação não pode acontecer com a cotação antiga." (RESEARCH.md, "Em que momento ela aparece"). Enunciado: seção 7, passo 4 ("O checkout impede a confirmação com uma cotação desatualizada").

4. **Feature opcional.** Onde houver cupom aplicado ao carrinho, o Checkout deve revalidar o cupom e a taxa de rede no pagamento.
   **Origem:** "Cupom e taxas. Eles também são revalidados no pagamento, então a dor não se limita ao preço do NFT." (RESEARCH.md, "Pontos do fluxo em que a dor se agrava"). Enunciado: seção 3, "Pagamento e confirmação".

5. **Comportamento indesejado.** Se chegar uma notícia de mudança repetida ou mais antiga que o estado já exibido, então o Checkout deve ignorá-la, sem desfazer o estado mais recente nem reaplicar efeitos.
   **Origem:** "Notícias repetidas ou antigas sobre uma mudança não podem desfazer um estado mais recente nem reaplicar efeitos." (RESEARCH.md, "O que já foi tentado"). Enunciado: seção 7.

## Cenários (BDD)

Os valores em ETH são exemplos para o teste; a taxa de rede de 0,016 ETH é a das simulações do projeto. "Notícia" é uma mudança de preço ou disponibilidade que chega ao Checkout com um número de versão.

```gherkin
Cenário: preço muda com o carrinho aberto
Dado um carrinho com 2 unidades de um NFT cotado a 1,00 ETH, sem desconto, com taxa de rede de 0,016 ETH e total de 2,016 ETH
Quando o preço desse NFT muda para 1,20 ETH
Então o Checkout avisa o colecionador da mudança
E o resumo mostra subtotal 2,40 ETH, taxa de rede 0,016 ETH e total 2,416 ETH
E o pedido só pode ser enviado após nova confirmação do colecionador
```

```gherkin
Cenário: confirmar com a cotação antiga (erro)
Dado que o colecionador viu o total de 2,016 ETH
E o preço mudou para 1,20 ETH, tornando o total mais recente 2,416 ETH
Quando ele tenta confirmar o pedido sem ter aceitado o total de 2,416 ETH
Então nenhum pedido é confirmado
E os 2 itens continuam no carrinho
E o Checkout mostra o total de 2,416 ETH para nova confirmação
```

```gherkin
Cenário: notícia de mudança mais antiga que o estado exibido (limite)
Dado que o resumo já mostra o preço de 1,20 ETH e total de 2,416 ETH
Quando chega uma notícia mais antiga dizendo que o preço era 1,10 ETH
Então o resumo continua com preço de 1,20 ETH e total de 2,416 ETH
E nenhum novo aviso é mostrado ao colecionador
```

## Como eu vou saber que funcionou

Os 3 cenários acima rodam como teste (semana 8) e passam. Ainda não há comando definido: o RESEARCH.md não traz ferramenta nem projeto de teste, e esta sessão não cria implementação. Falta também validar as falas com um colecionador real.

## Linguagem ubíqua usada aqui

| Termo | O que significa neste projeto |
|---|---|
| Cotação | Valores calculados pela API para o carrinho naquele instante (subtotal, desconto, taxa de rede, total); é a referência para fechar o pedido. |
| Pedido | A compra enviada, com estado pendente, confirmado ou recusado; os dois últimos são terminais e a mesma tentativa nunca gera dois. |
| Recibo | Retrato imutável do pedido (itens, taxas, total) mostrado na confirmação. |
| Preço | No Catálogo é o valor anunciado (vivo); no Checkout é o valor cotado e aceito (congelado). |
