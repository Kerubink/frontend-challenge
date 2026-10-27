# Diferenças — spec da semana 5 (TLC, equipe 3 = ímpar)

Feature: busca e filtros do Catálogo que sobrevivem ao refresh. Spec: `.specs/features/catalogo-busca-filtros-url/spec.md` (validador: 0 erros, 0 avisos).

1. **Acrescentou:** critérios que eu não escrevi: busca `q` na URL, filtros combinados, botão voltar do navegador, `page`/`sort`/preço inválidos e três casos de borda.
2. **Mudou nos meus cenários:** no cenário 3, `q=zzzz` já vira resultado vazio, então "raridade inválida ignorada" não era observável; ele exigiu que a consulta à API não leve `rarity` e nenhuma raridade apareça selecionada.
3. **Perguntou:** 6 perguntas de produto (ex.: valor inválido sai da URL ou só é ignorado? a busca reinicia a página?) e se recusou a escrever a aprovação em meu nome. Respondi com as recomendações dele (Q1 remover da URL, Q2 sim, Q3 sim, Q4 estado vazio, Q5 fora de escopo, Q6 grava ao enviar).

## OpenSpec na mesma feature (faixa completa)

Change: `openspec/changes/catalogo-busca-filtros-url/` (`openspec validate --strict`: válida).

**Quem perguntou mais:** o TLC. Ele parou com 6 perguntas e só fechou a spec depois das respostas; o OpenSpec não perguntou nada e assumiu 7 decisões sozinho, listando-as no fim.
**Quem inventou mais:** o OpenSpec, em volume de artefatos (proposal, spec com 8 requisitos, design com 7 decisões e tasks) e em decisões não confirmadas. Ele decidiu, por exemplo, que `page` acima do total vai para a última página, o oposto do que eu escolhi com o TLC (estado vazio); o TLC inventou menos porque registrou cada suposição como pergunta aberta.
**Qual eu usaria neste projeto:** TLC. O desafio é cheio de regras de produto com custo alto de erro (preço, pedido, idempotência), e o TLC trava a aprovação humana, escreve em EARS (o mesmo padrão da semana 6) e tem validador e gates; o OpenSpec é mais rápido de montar, mas decide sozinho o que deveria ser perguntado.
Limite honesto da comparação: as duas rodaram em modo não interativo (`claude -p`); numa sessão interativa o OpenSpec poderia ter perguntado mais.
