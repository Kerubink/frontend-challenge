# Design

## Context

Estado atual (observado no código, ver proposal.md — Why):

- `homeSearch.ts`: schema Zod com `.catch(undefined)` por campo — valor inválido vira "ausente" sem derrubar os demais. `validateHomeSearch` é o `validateSearch` da rota `/`.
- `HomePage.tsx`: `update()` faz `navigate` com `page: patch.page ?? 1` (reinício de paginação centralizado). Campos `q`, `min`, `max` são `useState` inicializado **uma vez** a partir da URL.
- `useNfts`: `queryKey: ['nfts', filters]`, `signal` repassado ao Axios, `keepPreviousData`.
- Handler MSW `/api/nfts`: filtra, ordena, pagina (9 por página) e devolve `total`, `page`, `collections`. Página acima do total devolve `items: []` com `page` ecoado. Fixtures: 36 NFTs, 6 coleções de 6 itens, raridades sorteadas por PRNG fixo (seed 42).
- Contagem por coleção (`collections`) é calculada sobre o catálogo inteiro, não sobre o resultado filtrado.

## Goals / Non-Goals

**Goals:**
- Fechar as lacunas de borda da spec `catalog-search-url` (campos fora de sincronia, página fora do intervalo) com mudança mínima no que já existe.
- Provar os 3 cenários do autor e as bordas por E2E contra MSW.

**Non-Goals:**
- Novo contrato REST, novas fixtures, tempo real, favoritos, detalhe, visual regression.
- Reescrever `HomePage` ou extrair componentes além do necessário.

## Decisions

1. **Validação tolerante continua por campo, na borda da rota.** Mantém-se `validateSearch` + `.catch(undefined)`. Alternativa (rejeitar a URL e redirecionar para `/`) descartada: perderia os parâmetros válidos e contraria o cenário 3.
2. **URL não é reescrita para remover valor inválido** (ex.: `rarity=Lendário` permanece na barra até a próxima navegação); ele só é ignorado na consulta e na UI. Alternativa: `replace` sanitizando a URL — mais limpo, porém gera redirecionamento extra e navegação no histórico; adiada.
3. **Campos de texto derivados da URL.** `q`, `minPrice` e `maxPrice` passam a ressincronizar o estado local quando a URL muda (efeito por valor da URL ou `key` no formulário), mantendo o rascunho enquanto a pessoa digita sem submeter. "Limpar filtros" e histórico passam a refletir nos campos. Alternativa: tornar os inputs totalmente controlados pela URL (navegar a cada tecla) — descartada: dispara requisição por tecla e polui o histórico.
4. **Página fora do intervalo corrigida no cliente.** Quando `data.total > 0` e `search.page > totalPages`, navegar com `replace` para a última página. Não se altera o handler MSW (mantém-se espelho de uma API real que devolve lista vazia). Alternativa: API clampar a página — muda o contrato e o mock sem ganho.
5. **Mensagem vazia vs. página fora do intervalo.** A ação "Limpar filtros" só aparece com filtro/busca ativos; "ativo" considera apenas valores já validados (raridade inválida não conta).
6. **Cache e obsolescência inalterados:** chave `['nfts', filters]` com parâmetros normalizados, `AbortSignal` no Axios, `keepPreviousData`. Catálogo é público, sem chave por usuário. O teste de resposta obsoleta usa latência controlada pelo cenário MSW/`page.route` de rede (nunca setters).
7. **Testes:** E2E em `tests/e2e/flows/catalog-url.spec.ts`, Chromium, 1440 e 390 px. Os números do enunciado (6 NFTs de "Kurio Apes", 4 páginas) vêm das fixtures; asserções de ordem usam preços lidos da UI, não valores fixos, para não acoplar a ajustes de fixtures. O "primeiro épico" é calculado a partir da própria lista exibida na ordenação vigente (padrão: mais recente primeiro).

## Risks / Trade-offs

- [Efeito de sincronização sobrescrever o que a pessoa está digitando] → só ressincronizar quando o valor **da URL** muda, não a cada render; teste de digitar sem submeter.
- [Redirecionamento da página fora do intervalo gerar loop] → condicionar a `total > 0` e usar `replace`; teste com página 99.
- [Raridade inválida permanece na URL] → aceito (decisão 2); documentado na spec como "ignorada", não "removida".
- [Testes dependentes do PRNG das fixtures] → asserções derivadas da UI; contagens fixas só onde o enunciado as fixa (36, 9/página, 6 por coleção).
