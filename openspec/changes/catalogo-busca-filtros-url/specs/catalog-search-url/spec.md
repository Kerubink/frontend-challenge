# Spec Delta

## Purpose

Define como busca, **Filtros** (coleção, raridade, faixa de preço), ordenação e paginação do Catálogo vivem na URL, de modo que a lista sobreviva a refresh e ao histórico e valores inválidos digitados à mão não quebrem a página.

## ADDED Requirements

### Requirement: Estado do catálogo na URL
O sistema SHALL representar busca, coleção, raridade, faixa de preço, ordenação e página como parâmetros da URL, e a lista exibida MUST ser a mesma ao recarregar a página ou abrir a URL diretamente. Sem parâmetros, a ordenação é "listados recentemente" e a página é 1.

#### Scenario: Filtro e ordenação sobrevivem ao refresh
- **GIVEN** o catálogo padrão com 36 NFTs e 9 por página
- **WHEN** a pessoa filtra a coleção "Kurio Apes", ordena por menor preço e recarrega a página
- **THEN** a lista mostra os mesmos 6 NFTs da coleção "Kurio Apes", do mais barato ao mais caro
- **AND** a URL ainda contém a coleção e a ordenação

#### Scenario: Histórico restaura o estado anterior
- **WHEN** a pessoa aplica um filtro e depois volta no histórico do navegador
- **THEN** a lista, os controles de filtro e o campo de busca refletem a URL anterior

### Requirement: Filtros combináveis
O sistema SHALL permitir combinar busca, coleção, raridade e faixa de preço, e a lista MUST conter apenas NFTs que satisfaçam todos os critérios ativos ao mesmo tempo.

#### Scenario: Coleção e raridade combinadas
- **WHEN** a pessoa filtra a coleção "Kurio Apes" e a raridade "Raro"
- **THEN** todos os NFTs listados pertencem a "Kurio Apes" e têm raridade "Raro"
- **AND** o total exibido corresponde à quantidade desses NFTs

### Requirement: Mudança de filtro reinicia a paginação
O sistema SHALL voltar para a página 1 sempre que busca, coleção, raridade, faixa de preço ou ordenação mudar. Apenas a mudança de página MUST preservar a página escolhida.

#### Scenario: Aplicar raridade a partir da página 3
- **GIVEN** a pessoa está na página 3 do catálogo padrão (36 NFTs, 4 páginas)
- **WHEN** aplica o filtro de raridade "Épico"
- **THEN** a URL passa a ter página 1
- **AND** a lista começa no primeiro NFT épico segundo a ordenação vigente

#### Scenario: Trocar de página não altera filtros
- **GIVEN** a coleção "Kurio Apes" está filtrada
- **WHEN** a pessoa avança de página
- **THEN** a coleção continua na URL e somente a página muda

### Requirement: Valores inválidos na URL são ignorados
O sistema SHALL ignorar, individualmente, qualquer parâmetro da URL com valor fora do domínio (raridade desconhecida, ordenação desconhecida, preço não decimal, página não inteira ou menor que 1), aplicando o padrão desse parâmetro e mantendo os demais. A página MUST renderizar sem erro.

#### Scenario: Raridade inexistente digitada à mão
- **WHEN** a pessoa abre a URL com busca "zzzz" e raridade "Lendário"
- **THEN** a raridade "Lendário" não é aplicada como filtro
- **AND** a página renderiza normalmente, sem tela de erro

#### Scenario: Página inválida
- **WHEN** a pessoa abre a URL com página "abc" ou "0"
- **THEN** a lista é exibida como página 1

#### Scenario: Parâmetro inválido não descarta os válidos
- **WHEN** a pessoa abre a URL com coleção "Kurio Apes" e ordenação "xyz"
- **THEN** a lista é filtrada por "Kurio Apes" com a ordenação padrão

### Requirement: Página fora do intervalo
O sistema SHALL exibir a última página existente quando a URL pedir página maior que o total de páginas do resultado atual.

#### Scenario: Página 99 no catálogo padrão
- **GIVEN** o catálogo padrão com 4 páginas
- **WHEN** a pessoa abre a URL com página 99
- **THEN** a lista exibe a página 4 e a URL é corrigida para página 4

### Requirement: Estado vazio com saída
Quando nenhum NFT satisfizer os critérios, o sistema SHALL exibir mensagem de resultado vazio e, havendo filtro ou busca ativos, a ação "Limpar filtros". Acionar a ação MUST remover todos os critérios da URL e restaurar a lista padrão.

#### Scenario: Busca sem resultado
- **GIVEN** o catálogo padrão
- **WHEN** a pessoa abre a URL com busca "zzzz" e raridade "Lendário"
- **THEN** vê a mensagem de resultado vazio com a ação "Limpar filtros"

#### Scenario: Limpar filtros
- **GIVEN** o resultado está vazio por causa de uma busca
- **WHEN** a pessoa aciona "Limpar filtros"
- **THEN** a URL fica sem parâmetros de busca/filtro, o campo de busca fica vazio e a lista padrão reaparece

### Requirement: Controles refletem a URL
O sistema SHALL manter campo de busca, campos de faixa de preço, raridade, coleção e ordenação exibindo os valores efetivamente aplicados pela URL, inclusive após refresh, voltar/avançar e "Limpar filtros".

#### Scenario: Refresh com busca
- **WHEN** a pessoa busca "Ape" e recarrega a página
- **THEN** o campo de busca continua preenchido com "Ape" e a lista é a da busca

### Requirement: Respostas obsoletas não substituem a atual
O sistema SHALL exibir sempre o resultado da combinação de parâmetros mais recente, descartando respostas de combinações anteriores que cheguem depois (latência variável ou fora de ordem).

#### Scenario: Resposta antiga chega por último
- **GIVEN** a requisição de uma combinação antiga é mais lenta que a da combinação atual
- **WHEN** a resposta antiga chega depois da atual
- **THEN** a lista e o total continuam refletindo a combinação atual
