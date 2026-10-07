# DESIGN_TOKENS.md

Tokens e estilos extraídos do Figma via MCP (somente leitura, nada no projeto foi alterado).

- **Arquivo:** `Frontend-Challenge (Copy)` — fileKey `cDNM5NzXNHMy9eLmqcSR2g`, página `0:1` "Marketplace de NFTs GreenMint".
- **Marca exibida no layout:** "KURIO" (o nome da página no Figma é "GreenMint").
- **Origem dos valores:** `get_variable_defs` (variáveis globais) e `get_design_context` (código de referência por tela). Valores `var(--x, #hex)` são variáveis Figma. Valores marcados **literal** são fixos no layout e não usam variável.
- **Legenda:** "n/d" = não desenhado no Figma ou não retornado pelo código. Nada foi inventado.

> ⚠️ **Extração incompleta.** O plano Starter do Figma MCP atingiu o limite de chamadas. Cinco telas **não foram extraídas** (ver [Lacunas](#lacunas-e-pendências)). Este documento não deve ser tratado como a fonte final de fidelidade visual até elas serem completadas.

## Sumário

1. [Telas do arquivo](#1-telas-do-arquivo)
2. [Cores](#2-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento e layout](#4-espaçamento-e-layout)
5. [Bordas e raios](#5-bordas-e-raios)
6. [Sombras e gradientes](#6-sombras-e-gradientes)
7. [Breakpoints](#7-breakpoints)
8. [Componentes compartilhados](#8-componentes-compartilhados)
9. [Por tela — Desktop](#9-por-tela--desktop)
10. [Por tela — Mobile](#10-por-tela--mobile)
11. [Estados interativos](#11-estados-interativos)
12. [Lacunas e pendências](#lacunas-e-pendências)

---

## 1. Telas do arquivo

| Node | Tela | Largura | Altura | Extraída |
| --- | --- | ---: | ---: | :---: |
| `2:2` | Desktop / Início | 1440 | 3668 | ❌ |
| `10:244` | Desktop / Detalhes do NFT | 1440 | 2246 | ✅ |
| `11:1278` | Desktop / Carrinho de NFTs | 1440 | 1754 | ✅ |
| `11:2862` | Desktop / Pagamento | 1440 | 1657 | ✅ |
| `11:4385` | Desktop / Confirmação de Pedido | 1440 | 1657 | ✅ |
| `9:115` | Desktop / Login | 1440 | 1981 | ✅ |
| `9:1022` | Desktop / Cadastro | 1440 | 1981 | ❌ |
| `9:1238` | Desktop / Perfil do Colecionador | 1440 | 1080 | ✅ |
| `9:1670` | Desktop / Carteiras | 1440 | 1080 | ❌ |
| `14:5226` | Mobile / Início | 414 | 896 | ✅ |
| `15:5536` | Mobile / Detalhes do NFT | 414 | 896 | ✅ |
| `16:360` | Mobile / Carrinho de NFTs | 414 | 896 | ✅ |
| `16:748` | Mobile / Pagamento | 414 | 896 | ✅ |
| `16:1022` | Mobile / Login | 414 | 896 | ❌ |
| `16:1228` | Mobile / Cadastro | 414 | 896 | ❌ |

Larguras e alturas vêm de `get_metadata` da página. Não existe frame de tablet, nem frame mobile de Perfil, Carteiras e Confirmação (o README exige que funcionem mesmo assim).

---

## 2. Cores

### 2.1 Variáveis globais (`get_variable_defs`)

| Token | Hex | Uso observado |
| --- | --- | --- |
| `color/ink` | `#140D0A` | Fundo das páginas; texto sobre `primary` |
| `color/surface-card` | `#241612` | Cards, linhas do carrinho, modais, sidebar, footer (faixas 1 e 3), bottom bars |
| `color/surface-dark` | `#38220F` | Input da newsletter, chip de carteiras, faixa 2 do footer |
| `color/surface-raised` | `#2F1D15` | Botões de ação de card, avatar, botões circulares mobile |
| `color/primary` | `#D28A4C` | Botões primários, bordas ativas, medalhões, divisores do footer |
| `color/text-accent` | `#E89B55` | Preços, link/aba ativa, valores em destaque |
| `color/secondary` | `#B39463` | Placeholders, metadados (ID do token, coleção) |
| `color/text-secondary` | `#CFB28C` | Descrições, textos de apoio |
| `color/foreground` | `#F5F1EB` | Texto principal |
| `color/black` | `#000000` | Declarado; uso n/d |
| `color/border` | `#3F2319` | Bordas de inputs e cards secundários |
| `color/border-soft` | `#55321F` | Borda do chip "Carteiras compatíveis" |
| `color/text-coral` | `#F0805F` | Asterisco de campo obrigatório; divisor entre abas do modal de Login |

Variáveis declaradas e não usadas nas telas lidas: `Color/Amber #E3A44E` (possível cor da estrela de avaliação, não confirmado) e `Color/Gray Light #EDEDED`.

### 2.2 Valores literais (fora das variáveis)

| Valor | Onde |
| --- | --- |
| `#140D0A` (borda 1px) | Botões `Add Button` (quantidade) |
| `#241612` | Fundo dos itens do carrinho mobile (literal, não variável) |
| `rgba(20,13,10,0.15)` | Sombra dos botões de quantidade |
| `rgba(10,6,4,0.45)` | Sombra de inputs, cards e bottom bar |

### 2.3 Cores de SVG
Cores de traço de divisores, sublinhado do item ativo, pílulas de edição (elipses), ícones da tab bar e pontos do carrossel estão **dentro de SVGs** e não vieram no código. Ver [Lacunas](#lacunas-e-pendências).

---

## 3. Tipografia

**Família única:** `Roboto Mono` (variável `font/family`). Pesos usados: 400, 500, 700.
`line-height: normal` no código = "auto" (variável com 100%).

### 3.1 Estilos nomeados (variáveis)

| Estilo | Peso | Tamanho | Line-height | Letter-spacing |
| --- | ---: | ---: | --- | --- |
| Heading/24 Bold | 700 | 24px | auto | 0 |
| Body Large/18 Bold | 700 | 18px | 16px | 0 |
| Body Large/18 Regular | 400 | 18px | 16px | 0 |
| Body Large/17 Bold | 700 | 17px | 16px | 0 |
| Body Large/17 Regular | 400 | 17px | 24px | 0 |
| Body Large/16 Bold | 700 | 16px | auto e 16px | 0 |
| Body Large/16 Medium | 500 | 16px | auto e 16px | 0 |
| Body Large/16 Regular | 400 | 16px | auto | 0 |
| Body/15 Bold | 700 | 15px | 16px | 0 |
| Body/15 Regular | 400 | 15px | auto | 0 |
| Body/14 Bold | 700 | 14px | 16px e auto | 10% (1.4px, usado no logo) |
| Body/14 Regular | 400 | 14px | 16px, 22px e 30px | 0 |
| Caption/13 Regular | 400 | 13px | 22px | 0 |
| Caption/12 Regular | 400 | 12px | 16px | 0 |
| Tiny/10 Medium | 500 | 10px | auto | 0 |
| Tiny/9 Bold | 700 | 9px | auto | 0.1px |

### 3.2 Tamanhos adicionais vistos no código (sem estilo nomeado)

| Tamanho/peso | Onde |
| --- | --- |
| Bold 43px / lh 70px | Título do hero desktop |
| Bold 28px | Título do NFT (Detalhes desktop) |
| Bold 22px / lh 16px | Preço (Detalhes desktop) |
| Bold 20px / lh 16px | Títulos de tela mobile, título do NFT e preço mobile |
| Medium 20px | Abas do modal de Login |
| Regular 20px / lh 28px | Valor de quantidade (Detalhes desktop) |
| Regular 22px / lh 29px | Asterisco obrigatório |
| Medium 18px / lh 25px | Valor de quantidade (Detalhes mobile) |
| Bold 18px / lh 29px | Título do hero mobile |
| Regular 12px / lh 18px | Descrição do hero mobile |
| Medium 12px / lh 16px | Eyebrow do hero mobile; Medium 14px, ls 1.4px no desktop |

### 3.3 Letter-spacing
Só em dois pontos: logo "KURIO" (Bold 14px, **1.4px**), eyebrow "Bem-vindo à Kurio" desktop (**1.4px**) e chip "Carteiras compatíveis" (Bold 9px, **0.1px**). Todo o resto é `0`.

---

## 4. Espaçamento e layout

Não há tokens de espaçamento no Figma. Escala observada (px): `4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 96, 120`.

### 4.1 Desktop (1440)
- Raiz: `padding 24px 120px`, `gap 96px` entre blocos (Top, Related, Footer), conteúdo útil **1200px**.
- Header → conteúdo: `gap 32px`.
- Breadcrumb ↔ conteúdo: `gap 12px`.
- Header: nav `gap 40px`; ações `gap 28px`.
- Grade de cards (5 colunas, 1200px): `justify-between`, cards ~219–220px; imagem↔texto `gap 8–12px`.
- Carrinho: tabela 782px + resumo 332px, separados por ~86px (`justify-between`).
- Pagamento: formulário `flex-1` + resumo **405px**, `gap 32px`; colunas do formulário `gap 24px`, campos `gap 12px`.
- Perfil: sidebar 310px + formulário, `gap 28px`.

### 4.2 Mobile (414)
- Raiz: `padding-x` 24px (Início, Detalhes) ou 28px (Carrinho, Pagamento); `padding-top` 32–40px.
- Início: `gap 16px`; grade 2 colunas de 175px, `gap 24px`; coluna direita com `padding-top 32px`.
- Carrinho: itens 358×100, `gap 20px`.
- Cartões de carteira: 358×93, `gap 20px`; opções 359×65, `gap 16px`.

---

## 5. Bordas e raios

### 5.1 Raios

| Raio | Onde |
| --- | --- |
| 3px | Inputs e botão "Aplicar"/CTA do carrinho desktop; inputs de Pagamento e Perfil; opções de carteira desktop |
| 4px | Botões de ação do card (Login, página de fundo) |
| 5px | Inputs/botões do modal de Login; botão "Ver no Etherscan" |
| 6px | Botão Entrar, COMPRAR/Favoritar, input newsletter, chip de carteiras, miniaturas e imagem principal (Detalhes) |
| 8px | Miniaturas de resumo (Pagamento), "Confirmar compra" desktop |
| 10px | Campo de busca mobile |
| 11–13px / 15–17px | Arte interna dos cards "relacionados" (varia por card) |
| 12px | Hero banner mobile |
| 14px | Itens do carrinho mobile, cards de carteira mobile, botão de filtro mobile |
| 15px | Opções de carteira mobile |
| 16px | Artes do hero/cards desktop e mobile |
| 20px | Moldura de arte dos cards mobile; botões 20×30 de quantidade (carrinho desktop) |
| 24px | Imagem do hero mobile; imagem interna principal (Detalhes desktop, 404×404) |
| 31px | Cantos superiores da sheet de Detalhes mobile |
| 33px | Botões de quantidade (Detalhes desktop) |
| 37px / 17.5px / 25px | Medalhão do footer (74×74) / botões circulares 35×35 / avatar 50×50 |
| 40px | Raiz mobile, Buy Bar, botões/inputs "pílula" mobile (altura 50–60) |
| 32px | Pílula de avaliação mobile |

### 5.2 Bordas

| Borda | Onde |
| --- | --- |
| 1px `border` `#3F2319` | Inputs, opções de carteira, botões sociais, botões circulares mobile |
| 1px `border-soft` `#55321F` | Chip "Carteiras compatíveis" |
| 1px `primary` `#D28A4C` | Miniatura selecionada, "Favoritar", opção de carteira selecionada, campo com foco (senha no Login), pílula de avaliação mobile |
| 6px (esquerda) `primary` | Item ativo da sidebar do Perfil |
| 1px `primary` (vertical) | Separadores do footer; divisores do modal de confirmação |
| Faixa 10px `primary` | Rodapé dos modais de Login e Confirmação |

---

## 6. Sombras e gradientes

### 6.1 Sombras (todas literais)

| Valor | Onde |
| --- | --- |
| `0 6.6px 9.9px rgba(20,13,10,0.15)` | Botões de quantidade (Detalhes desktop) |
| `0 4px 6px rgba(20,13,10,0.15)` | Botões de quantidade (Carrinho desktop, Buy Bar mobile) |
| `0 0 10px rgba(10,6,4,0.45)` | Input da newsletter; Buy Bar mobile |
| `0 6px 20px rgba(10,6,4,0.45)` | Itens do carrinho mobile |
| `0 6px 10px rgba(10,6,4,0.45)` | Input de cupom mobile |
| `0 20px 20px rgba(10,6,4,0.45)` | Card de carteira "Reserva" mobile |
| `0 0 20px rgba(10,6,4,0.45)` | Opções WalletConnect e MetaMask (mobile) |
| `0 0 40px rgba(10,6,4,0.45)` | Opção Coinbase Wallet (mobile) |

Sem sombras nos cards e botões desktop, exceto os listados.

### 6.2 Gradientes (todos literais, apenas mobile)

| Gradiente | Onde |
| --- | --- |
| `linear-gradient(137.05deg, rgba(210,138,76,0.45) 24.603%, rgb(210,138,76) 100%)` | Botão de filtro (Início) |
| `linear-gradient(139.55deg, rgb(36,22,18) 11.999%, rgb(47,29,21) 106.59%)` | Moldura de arte dos cards (Início) |
| `linear-gradient(137.64deg, rgb(36,22,18) 11.999%, rgb(47,29,21) 106.59%)` | Fundo do Hero (Detalhes) |
| `linear-gradient(100.37deg, rgb(210,138,76) 3.9595%, rgba(210,138,76,0.8) 121.97%)` | "Comprar NFT" |
| `linear-gradient(96.02deg, rgba(210,138,76,0.54) 0.944%, rgb(210,138,76) 105.02%)` | "Aplicar" cupom (mobile) |
| `linear-gradient(108.86deg, rgb(210,138,76) 3.9595%, rgba(210,138,76,0.8) 121.97%)` | "Conectar e finalizar" |
| `linear-gradient(108.4756deg, rgb(210,138,76) 3.9595%, rgba(210,138,76,0.8) 121.97%)` | "Confirmar compra" (mobile) |

No desktop não há gradientes.

---

## 7. Breakpoints

O Figma só traz dois tamanhos de frame:

| Perfil | Largura do frame | Conteúdo | Padding lateral |
| --- | ---: | ---: | --- |
| Desktop | **1440** | 1200 | 120 |
| Mobile | **414** | 358–366 | 24 ou 28 |

- **Não há** frame de tablet nem breakpoint definido no Figma.
- O README exige avaliação em **390, 768 e 1440**. O 768 e o 390 precisarão de decisão de projeto (a documentar em `ARCHITECTURE.md` como desvio/interpolação).
- A troca desktop → mobile muda a composição: header vira busca + tab bar fixa (126px), sidebar de filtros some, grade passa a 2 colunas, tabela do carrinho vira lista de cards, resumos ficam em bottom sheet/bar com cantos de 40px.

---

## 8. Componentes compartilhados

### 8.1 Header Row (desktop, 1200px)
- `flex`, `justify-between`. Linha divisória inferior em SVG (cor n/d).
- **Logo "KURIO":** caixa 160×34.3px, Bold 14px, ls 1.4px, `foreground`, top 8.15px.
- **Nav:** `gap 40px`; itens Regular 16px `foreground`; **ativo** Bold 16px `text-accent` com sublinhado em SVG (offset −3px, espessura/cor n/d).
- **Ações:** `gap 28px`. Busca 20×20; carrinho 24×24 + badge 16×16 com número Medium 10px `ink`.
- **Botão Entrar:** 100×35, `primary`, raio 6, ícone Logout 20×20 + "Entrar" Medium 16px `ink`, `gap 4px`.

### 8.2 Footer (desktop, 1200px)
| Faixa | Fundo | Altura | Detalhes |
| --- | --- | ---: | --- |
| 1: features + newsletter | `surface-card` | 250 | padding 32; 3 colunas com `px 16`; medalhão 74×74 `primary` (letra Bold 24px `ink`); título Bold 17px; texto Regular 14px/22px `text-secondary` (w 204); separadores 1px `primary` |
| Newsletter | — | — | w 357; título Bold 18px; input h40 `surface-dark`, raio 6, sombra `0 0 10px rgba(10,6,4,0.45)`; "Enviar" 85×40 `primary`, Bold 18px `ink` |
| 2: marca | `surface-dark` | 88 | padding 32, `gap 92px`; textos Regular 14px/22px |
| 3: links | `surface-card` | 236 | padding 32, `gap 124px`; títulos Bold 18px; itens Regular 14px/30px; redes 5 ícones 30×30 `gap 10px`; chip carteiras h26, `surface-dark`, borda `border-soft`, raio 6, Bold 9px `text-accent` |
| Copyright | — | — | Regular 14px/30px, centralizado |

### 8.3 Botão de quantidade ("Add Button")
| Contexto | Tamanho | Fundo | Borda | Raio | Sombra |
| --- | --- | --- | --- | ---: | --- |
| Detalhes desktop | 33×49.5, ícone 26.4 | `primary` | 1px `#140D0A` | 33 | `0 6.6px 9.9px rgba(20,13,10,.15)` |
| Carrinho desktop | 20×30, ícone 16 | `primary` | 1px `#140D0A` | 20 | `0 4px 6px rgba(20,13,10,.15)` |
| Detalhes mobile | 20×30, ícone 16 | `primary` | 1px `#140D0A` | 20 | `0 4px 6px rgba(20,13,10,.15)` |
| Carrinho mobile ("+") | 24×24 | `surface-raised` | 1px `border` | 31 | n/d |

### 8.4 Input (desktop)
h40, borda 1px `border`, raio 3, fundo transparente, padding 12. Placeholder Regular 14px/15px `secondary`. Label Regular 15px/15px `foreground` + asterisco `text-coral` (Regular 22px/29px). Select: seta Arrow-Down 18×18 à direita.

### 8.5 Botão primário
- **Desktop:** fundo `primary`, texto Bold 14–16px `ink`, raio 3–8px (varia por tela, ver seções).
- **Mobile:** gradiente (6.2), raio 40, altura 60, texto Bold 15–16px `ink`.

### 8.6 Chip de edição
h28, fundo = elipse SVG (cor n/d). Larguras: 36 (1/1), 42 (1/10), 46 (1/50), 66 (ABERTA). Texto 14px/16px: Regular `text-secondary`; selecionado Medium `text-accent`.

### 8.7 Tab Bar mobile
Absoluta, bottom 0, altura 126, fundo em vetor com recorte curvo (cor n/d); FAB central elipse 65×65; 5 ícones (Home, busca, logo, Shop, User). Estado ativo só no Home (cor n/d).

---

## 9. Por tela — Desktop

### 9.1 Início (`2:2`) — ❌ não extraída
Sem dados. Header e Footer são os componentes de 8.1 e 8.2 (nav ativo "Início" ou "Mercado" conforme a tela). Alguns valores da página de fundo vieram da tela de Login (seção 9.6), que reproduz o Início por trás do modal:
- Hero 1200×450: artwork 450×450 (raio 16) à direita; eyebrow Medium 14px ls 1.4px; título Bold 43px/70px (2 linhas, w 600); descrição Regular 14px/24px `text-secondary` (557×45); "EXPLORAR" 140×40 `primary`, raio 6, Bold 16px/20px `ink`.
- Abas: "Todos os NFTs" Bold 15px/16px `text-accent` (ativa, sublinhado 104px); demais Regular 15px `foreground`.
- Sidebar de filtros: 310px, `surface-card`, padding 20, `gap 40px`; títulos Bold 18px; itens Regular 15px/40px (ativo `text-accent`, demais `text-secondary`); contagens Bold 15px; slider com thumbs 15×15.
- Cards: 258×300, `surface-card`, imagem 250×250 raio 16; nome Regular 16px/16px; preço Bold 18px `text-accent`; preço antigo Regular 18px `secondary` tachado; badge "RARO" 80×29 `primary`, Medium 16px `ink`; ações (3 botões 35×35 `surface-raised`, borda `border`, raio 4).

### 9.2 Detalhes do NFT (`10:244`)
Raiz: fundo `ink`, `flex-col gap 96px`, `padding 24px 120px`.
- **Breadcrumb** "Início / Mercado": Bold 15px/16px `foreground`.
- **Galeria** (573×448, `gap 28px`): 4 miniaturas 100×100 (raio 8; `gap 16px`; selecionada com borda 1px `primary`); imagem principal 444×444, `surface-card`, raio 6, padding 16, imagem interna 404×404 raio 24; ícone de ação 30×30 em left 530, top 15.
- **Título** "Emerald Ape #042": Bold 28px `foreground`.
- **Preço:** "1.19 ETH" Bold 22px/16px `text-accent`. **Avaliação:** 5 estrelas 15×15 + "19 avaliações de colecionadores" Regular 15px.
- **Sobre este NFT:** título Bold 15px/16px; texto Regular 14px/24px `text-secondary` (w 574).
- **Edição:** título Bold 15px; chips (8.6) `gap 6px`.
- **Ações:** quantidade (8.3, valor Regular 20px/28px); **COMPRAR** 130×40 `primary`, raio 6, Bold 14px/20px `ink`; **Favoritar** 130×40, borda 1px `primary`, raio 6, ícone coração 20×20 + Medium 14px/20px `text-accent`, sem fundo.
- **Metadados** (w 308, `gap 12px`): Regular 15px `secondary`. **Compartilhar:** Bold 15px + ícones 15–18px.
- **Abas:** `gap 32px`; ativa "Detalhes do NFT" Bold 17px/16px `text-accent` com sublinhado SVG; inativa Regular 17px `foreground`.
- **Descrição:** Regular 14px/24px `text-secondary`; rótulos Bold 14px/24px `foreground`.
- **"Mais desta coleção":** título Bold 17px `text-accent`, 5 cards (219–220×255 de arte `surface-card`; nome Regular 15px; preço Bold 16px `text-accent`), dots 52×12.

### 9.3 Carrinho de NFTs (`11:1278`)
- **Breadcrumb:** "Início / Mercado / Carrinho", Bold 15px/16px.
- **Tabela (782px):** cabeçalho com "NFTs" (w250), "Preço" (w77), "Edições" (w75), "Total" (w87), espaçador 24px; Bold/Medium 16px/16px `foreground`; divisor SVG.
- **Item:** h70, `surface-card`, `padding-right 24px`, sem raio/borda; thumb 70×70 raio 6; nome Bold 16px; "ID do token" Regular 14px `secondary`; preço Bold 16px `text-secondary`; quantidade (8.3) com valor Regular 17px/24px; total Bold 16px `text-accent`; lixeira 24×24. Itens `gap 12px`.
- **Resumo da carteira (332px, `gap 24px`):** título Bold 18px/16px + divisor. Cupom: label Bold 14px; input h40 borda 1px `primary` raio 3, placeholder Regular 12px/16px `secondary`; "Aplicar" 102×40 `primary` Bold 15px `ink`. Linhas: rótulo Regular 15px, valor Regular 18px/16px; "Taxa estimada" Regular 12px `text-accent`. Total: "Total" Bold 16px, valor Bold 18px `text-accent`. CTA "Conectar e finalizar" 332×40 `primary` raio 3, Bold 15px `ink`; link "Continuar explorando" Regular 15px `text-accent`.
- **"Colecionadores também viram":** igual 9.2; arte card 1 190×243 raio 15, demais 212–213 raio 17.

### 9.4 Pagamento (`11:2862`)
- **Breadcrumb** "Início / Mercado / Pagamento".
- **Formulário "Perfil do colecionador":** título Bold 17px/16px; 2 colunas `gap 24px`; campos (8.4) — Nome de exibição, Rede (select), Endereço da carteira, Tipo de carteira (select), E-mail | Nome de usuário, Nome do perfil, ENS/secundária (opcional), Código de indicação, Nome ENS (".eth" 78×40). Opção "Usar outra carteira?" com radio 15×15. Observação: textarea h152.
- **Resumo (405px):** "Seus NFTs" Bold 17px; itens h70 `surface-card`, thumb raio 8, "(x 2)" Regular 14px `text-secondary`, valor Bold 18px `text-accent`. Linhas e total como no Carrinho; "Tem um código promocional? Aplique aqui" Regular 14px.
- **Carteira e rede:** opções h45, borda 1px, raio 3, `gap 16px`; selecionada com borda `primary` (fundo igual); a 1ª mostra o chip de carteiras (w224 h26).
- **Confirmar compra:** w full, h45, `primary`, raio 8, Bold 15px `ink`.

### 9.5 Confirmação de Pedido (`11:4385`)
- Página de Pagamento ao fundo com camada `ink` sem opacidade encontrada (scrim n/d).
- **Modal** (578px de largura, left 431, top 166): fundo `surface-card`, sem raio/borda/sombra; faixa inferior 10px `primary`.
  - Cabeçalho h156: ilustração 80×80 + "Seus NFTs agora estão na sua carteira" Bold 16px `text-secondary`.
  - Divisores 1px `primary`.
  - Meta (h65, padding 4×36): ID da transação, Data, Total, Carteira — rótulo Bold/Regular 14px, valor Regular 15px, `text-secondary`; 3 divisores verticais.
  - Detalhes (padding 20×44×48): título Bold 15px; tabela com itens h70 (thumb raio 8, nome Bold 16px, valor Bold 18px `text-accent`); totais w321; nota Regular 14px/22px `text-secondary`; **"Ver no Etherscan"** `primary`, padding 16, raio 5, Bold 16px `ink`.
  - Botão fechar "X" no canto superior direito (cor n/d).

### 9.6 Login (`9:115`)
- **Modal "Sign In"** 500×600 (left 470, top 160) sobre a página Início: fundo `surface-card`, faixa inferior 10px `primary`, fechar 18×18. Raio, sombra e overlay n/d.
- **Header:** padding 48, `gap 40px`. Abas "Entrar" (Medium 20px `text-accent`) | divisor 1px `text-coral` | "Criar conta" (Medium 20px `foreground`). Subtítulo Regular 13px/16px centralizado.
- **Campos:** padding-x 80, `gap 12px`. Input h40, borda 1px `border`, raio 5, padding 16×12, placeholder Regular 14px `secondary`. **Senha (foco/preenchido):** borda 1px `primary`, valor Regular 16px `foreground`, ícone Hide. "Esqueceu a senha?" Regular 14px `text-accent`, à direita.
- **CTA "Entrar":** h45, `primary`, raio 5, Bold 16px `ink`.
- **Social:** "Ou continue com" Regular 13px; botões h40, borda 1px `border`, raio 5, ícone 20×20 + Medium 13px `text-secondary`.

### 9.7 Cadastro (`9:1022`) — ❌ não extraída
Sem dados. Hipótese **não verificada**: reutiliza o modal de Login com a aba "Criar conta".

### 9.8 Perfil do Colecionador (`9:1238`)
- **Corpo:** `flex row gap 28px`.
- **Sidebar (310px):** `surface-card`, padding-y 8; "Meu perfil" Bold 18px/16px (padding 10); itens Regular 15px/45px `text-accent`, ícones 16–20px; **ativo** = borda esquerda 6px `primary` (a cor do texto é igual aos demais); "Sair" Bold 15px `text-accent`, h40.
- **Formulário (`gap 32px`):** título Bold 16px. Linhas de 2 campos de 417px (8.4 com raio 3): Nome de exibição | Nome de usuário; E-mail | Nome ENS; Apelido da carteira | Avatar.
  - **Avatar:** círculo 50×50 `surface-raised`, borda 1px `border`, ícone Image 24×24; **"Alterar"** 98×40 `primary` raio 3 Bold 14px `ink`; **"Remover"** Regular 14px `foreground`.
  - **Alterar senha:** título Medium 16px; 3 campos de 417px, ícone Hide 20×20, padding-x 16.
  - **Salvar:** 131×40 `primary`, raio 3, Bold 14px `ink`.
- Sem footer nesta tela.

### 9.9 Carteiras (`9:1670`) — ❌ não extraída
Sem dados. Sidebar e header provavelmente compartilhados com o Perfil (não verificado).

---

## 10. Por tela — Mobile

Raiz de todas: fundo `ink`, `flex-col`, **raio 40**, overflow clip.

### 10.1 Início (`14:5226`)
- Padding `40px 24px 0`, `gap 16px`.
- **Busca (45px):** campo `surface-card` 313×45, raio 10, padding 12, ícone 22×22 + "Explorar coleções" Bold 14px/16px `secondary`. **Filtro:** 45×45 raio 14, gradiente (6.2), ícone 22×22.
- **Hero (366×190):** raio 12, padding 16, fundo vetorial. Eyebrow Medium 12px/16px `foreground`; título Bold 18px/29px (w 190); descrição Regular 12px/18px `text-secondary`; CTA "EXPLORAR" Bold 12px/14px `text-accent` com seta 16×16; artes 138×138 e 58×58 (raio 16); paginação 33×7.
- **Abas:** ativa Bold 14px/16px `text-accent` + sublinhado SVG; inativas Regular 14px `foreground`, `gap 16px`.
- **Grade:** 2 colunas de 175px, `gap 24px`, coluna direita +32px. Card: moldura 175×200 raio 20 (gradiente 6.2), arte 168×168 raio 16, favorito 28×28; nome Regular 15px; preço Bold 16px `text-accent`. **Badge "RARO":** 68×32 `primary`, Medium 13px `ink`, sem raio.
- **Tab Bar:** ver 8.7.

### 10.2 Detalhes do NFT (`15:5536`)
- **Hero** 414×506 (margem inferior −114), gradiente (6.2). Barra superior (left 28, top 23, w 361): voltar e coração 35×35, raio 17.5, `surface-raised`, borda `border`. Arte 361×356 raio 24.
- **Sheet** 414×504, `surface-card`, raio superior 31, padding `32px 24px 24px`, `gap 12px`: título Bold 20px/16px; pílula de avaliação 80×27 raio 32 borda `primary` ("4.8" Medium 14px, "(19)" Regular 14px `text-secondary`); descrição Regular 14px/24px `text-secondary`; "Edição:" Bold 15px + chips `gap 12px`; metadados Regular 15px `secondary`.
- **Buy Bar** (h164, `surface-card`, raio superior 40, padding `20px 24px 36px`, sombra `0 0 10px`): "Qtd." Medium 15px `text-secondary`, controle (8.3), valor Medium 18px/25px; preço Bold 20px/16px `text-accent`. **"Comprar NFT"** 196×60 raio 40, Bold 16px/20px `ink`; **carrinho** 60×60 raio 40 `surface-raised`, borda `border`.

### 10.3 Carrinho de NFTs (`16:360`)
- Padding-top 32, `gap 4px`; conteúdo `px 28`, `gap 12px`.
- **Header:** botão voltar 35×35; título "Carrinho de NFTs" Bold 20px/16px (left 96, top 9).
- **Item** (358×100, `gap 20px`): fundo `#241612`, raio 14, sombra `0 6px 20px`; imagem 100×100 raio esquerdo 14 (com cópia `mix-blend-multiply`); nome Bold 15px/16px; "Edição: 1/50" Regular 14px `text-secondary`; preço Bold 18px `text-accent`; quantidade (menos 24×24, valor Regular 16px/22px, "+" 24×24 `surface-raised` borda `border`); com quantidade mínima o menos vira lixeira 24×24.
- **Resumo (bottom sheet):** `surface-card`, raio superior 40, padding `24px 24px 36px`. Cupom: h50 raio 40 borda 1px `border` sombra `0 6px 10px`, placeholder Regular 13px/22px `secondary`; "Aplicar" 97×50 raio 40 gradiente, Bold 15px `foreground`. Linhas Regular 15px; valores Regular 16px/16px; "Taxa estimada" Regular 12px `text-accent`; Total Bold 16px / Bold 18px `text-accent`. **CTA** 358×60 raio 40, gradiente, Bold 16px `ink`.

### 10.4 Pagamento (`16:748`)
- Padding `32px 28px`; conteúdo `justify-between`; grupo superior `gap 16px`.
- **Header:** voltar 35×35; título "Pagamento com carteira" Bold 20px/16px (left 59, top 9).
- **"Carteira conectada"** Bold 16px + **"Trocar carteira"** Bold 14px `text-accent`.
- **Cards de carteira** (358×93, raio 14, `surface-card`, `gap 20px`): título Bold 16px (left 54); subtexto Regular 14px/22px `text-secondary`; ícone 16×16; pontinhos 3×15. Sombra apenas no "Reserva" (`0 20px 20px`).
- **"Carteira e rede":** título Bold 16px; opções 359×65 raio 15 `surface-card`, `gap 16px`; avatar 40×40 (left 14, top 13) com letra Bold 14px `text-accent`; label Regular 14px (left 65); radio/check 16×16 (left 326). Sombras: `0 0 20px` e `0 0 40px` (Coinbase).
- **Total:** "Total:" Bold 16px + "8.936 ETH" Bold 18px `text-accent`, `gap 28px`, alinhado à direita.
- **"Confirmar compra"** 358×60 raio 40, gradiente (6.2), Bold 15px `ink`.

### 10.5 Login (`16:1022`) e Cadastro (`16:1228`) — ❌ não extraídas
Sem dados.

---

## 11. Estados interativos

O Figma **não desenha** hover, focus, disabled, loading nem erro em nenhuma tela extraída. Variantes de estado efetivamente presentes:

| Componente | Variante desenhada |
| --- | --- |
| Miniatura de galeria | Selecionada: borda 1px `primary` |
| Chip de edição | Selecionado: texto Medium `text-accent` |
| Aba / item de nav | Ativo: `text-accent` + Bold + sublinhado |
| Item da sidebar do Perfil | Ativo: borda esquerda 6px `primary` |
| Campo de senha (Login) | Foco/preenchido: borda 1px `primary` |
| Opção de carteira (Pagamento) | Selecionada: borda 1px `primary` (desktop); radio vs check (mobile, só em SVG) |
| Campo obrigatório | Asterisco `text-coral` (único indício de erro) |
| Carrinho mobile | Quantidade mínima: menos vira lixeira |

> Hover, focus visível, disabled, loading, erro de validação, shimmer dos skeletons, estados de toast e telas mobile de Perfil/Carteiras/Confirmação **não existem no Figma**. O README exige todos; precisarão seguir "o mesmo padrão visual" (README §1) e ser registrados como decisão em `ARCHITECTURE.md`. Sugestão a validar com você: hover = `primary` com leve clareamento; focus = anel 2px `text-accent`; disabled = 40% de opacidade; erro = borda e texto `text-coral`.

---

## Lacunas e pendências

### Telas não extraídas (limite do plano Starter)
1. Desktop / Início (`2:2`)
2. Desktop / Cadastro (`9:1022`)
3. Desktop / Carteiras (`9:1670`)
4. Mobile / Login (`16:1022`)
5. Mobile / Cadastro (`16:1228`)

Para completar: aguardar a renovação da cota do MCP, usar um plano com mais chamadas, ou me passar capturas dessas telas. A chamada de `2:2` ainda foi tentada de novo por mim e recusada pelo mesmo motivo.

### Valores não obtidos nas telas extraídas
- Cor e espessura de traços em **SVG**: divisores, sublinhado do item ativo, pílulas de edição, dots do carrossel, slider de preço, risco do preço antigo, ícones da tab bar, radio/check das carteiras, círculos de voltar mobile. Recomendável exportar esses SVGs ou ler no modo Dev do Figma.
- Altura dos frames mobile: o metadata da página lista 896 para todos, mas Detalhes mobile tem conteúdo que sugere altura própria (não confirmado). As alturas desktop da seção 1 vêm do metadata da página.
- Opacidade do scrim, raio, borda e sombra do modal de Confirmação e do modal de Login.
- Raio dos cards "Mais desta coleção" (apenas a arte interna tem raio).
- Cor da estrela de avaliação (possivelmente `Amber #E3A44E`).

### Divergências a decidir
- **Duas cores de borda:** `border #3F2319` (inputs, cards) e `border-soft #55321F` (só no chip de carteiras). A lista global sugeria `#55321F` como "border"; o código usa `#3F2319` nos inputs.
- **Raios inconsistentes entre telas** (3, 5, 6, 8px nos botões/inputs desktop). Mantidos como no layout, sem normalizar.
- **Login desktop** é um modal sobre a página Início; o mobile (não extraído) pode ter outra estrutura.
- **Tablet (768):** inexistente no Figma.
- **Nome da marca:** "KURIO" no layout vs "GreenMint" no nome da página.
