# CLAUDE.md

Desafio Frontend: **Marketplace de NFTs** em React + TypeScript, seguindo o [layout no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1). O `README.md` atual é o **enunciado do desafio**; a solução deverá ter seu próprio README (setup, env, credenciais, cenários) e um `ARCHITECTURE.md`.

> Estado atual do repositório: apenas o enunciado. Ainda não há código, `package.json` nem comandos. Ao criar o projeto, atualize a seção **Comandos** abaixo com os scripts reais.

## Stack obrigatória (deve ser usada de forma efetiva)

React · TypeScript · TanStack Router · TanStack Query · Axios · REST · Socket.IO (`socket.io-client`) · Tailwind CSS · shadcn/ui · MSW · Playwright · Lighthouse.

Build tool, organização e libs complementares são livres. Deploy público obrigatório (Vercel recomendado; Netlify/Cloudflare Pages aceitos), com mocks e tempo real funcionando e refresh de rotas operando.

## Comandos

- `npm run dev` — Vite com mocks MSW (porta 5173). `?scenario=slow|empty|server-error|payment-declined|default` troca o cenário; `?reset=1` restaura o banco.
- `npm run build` / `npm run preview` / `npm run typecheck`.
- `npm run test:e2e` — Playwright (Chromium, projetos desktop e mobile; sobe o `dev` com mocks). Hoje cobre só a cotação desatualizada no Checkout (`tests/e2e/flows/checkout-stale-quote.spec.ts`).
- Ainda não existem: lint e Lighthouse (obrigatórios pelo README).

Credenciais fictícias: `ana@kurio.dev` e `bruno@kurio.dev`, senha `Senha@123`. Cupons: `KURIO10`, `BEMVINDO5`, `EXPIRADO` (expirado).

Tema: `src/app/styles/theme.css` (Tailwind v4, só tokens do Figma; não criar cores fora dele).

## Estrutura de pastas (DDD)

Cada **bounded context** fica em `src/modules/<contexto>/` com 4 camadas. Dependências apontam para dentro: `presentation → application → domain` e `infrastructure → domain`. O `domain` não importa React, Axios, Query nem Socket.IO.

```
src/
├── app/                  # composição: providers, router (TanStack), guards, layouts, styles
├── modules/
│   ├── identity/         # cadastro, login, sessão, expiração, logout
│   ├── catalog/          # NFTs, busca, filtros, ordenação, paginação, detalhe
│   ├── favorites/        # favoritos (atualização otimista)
│   ├── cart/             # carrinho, itens, cupom (visitante → autenticado)
│   ├── checkout/         # cotação, revalidação, pagamento, rede/carteira
│   ├── orders/           # pedido (pendente/confirmado/recusado), recibo snapshot, idempotência
│   ├── collector/        # perfil, avatar, senha
│   ├── wallets/          # carteira principal e secundária
│   └── realtime/         # Socket.IO: nft.updated, order.updated, versão, reconciliação
│       └── <contexto>/{domain,application,infrastructure,presentation}
│           ├── domain/          entities · value-objects · services · repositories (ports)
│           ├── application/     queries · mutations · use-cases (TanStack Query)
│           ├── infrastructure/  api (Axios) · dtos · mappers (DTO ↔ domínio)
│           └── presentation/    components · pages · hooks
├── shared/               # shared kernel: money (decimal string), result, errors, http (Axios),
│                         # query client, storage, idempotency, ui (shadcn, skeleton), a11y, config
└── mocks/                # MSW: browser, handlers, db (estado + persistência/reset), fixtures,
                          # scenarios (falhas/latência determinísticas), network, socket
tests/e2e · tests/visual  # Playwright (fluxos, fixtures, baselines)
lighthouse/               # config versionada + relatórios
docs/contracts/           # contratos REST e eventos
```

Regras: contextos só se comunicam por `application` (ou eventos), nunca importando `infrastructure`/`presentation` de outro; `mocks/` nunca é importado por `modules/`; mapeamento DTO → domínio fica apenas em `infrastructure/mappers`.

