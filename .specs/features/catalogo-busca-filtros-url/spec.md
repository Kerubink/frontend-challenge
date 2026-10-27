# Catálogo: busca e filtros que sobrevivem ao refresh Specification

**Approved**: <!-- pendente: a aprovação é da pessoa dona do produto; não escrita pelo agente -->

## Problem Statement

No Catálogo (`src/modules/catalog/`), a busca, os Filtros (coleção, raridade, faixa de preço), a ordenação e a página compõem o estado da URL (README §3 "Catálogo e detalhe"). Quem recarrega a página, compartilha o link ou volta pelo histórico precisa ver exatamente a mesma lista de NFTs. Mudar um Filtro reinicia a paginação, e um valor inválido digitado na URL não pode quebrar a tela.

## Goals

- [ ] Recarregar uma URL do catálogo com busca, Filtros e ordenação reproduz a mesma lista, na mesma ordem, com os controles refletindo o estado.
- [ ] Toda mudança de Filtro leva a URL para a página 1 e a lista para o início do novo resultado.
- [ ] Nenhum valor inválido na URL derruba a página; o valor inválido é ignorado e o resultado vazio é tratado com a ação "Limpar filtros".

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Detalhe do NFT, favoritos, carrinho | Outros contextos/telas; só o Catálogo entra aqui |
| Atualização de preço/disponibilidade por `nft.updated` na lista | Pertence ao contexto `realtime`; spec própria |
| Estado de erro (falha de rede/5xx) e respostas fora de ordem da listagem | README §3 pede, mas é outra preocupação; ver pergunta Q5 |
| Mudar fixtures, handlers MSW ou o tamanho de página (9) | Os cenários partem do catálogo padrão já existente (36 NFTs, 9 por página) |
| Novos Filtros ou novas opções de ordenação | Só os existentes: coleção, raridade, faixa de preço; `recent`, `price-asc`, `price-desc`, `name` |

---

## Assumptions & Open Questions

Q1 a Q6 foram respondidas pela pessoa dona do produto em 2026-10-27 (respostas citadas na coluna Confirmed). Isso não é a aprovação da spec.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Q1: valor inválido na URL (ex.: `rarity=Lendário`) | É ignorado na consulta e removido da URL por substituição (sem nova entrada no histórico) | Link compartilhado e refresh ficam estáveis; o cenário 3 só exige ignorar | y - user: "Q1 remover da URL sem nova entrada no histórico" |
| Q2: busca (`q`) e ordenação também reiniciam a página | Sim, qualquer mudança de `q`, Filtro ou `sort` leva a `page=1` | A página N de outra ordenação/busca perde sentido; o código atual já faz isso | y - user: "Q2 sim, mudar busca ou ordenação também volta à página 1" |
| Q3: "Limpar filtros" | Remove `q`, `collection`, `rarity`, `minPrice`, `maxPrice`, `sort` e `page` (volta ao catálogo padrão) | Um único gesto devolve a lista completa; o código atual faz `search: {}` | y - user: "Q3 sim, Limpar filtros apaga tudo" |
| Q4: `page` além da última (ex.: `page=99` com 4 páginas) | Mostra a mensagem de resultado vazio com "Limpar filtros" | Hoje a API devolve `items` vazio com `total` > 0; a alternativa (ir para a última página) foi descartada | y - user: "Q4 estado vazio" |
| Q5: estado de erro e respostas fora de ordem da listagem | Fora desta spec | Não aparece nos 3 cenários; vira spec própria | y - user: "Q5 fora desta spec" |
| Q6: busca por texto grava na URL a cada tecla ou ao enviar | Ao enviar o campo (Enter/botão), uma entrada no histórico | Evita uma requisição e uma entrada de histórico por tecla; o código atual usa formulário com "Aplicar" | y - user: "Q6 grava na URL ao enviar o campo" |
| Q7: o que `q` compara | Nome e coleção do NFT, sem diferenciar maiúsculas/minúsculas | É o que o handler `GET /api/nfts` já implementa | y - código |
| Q8: "primeiro NFT épico" do cenário 2 | O primeiro da ordenação padrão `recent` entre os NFTs de raridade "Épico" | O cenário não cita ordenação; vale a padrão | y - cenário 2 |
| Q9: ordem entre NFTs de mesmo preço em `price-asc` | Não especificada; a ordem exigida é não decrescente | Preços iguais não têm desempate definido no README | y - README |
| Q10: representação da página 1 na URL | `page=1` explícito após mudar Filtro | O cenário 2 diz "a URL passa a ter página 1" | y - cenário 2 |

**Open questions:** none - Q1 a Q6 respondidas pela pessoa dona do produto; Q7 a Q10 resolvidas pelo código, pelo README ou pelos cenários.

---

## User Stories

### P1: Filtro e ordenação sobrevivem ao refresh ⭐ MVP

