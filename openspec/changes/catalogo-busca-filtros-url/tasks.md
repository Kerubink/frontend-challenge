# Tasks

## 1. Contrato da URL e valores inválidos

- [ ] 1.1 Cobrir `validateHomeSearch`/`normalizeHomeSearch` com testes unitários (raridade "Lendário", `sort=xyz`, `page=abc|0|-1`, `minPrice=abc`, número vindo como JSON) e verificar que cada valor inválido vira o padrão sem afetar os demais (`npm run test` ou runner configurado; se não houver runner, cobrir via E2E na tarefa 4.x e registrar a decisão)
- [ ] 1.2 Garantir que "filtro ativo" (exibição de "Limpar filtros") considere só valores já validados; verificar abrindo `/?rarity=Lend%C3%A1rio` sem busca e vendo que o botão não aparece

## 2. Sincronização dos controles com a URL

- [ ] 2.1 Ressincronizar campo de busca e campos de preço quando `q`/`minPrice`/`maxPrice` da URL mudarem (histórico, "Limpar filtros"), preservando rascunho em digitação; verificar manualmente voltar/avançar e coberto pelo E2E 4.4
- [ ] 2.2 Conferir que raridade e ordenação (selects) e coleção (`aria-pressed`) exibem o valor da URL após refresh; verificar no E2E 4.1

## 3. Página fora do intervalo

- [ ] 3.1 Em `HomePage`, quando `total > 0` e `page > totalPages`, navegar com `replace` para a última página, sem loop; verificar abrindo `/?page=99` e vendo "Página 4 de 4" com URL `page=4`

## 4. Testes E2E (Playwright, Chromium, 1440 e 390 px, contra MSW com `?reset=1`)

- [ ] 4.1 Cenário 1 — filtrar "Kurio Apes", ordenar por menor preço, recarregar: 6 NFTs, preços em ordem crescente, `collection` e `sort` na URL; teste passa
- [ ] 4.2 Cenário 2 — ir à página 3 do catálogo padrão, aplicar "Épico": URL com `page=1` (ou sem `page`), primeiro card é o primeiro épico da ordenação vigente (conferido com a raridade exibida no card/detalhe ou com a lista filtrada); teste passa
- [ ] 4.3 Cenário 3 — abrir `/?q=zzzz&rarity=Lendário`: mensagem de vazio, botão "Limpar filtros", sem tela de erro; acionar o botão restaura 36 NFTs/lista padrão e campo de busca vazio; teste passa
- [ ] 4.4 Bordas — histórico (voltar restaura campo de busca e lista), `page=99` → última página, `page=abc`, filtros combinados (coleção + raridade); testes passam
- [ ] 4.5 Resposta obsoleta — atrasar a resposta da combinação antiga pela rede (cenário de latência do MSW ou `page.route`) e verificar que a lista final é a da combinação atual; teste passa
- [ ] 4.6 Rodar a suíte completa nos dois viewports e verificar que não há overflow horizontal na tela Início com filtros aplicados

## 5. Documentação

- [ ] 5.1 Documentar em `ARCHITECTURE.md` o contrato da URL do catálogo, a política de valores inválidos (ignorar, não reescrever URL) e a correção de página fora do intervalo; verificar que os parâmetros descritos coincidem com `homeSearchSchema`