## Regras de arquitetura

- **Rotas/URL**: TanStack Router para rotas, search params e proteção de rotas privadas. Busca, filtros, ordenação e paginação vivem na URL (sobrevivem a refresh/histórico); mudar filtro reinicia a paginação.
- **Estado remoto**: TanStack Query para queries/mutations/cache. Todo REST passa pelo Axios. Descartar/cancelar respostas obsoletas; chaves de cache isoladas por usuário e parâmetros.
- **Tipagem**: contratos tipados entre transporte, estado e UI.
- **Estados de UI**: loading, vazio, erro, sucesso e refetch em segundo plano em tudo que depende de dados.
- **Atualização otimista** em ao menos uma interação (ex.: favoritos), com rollback em falha.
- Documentar política de cache, retries e sincronização.
- **Dinheiro**: valores em ETH trafegam como **strings decimais**, sem float; manter precisão nos cálculos e na exibição. Quantidades são inteiras. A cotação da API é a referência para finalizar pedido.
- Rotas inexistentes e acesso direto a qualquer tela devem ser tratados.

## Telas

Início (destaques, catálogo, busca, filtros, ordenação) · Detalhe do NFT · Carrinho · Pagamento · Confirmação · Login · Cadastro · Perfil · Carteiras. Desktop e mobile; Perfil, Carteiras e Confirmação também precisam funcionar em mobile mesmo sem frame. Fora do escopo: páginas editoriais, suporte, atividade, ofertas, downloads (ações fora do escopo não podem aparentar sucesso).

## Regras de negócio críticas

- **Auth**: cadastro/login/logout/sessão recuperável após refresh; checkout, perfil, carteiras, favoritos e pedidos exigem login. Tratar expiração (inclusive no checkout) preservando contexto. Logout/troca de usuário limpa cache privado e subscriptions. Nunca armazenar senha em claro.
- **Carrinho**: persiste após refresh; itens do visitante são preservados ao autenticar; cupom aplicável/removível (inválido/expirado tratado); mostra subtotal, desconto, taxa de rede e total conforme a API; reflete mudanças de preço/disponibilidade em tempo real.
- **Checkout**: revalidar preço, disponibilidade, cupom e taxas antes de confirmar; mudanças exigem nova confirmação. Impedir pedidos duplicados (clique repetido, reenvio após timeout) com **chave de idempotência** (mesma chave + mesmo conteúdo = mesmo pedido; conteúdo diferente = conflito). Pedido: pendente/confirmado/recusado (terminais os dois últimos), recuperável após refresh/reconexão. Confirmação só para pedido realmente confirmado. Em falha preservar itens; após sucesso remover só itens/quantidades comprados. Recibo é snapshot imutável.

## MSW (mocks)

- Mocks só na camada de rede. **Proibido** respostas fictícias ou caminhos alternativos de negócio em componentes, hooks ou cliente Axios.
- Estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos; persistência local permitida; reset restaura cenário conhecido.
- Ativado por configuração e disponível no build de demonstração.
- Cenários configuráveis e determinísticos: sucesso, vazio, latência variável/fora de ordem, falha de conexão, 4xx/5xx, sessão expirada/não autorizado, conflito de cadastro/validação, cupom inválido/expirado, preço alterado/edição esgotada, timeout após criar pedido (recuperação por idempotência), pagamento confirmado e recusado.
- Fixtures variadas (filtros e paginação) e **pelo menos 2 usuários**.
- Socket.IO simulado com MSW via integração compatível (ex.: `@mswjs/socket.io-binding`); documentar transporte e limitações. Os cenários **devem exercitar `socket.io-client`**; nunca chamar setters/callbacks/cache direto para simular eventos (eliminatório). Mudanças nos dados refletem em REST e eventos.

## Tempo real