**User Story**: As a colecionador, I want recarregar o catálogo e ver a mesma lista filtrada e ordenada so that não perco o que estava procurando.

**Why P1**: É o núcleo do requisito "sobreviver a refresh" (README §3) e o cenário 1.

**Acceptance Criteria**:

1. WHEN a pessoa seleciona o Filtro de coleção "Kurio Apes" e a ordenação "Menor preço" no catálogo padrão THEN the system SHALL gravar `collection=Kurio Apes` e `sort=price-asc` na URL.  <!-- CATF-01 -->
2. WHEN a página é recarregada com essa URL THEN the system SHALL listar os 6 NFTs da coleção "Kurio Apes", todos eles, e nenhum de outra coleção.  <!-- CATF-02 -->
3. WHEN a página é recarregada com essa URL THEN the system SHALL ordenar os 6 NFTs do menor para o maior `priceEth`, comparando como número decimal e nunca como texto.  <!-- CATF-02 -->
4. WHEN a página é recarregada com essa URL THEN the system SHALL mostrar a coleção "Kurio Apes" como selecionada e "Menor preço" no seletor "Ordenar por".  <!-- CATF-03 -->
5. WHEN a página é recarregada com essa URL THEN the system SHALL manter a URL com `collection=Kurio Apes` e `sort=price-asc`.  <!-- CATF-03 -->
6. WHEN a pessoa envia "ape" no campo de busca (Enter ou botão) e recarrega a página THEN the system SHALL manter `q=ape` na URL, exibir "ape" no campo de busca e listar os mesmos NFTs.  <!-- CATF-04 -->
6a. WHILE a pessoa digita no campo de busca sem enviar, the system SHALL manter a URL e a lista inalteradas.  <!-- CATF-04; Q6 -->
6b. WHEN a pessoa envia o campo de busca THEN the system SHALL criar exatamente uma entrada no histórico com `q` na URL.  <!-- CATF-04; Q6 -->
7. WHEN a pessoa combina coleção, raridade e faixa de preço THEN the system SHALL listar apenas NFTs que atendem a todos os Filtros ao mesmo tempo.  <!-- CATF-05 -->
8. WHEN a pessoa usa o botão voltar do navegador após aplicar um Filtro THEN the system SHALL restaurar a URL e a lista anteriores.  <!-- CATF-06 -->

**Independent Test**: Abrir `/`, escolher "Kurio Apes" e "Menor preço", recarregar e conferir os 6 NFTs, a ordem e a URL.

---

### P1: Mudar o Filtro volta para a página 1 ⭐ MVP

**User Story**: As a colecionador, I want que mudar um Filtro me leve ao início do novo resultado so that não caio numa página vazia ou fora de contexto.

**Why P1**: É regra explícita do README §3 e o cenário 2.

**Acceptance Criteria**:

1. WHILE a pessoa está na página 3 do catálogo padrão (36 NFTs, 9 por página, 4 páginas), WHEN ela aplica o Filtro de raridade "Épico" THEN the system SHALL gravar `page=1` na URL junto com `rarity=Épico`.  <!-- CATF-07 -->
2. WHEN o Filtro de raridade "Épico" é aplicado THEN the system SHALL começar a lista no primeiro NFT de raridade "Épico" da ordenação padrão e exibir somente NFTs "Épico".  <!-- CATF-08 -->
3. WHEN a pessoa muda qualquer Filtro (coleção, raridade, `minPrice`, `maxPrice`) THEN the system SHALL gravar `page=1` na URL.  <!-- CATF-09 -->
4. WHEN a pessoa muda a busca (`q`) ou a ordenação THEN the system SHALL gravar `page=1` na URL.  <!-- CATF-09; Q2 -->
4a. WHEN a pessoa envia a busca (`q`) com a página em 3 THEN the system SHALL gravar `page=1` na URL.  <!-- CATF-09; Q2 -->
5. WHEN a pessoa muda apenas de página THEN the system SHALL preservar `q`, os Filtros e `sort` na URL.  <!-- CATF-10 -->

**Independent Test**: Abrir `/?page=3`, aplicar "Épico" e conferir `page=1` na URL e a primeira linha da lista.

---

### P1: Busca sem resultado e valor inválido na URL ⭐ MVP

**User Story**: As a colecionador, I want que uma URL com busca sem resultado ou valor inválido não quebre a tela so that eu me recupere com um clique.

**Why P1**: Cenário 3 e requisito de resultados vazios do README §3.

**Acceptance Criteria**:

