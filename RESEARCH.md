# RESEARCH — Cotação desatualizada no carrinho de NFTs

> Fonte única: o enunciado do Desafio Frontend (README.md desta pasta), principalmente a seção 7 e, nas seções 3, os trechos "Carrinho" e "Pagamento e confirmação". Nada aqui vem de entrevista. Onde o enunciado não sustenta uma afirmação, está escrito.

## Quem sente a dor

O **colecionador que está comprando**: a pessoa autenticada que já escolheu um ou mais NFTs, colocou no carrinho e está a caminho de pagar. O enunciado a trata como "colecionador" (dados do colecionador, perfil do colecionador, carteiras do colecionador). Ela usa carteira principal ou secundária, escolhe a rede e paga em ETH.

Um papel secundário também sofre: quem confere o recibo depois e espera que ele mostre exatamente o que foi cobrado. O enunciado exige que o recibo reproduza o retrato do pedido e não mude com alterações posteriores no catálogo.

Sem número no enunciado: quantos colecionadores, com que frequência compram ou com que perfil de gasto.

## Em que momento ela aparece

Entre o instante em que o NFT entra no carrinho e o instante em que o pedido é confirmado. O enunciado descreve o caminho em quatro passos:

1. Um NFT está no carrinho.
2. O preço ou a disponibilidade muda durante a navegação, ou seja, enquanto a pessoa está em outra tela ou com o carrinho aberto.
3. A interface precisa informar a alteração e atualizar o resumo (subtotal, desconto, taxa de rede e total).
4. No pagamento, a confirmação não pode acontecer com a cotação antiga.

Pontos do fluxo em que a dor se agrava, segundo o enunciado:

- **Revisão antes do envio.** A pessoa revisa valores que podem já estar velhos.
- **Pedido já enviado.** O enunciado pede tolerância a interrupção de conexão com o pedido pendente, sem criar outra compra.
- **Cupom e taxas.** Eles também são revalidados no pagamento, então a dor não se limita ao preço do NFT.
- **Quantidade.** A disponibilidade é por NFT e por edição. Uma edição pode esgotar enquanto a pessoa decide.
- **Várias unidades.** Uma mudança pode afetar só parte da quantidade pretendida. O enunciado fala em remover do carrinho "apenas os itens e quantidades comprados".

## O que essa pessoa diria, com as próprias palavras

*Reconstrução, não citação. Nenhuma fala foi coletada; o enunciado não traz depoimentos.*

> "Coloquei no carrinho por um valor, abri o pagamento e o total era outro. Eu nem vi o preço mudar. Como confio no que vou pagar?"

> "A edição que eu queria acabou enquanto eu preenchia os dados, e eu só descobri no fim."

> "Cliquei em confirmar e a tela ficou parada. Não sei se comprei, se não comprei, se vou ser cobrado duas vezes."

> "Quero que o recibo mostre o que eu aceitei pagar, não um valor que mudou depois."

## O que isso custa hoje

O enunciado não mede custo nenhum. O que ele sustenta são consequências qualitativas, que descrevo sem inventar número:

| Custo | O que o enunciado sustenta | Número |
| --- | --- | --- |
| **Dinheiro** | Pagar valor diferente do que a pessoa viu e aceitou; em ETH, com exigência de precisão decimal nos cálculos e na apresentação. | Sem número no enunciado |
| **Compra errada ou impossível** | Item esgotado ou com preço mudado no momento da compra; o enunciado prevê "conflito de disponibilidade". | Sem número no enunciado |
| **Compra duplicada** | Cliques repetidos ou reenvio após timeout podem gerar dois pedidos; o enunciado exige impedir isso. | Sem número no enunciado |
| **Incerteza** | Pedido pendente sem resposta, com recuperação esperada após atualizar a página ou reconectar. | Sem número no enunciado |
| **Confiança** | Confirmar com cotação antiga é tratado como falha grave: "compra confirmada sem resposta da simulação" é eliminatório na avaliação do desafio. | Sem número no enunciado |
| **Tempo e retrabalho** | A pessoa refaz revisão e confirmação a cada mudança ("mudanças devem exigir nova confirmação do usuário"). | Sem número no enunciado |

Única quantificação possível: quantidades são sempre inteiras e valores em ETH precisam manter precisão decimal. Isso descreve a natureza do dado, não o tamanho do prejuízo.

## O que já foi tentado (se algo foi)

O enunciado não registra tentativa anterior, gambiarra, processo manual ou ferramenta que falhou. **Sem registro no enunciado.**

O que ele traz é o que o resultado deve garantir, sem dizer como. Isso não é tentativa; é exigência:

- A cotação mais recente é a referência para finalizar o pedido.
- A pessoa é avisada da alteração e o resumo é atualizado.
- Mudanças exigem nova confirmação, e a confirmação não ocorre com cotação desatualizada.
- Notícias repetidas ou antigas sobre uma mudança não podem desfazer um estado mais recente nem reaplicar efeitos.
- Em falha, os itens ficam preservados no carrinho.

Pergunta em aberto para quem sente a dor: o que ela faz hoje quando desconfia que o preço mudou (recarrega, abre outra aba, desiste)? O enunciado não responde.

## Ligação com a semana 5

Contexto: **Checkout**, com os conceitos de **cotação, pedido e recibo**.

- **Cotação.** É o valor calculado para esta compra (subtotal, desconto, taxa de rede, total, disponibilidade). Vale por um momento e pode ficar velha. É a peça central da dor.
- **Pedido.** Nasce da cotação aceita. Tem estados pendente, confirmado e recusado; os dois últimos são terminais. Não pode ser duplicado.
- **Recibo.** Registro fiel do pedido no momento em que foi feito; não acompanha mudanças posteriores do catálogo.

**O preço muda de sentido entre Catálogo e Checkout.** No Catálogo, preço é informação de vitrine: indica quanto o NFT custa agora e pode mudar a qualquer momento. No Checkout, preço é compromisso: o valor que a pessoa aceitou e que será cobrado, congelado na cotação, no pedido e no recibo. A dor aparece exatamente na travessia entre os dois sentidos. O NFT sai do Catálogo com um preço de vitrine, passa pelo carrinho (que ainda mostra vitrine) e chega ao Checkout, onde esse número precisa virar compromisso. Se a vitrine mudou no meio do caminho, o número que a pessoa viu deixa de ser o que vale.

---

## Checklist de saída da sessão de Research

- [x] Não tem nenhuma palavra de solução técnica neste arquivo (nome de lib, de tabela, de
      endpoint). Se tiver, apague — isso é trabalho da sessão de Plan.
- [x] Uma pessoa que não conhece o seu projeto consegue ler isto e entender o problema.
- [ ] Você conseguiria mostrar este arquivo pra pessoa que sente a dor e ela diria "é
      isso mesmo" — não "não é bem assim". *Não verificado: sessão não interativa; as falas são reconstrução e precisam de validação com um colecionador real.*