Eventos mínimos: `nft.updated` (preço/disponibilidade em catálogo, detalhe e carrinho) e `order.updated` (estado do pedido; confirmação/recusa). Eventos têm id estável, recurso afetado e **versão**; tolerar duplicatas e eventos antigos sem regredir estado. Após reconexão, reconciliar recursos ativos via REST. Eventos de sessão anterior não podem afetar outro usuário. Liberar listeners/subscriptions no fim do ciclo de vida.

## UI, responsividade e acessibilidade

- Fidelidade ao Figma (tipografia, cores, espaçamento, proporções); shadcn/ui adaptado à identidade. Documentar desvios e substituições de asset em `ARCHITECTURE.md`.
- Validar em **390, 768 e 1440 px**; sem overflow horizontal.
- **Skeletons com shimmer** em catálogo, detalhe e resumo do carrinho, preservando dimensões (sem layout shift) e respeitando `prefers-reduced-motion`.
- Obrigatório: teclado + foco visível, foco controlado em dialogs/drawers, semântica/labels/erros associados aos campos, alt text, contraste, estados não só por cor, feedback acessível (ex.: live regions) para mutations e eventos em tempo real.

## Testes (Playwright)

E2E rodando contra os mocks, em Chromium, viewports desktop e mobile. Cobrir: catálogo/URL, detalhe direto/404, auth/expiração/troca de usuário, favoritos com falha, carrinho/cupom/persistência, compra completa, falha de pagamento/clique repetido/timeout idempotente, perfil/avatar/senha/carteiras, eventos Socket.IO no checkout, duplicados/antigos/desconexão, teclado/foco/validação, skeletons e retry. Regressão visual (início, detalhe, carrinho, pagamento) com baselines versionadas e dados estáveis. Cada teste parte de estado isolado; controlar relógio, latência e disparo de eventos. Entregar relatório HTML e traces. Asserções observam a UI e resultados; REST passa pelos handlers MSW, tempo real pelo `socket.io-client`.

## Lighthouse

Auditar Início e Detalhe, mobile e desktop, em build otimizado com cenário padrão dos mocks. Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. 3 medições por página/perfil, reportar a **mediana**; registrar LCP, CLS, TBT; versionar config; entregar HTML/JSON, versões e ambiente; justificar resultados abaixo da meta. Sem simplificações só para pontuar.

## Eliminatórios (evitar a todo custo)

Stack não usada de fato · fluxos só visuais · compra confirmada sem resposta da simulação · dados expostos entre usuários · eventos simulados direto na UI · ausência de testes E2E executáveis.

## Entrega

Código, lockfile, assets, mocks, fixtures, testes e configs de auditoria. `README.md` da solução: setup, variáveis de ambiente, credenciais fictícias, seleção/reset de cenários, comandos e como reproduzir falhas. `ARCHITECTURE.md`: contratos REST e eventos, política de sessão, estado do carrinho, estratégia de cache, reconciliação REST × Socket.IO, limitações, decisões de UX e desvios do Figma.

## Convenções de trabalho

- Responder e documentar em português (pt-BR), código e identificadores em inglês.
- Commits pequenos e descritivos; não commitar sem pedido explícito.

## Glossário (linguagem ubíqua — fonte: `GLOSSARIO.md`)

- **Catálogo** (`src/modules/catalog/`): **NFT** (item colecionável à venda), **Edição** (tiragem ainda comprável; esgotada = indisponível), **Filtro** (critério na URL que reinicia a paginação).
- **Checkout** (`src/modules/checkout/`): **Cotação** (valores calculados pela API; referência para fechar o pedido), **Pedido** (pendente/confirmado/recusado; terminais os dois últimos), **Recibo** (retrato imutável do pedido).
- **Preço** muda de sentido: no Catálogo é o valor anunciado (vivo, muda por `nft.updated`); no Checkout é o valor cotado e aceito (congelado; no Recibo nunca muda). Não compartilhe um tipo `Price` entre contextos.
