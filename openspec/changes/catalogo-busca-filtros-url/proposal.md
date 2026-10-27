# Proposal

## Why

O README (§3 "Catálogo e detalhe") exige que busca, filtros, ordenação e paginação componham a URL, sobrevivam a refresh e ao histórico, sejam combináveis e reiniciem a paginação quando um **Filtro** muda. A tela Início já tem uma primeira versão (`homeSearch.ts`, `HomePage.tsx`, handler MSW `/api/nfts`), mas o comportamento não está especificado nem coberto por nenhum teste E2E (`tests/e2e/flows/` está vazio), e há lacunas de borda: campos de busca e preço não acompanham a URL ao voltar no histórico, página fora do intervalo não é tratada e coleção inexistente na URL não é distinguida de "sem resultado".

## What Changes

- Formalizar o contrato da URL do catálogo: parâmetros `q`, `collection`, `rarity`, `minPrice`, `maxPrice`, `sort`, `page`; padrões `sort=recent` e `page=1`.
- Tratar valores inválidos escritos à mão (raridade fora do domínio, página não inteira/menor que 1, preço não decimal, ordenação desconhecida): são ignorados e a página não quebra.
- Tratar página acima do total de páginas: ir para a última página existente.
- Manter o campo de busca e os campos de preço sincronizados com a URL (refresh, voltar/avançar, "limpar filtros").
- Estado vazio com mensagem e ação "Limpar filtros" sempre que houver filtro ativo.
- Cobrir os 3 cenários do autor e as bordas acima com testes E2E Playwright contra os mocks MSW.
- Sem mudança de contrato REST (`GET /api/nfts` já aceita os parâmetros) nem de fixtures (36 NFTs, 6 coleções de 6, 9 por página).

## Capabilities

### New Capabilities
- `catalog-search-url`: estado de busca, filtros, ordenação e paginação do catálogo na URL — leitura tolerante, reinício de paginação, sincronização com a UI e estado vazio.

### Modified Capabilities

<!-- Nenhuma: openspec/specs/ está vazio. -->

## Impact

- Código: `src/modules/catalog/presentation/pages/homeSearch.ts`, `HomePage.tsx` (sincronização dos campos, página fora do intervalo); eventualmente um hook em `presentation/hooks/`.
- Testes: novo fluxo E2E em `tests/e2e/flows/` (hoje vazio) e, se necessário, helpers em `tests/e2e/support/`.
- Mocks: nenhum ajuste previsto; os cenários dependem das fixtures determinísticas atuais.
- Fora de escopo: favoritos, detalhe do NFT, tempo real (`nft.updated`) no catálogo, regressão visual, Lighthouse, contagem de resultados por coleção sob filtros.
