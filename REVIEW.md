# REVIEW — semanas 5 e 6 (RPI no Desafio Frontend)

Honestidade de processo: as sessões de Research, Plan e Implement rodaram como sessões separadas de agente
(`claude -p`), cada uma recebendo só o artefato da anterior. Quem escreveu e revisou foi o próprio
assistente de IA que montou esta entrega, não o aluno; **o aluno precisa ler, ajustar e assumir** estes
documentos (em especial os significados do `GLOSSARIO.md` e as falas do `RESEARCH.md`).

## O que pedi na sessão de Plan
Só o conteúdo do `RESEARCH.md`, o contexto (Checkout) e os 4 termos do glossário (Cotação, Pedido, Recibo, Preço). Pedi a ADR (escala M, 1-2 alternativas)
e o documento enxuto com 5 EARS (um de cada padrão), 3 cenários Gherkin com 1 de erro/limite, e "Origem:" ao lado de cada critério.

## O que o agente devolveu
ADR de 28 linhas e spec de 83 linhas, com os 5 padrões EARS, 3 cenários (preço muda; confirmar com cotação antiga; notícia antiga) e a ressalva de que as falas eram reconstrução.

## O que rejeitei ou reescrevi, e por quê
1. **Origem dos EARS (reescrito).** O Plan só via o `RESEARCH.md`, que cita seções do README em bloco; ele atribuiu o EARS 1 à §7, mas a frase "A cotação da API é a referência para finalizar o pedido" está na §3. Conferi cada critério contra o README e corrigi: EARS 1 → §3; EARS 2 → §3 "Pagamento e confirmação" + §7 passo 3; EARS 3 → §7 passo 4; EARS 5 → §7 ("tolerar duplicatas e eventos antigos").
2. **Números dos cenários (reescritos).** Ele inventou 0,50 → 0,60 ETH e taxa 0,01. A taxa de rede real do mock é 0,016 ETH. Troquei por 2 × 1,00 ETH → 2 × 1,20 ETH (total 2,016 → 2,416 ETH), números que o teste consegue produzir.
3. **ADR "Proposta" → "Aceita".** A decisão já é a que a implementação segue.
4. **Mantido de propósito:** o EARS 2 junta três respostas (avisar, atualizar o resumo, exigir nova confirmação). Poderia virar três critérios, mas as três vêm da mesma frase do Research; fica como ponto de melhoria.
5. **Critério sem origem não entrou:** pedido duplicado e interrupção de conexão (citados no Research) ficaram fora de escopo, em vez de virar EARS sem sustentação na spec.
6. **Vocabulário:** o agente trocou "evento" por "notícia" para respeitar "sem tecnologia"; mantive, e a spec define o termo.

## Implement (sessão 3)
Os 3 cenários viraram testes Playwright (`tests/e2e/flows/checkout-stale-quote.spec.ts`); `npm run typecheck` limpo e `npx playwright test`: **6 passed** (3 cenários × desktop/mobile), reexecutado por mim fora da sessão. O evento `nft.updated` passa pelo `socket.io-client` (MSW com `@mswjs/socket.io-binding`, com `overrides` por causa do msw 3).

Pontos a conferir: a sessão de Implement foi duplicada por acidente (um processo antigo continuou vivo) e as duas
sobrescreveram arquivos uma da outra no começo, então o resultado final foi validado só por typecheck e testes; o código de `CheckoutPage.tsx`
e `src/mocks/handlers/admin.ts` merece leitura humana. O `GLOSSARIO.md` e o rascunho das falas do Research não foram validados com um colecionador real.