1. WHEN a pessoa abre a URL `/?q=zzzz&rarity=Lendário` THEN the system SHALL mostrar a mensagem "Nenhum NFT encontrado." e a ação "Limpar filtros".  <!-- CATF-11 -->
2. IF o valor de `rarity` na URL não é "Comum", "Raro" ou "Épico" THEN the system SHALL ignorar o valor: a consulta à API não leva `rarity` e nenhuma raridade aparece como selecionada.  <!-- CATF-12 -->
3. IF o valor de `rarity` na URL é inválido THEN the system SHALL remover `rarity` da URL sem criar nova entrada no histórico.  <!-- CATF-12; depende de Q1 -->
4. WHEN a pessoa abre a URL `/?q=zzzz&rarity=Lendário` THEN the system SHALL renderizar a página sem tela de erro, sem rota 404 e sem erro no console.  <!-- CATF-13 -->
5. WHEN a pessoa usa "Limpar filtros" THEN the system SHALL remover `q`, `collection`, `rarity`, `minPrice`, `maxPrice`, `sort` e `page` da URL e listar a primeira página do catálogo padrão (9 NFTs de 36).  <!-- CATF-14; depende de Q3 -->
6. IF `page` na URL não é um inteiro maior ou igual a 1 (ex.: `page=0`, `page=abc`, `page=-2`) THEN the system SHALL tratar como página 1.  <!-- CATF-15 -->
7. IF `sort` na URL não é uma das quatro opções THEN the system SHALL usar `recent`.  <!-- CATF-15 -->
8. IF `minPrice` ou `maxPrice` na URL não é um decimal não negativo (ex.: `minPrice=abc`) THEN the system SHALL ignorar esse parâmetro.  <!-- CATF-15 -->
9. IF `page` na URL excede a última página do resultado (ex.: `page=99`) THEN the system SHALL mostrar a mensagem "Nenhum NFT encontrado." com "Limpar filtros".  <!-- CATF-16; depende de Q4 -->

**Independent Test**: Abrir `/?q=zzzz&rarity=Lendário`, ver a mensagem e a ação, clicar "Limpar filtros" e ver os 9 primeiros NFTs.

---

## Edge Cases

- IF `collection` na URL não existe entre as coleções do catálogo (ex.: `collection=Fantasma`) THEN the system SHALL mostrar "Nenhum NFT encontrado." com "Limpar filtros".
- WHEN `minPrice` é maior que `maxPrice` THEN the system SHALL mostrar "Nenhum NFT encontrado." com "Limpar filtros".
- WHEN a URL tem `collection` com espaço codificado (ex.: `Kurio%20Apes`) THEN the system SHALL tratar como o mesmo valor "Kurio Apes".

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CATF-01 | P1: Filtro e ordenação sobrevivem ao refresh | Specify | Pending |
| CATF-02 | P1: Filtro e ordenação sobrevivem ao refresh | Specify | Pending |
| CATF-03 | P1: Filtro e ordenação sobrevivem ao refresh | Specify | Pending |
| CATF-04 | P1: Filtro e ordenação sobrevivem ao refresh | Specify | Pending |
| CATF-05 | P1: Filtro e ordenação sobrevivem ao refresh | Specify | Pending |
| CATF-06 | P1: Filtro e ordenação sobrevivem ao refresh | Specify | Pending |
| CATF-07 | P1: Mudar o Filtro volta para a página 1 | Specify | Pending |
| CATF-08 | P1: Mudar o Filtro volta para a página 1 | Specify | Pending |
| CATF-09 | P1: Mudar o Filtro volta para a página 1 | Specify | Pending |
| CATF-10 | P1: Mudar o Filtro volta para a página 1 | Specify | Pending |
| CATF-11 | P1: Busca sem resultado e valor inválido na URL | Specify | Pending |
| CATF-12 | P1: Busca sem resultado e valor inválido na URL | Specify | Pending |
| CATF-13 | P1: Busca sem resultado e valor inválido na URL | Specify | Pending |
| CATF-14 | P1: Busca sem resultado e valor inválido na URL | Specify | Pending |
| CATF-15 | P1: Busca sem resultado e valor inválido na URL | Specify | Pending |
| CATF-16 | P1: Busca sem resultado e valor inválido na URL | Specify | Pending |

**Coverage:** 16 total, 0 mapped to tasks, 16 unmapped (fase Tasks ainda não iniciada)

---

## Sources

- `README.md` §3 "Catálogo e detalhe" - busca, filtros, ordenação e paginação na URL; filtros combináveis; mudança de filtro reinicia a paginação; resultados vazios tratados.
- `GLOSSARIO.md` (Contexto 1 — Catálogo) - vocabulário: NFT, Edição, Filtro.
- Os 3 cenários escritos à mão pela pessoa dona do produto (preservados nas histórias acima).
- Código existente consultado só para fatos: `src/modules/catalog/presentation/pages/homeSearch.ts`, `HomePage.tsx`, `src/mocks/handlers/catalog.ts`, `src/mocks/fixtures/nfts.ts` (36 NFTs, 6 coleções de 6 NFTs, página de 9).

---

## Success Criteria

- [ ] Os 3 cenários da pessoa dona passam como testes de ponta a ponta contra os mocks.
- [ ] Nenhuma combinação de valores inválidos na URL gera tela de erro.
