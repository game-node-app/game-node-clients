# Design

## Context

- `apps/web/src/pages/about.tsx` hoje monta tudo inline (Tailwind + imagens de `public/img/about_us/`) e reutiliza `LandingHeader`, `SupportersWall variant="page"` e `useSupporterEntryHref`. `/about` está em `IGNORED_PATHNAMES` do `GlobalAppShell` e na lista do `OpenInAppDialog`.
- A landing nova (`pages/index.tsx`, change `implement-web-landing-figma`) já usa Mantine 9 + `Landing.module.css`, assets em `public/img/landing/` (ícones das plataformas `780e4/1255f/24331/317b0/b5a83.svg`, `41a07.svg` = logo, `wordmark.svg`) e tem o rodapé do mesmo design embutido no fim de `index.tsx`.
- O Figma é a seção `5334:19790` com dois frames: desktop `5335:19115` (1440×12130) e mobile `5337:19115` (390×16923), cada um com 17 filhos de nível 1 (Nav, Hero, Manifesto, …, Footer). `get_design_context` na seção estoura o limite; é preciso pedir o contexto por frame filho.
- `SupporterWallItemDto` só tem `userId`, `username` e `avatar`. O design mostra também título ("Mecenas") e "desde jan 2025", que a API não fornece.
- `useDailyToday()` é público (sem `enabled` por usuário) e devolve o `nextResetAt` usado por `useDailyCountdown` (`packages/ui/src/components/daily/view/DailyCountdown.tsx`).
- As chaves `landing.headline`, `landing.features.*`, `landing.mobile.*`, `landing.platforms.*` e `landing.support.*` só são usadas por `about.tsx`.

## Goals / Non-Goals

**Goals:**
- Página fiel aos dois frames, com componentes Mantine e a mesma linguagem visual da landing.
- Página fina: `about.tsx` só compõe seções e define `<Head>`.
- Um único rodapé para landing e Sobre.

**Non-Goals:**
- Mover a página para `@repo/ui`: é marketing só do web, como a landing.
- Dados reais nos mockups (biblioteca, diário, feed, explorar etc.).
- Título e data de início no mural (dependem de backend).
- Redesenhar o menu mobile do `LandingHeader`.

## Decisions

### D1. Uma seção por componente em `apps/web/src/components/about/`
Arquivos como `AboutHero.tsx`, `AboutManifesto.tsx`, `AboutFeatureIndex.tsx`, `AboutLibrarySection.tsx`, `AboutJournalSection.tsx`, `AboutProgressSection.tsx`, `AboutCommunitySection.tsx`, `AboutConnectionsSection.tsx`, `AboutAiSection.tsx`, `AboutBeyondLibrarySection.tsx`, `AboutMobileAppSection.tsx`, `AboutPremiumSection.tsx`, `AboutSupportersWall.tsx`, `AboutPromiseSection.tsx`, `AboutFinalCta.tsx`, mais `About.module.css` para gradientes, glows e geometrias que Tailwind não expressa bem, e um `aboutAssets.ts` com o helper de caminho. Pequenas peças repetidas (eyebrow + título de seção, card escuro `bg-[#141414]` com borda, capa de jogo com legenda) viram componentes locais em `components/about/common/`.
Alternativa: um arquivo único como `index.tsx` (388 linhas para metade do conteúdo). Rejeitada: a página tem quase o triplo de seções.

### D2. Mockups estáticos, decorativos e traduzidos
Os mockups são JSX estático com dados fixos num `aboutMockData.ts` (nomes de jogo, horas, XP, usuários de exemplo do design). Textos de interface do mockup ("Jogando", "Próximo nível", "Seguindo", "Semana", "Curtir"…) vêm de `about.*`; nomes próprios (jogos, usernames, Claude/ChatGPT) ficam literais. Cada mockup recebe `aria-hidden` e usa elementos não interativos (`div`/`span`, nunca `button`, `Switch`, `Tabs` ou `SegmentedControl` reais), como já faz o chat de IA da landing. O texto da seção ao lado cobre o conteúdo para leitores de tela.
Alternativa: dados reais (trending real no Explorar, perfil do usuário logado). Rejeitada: o design é demonstrativo, as notas dizem "valores ilustrativos", e chamadas à API aumentariam carga e estados de erro sem ganho.

### D3. Mural Premium com dados reais e card próprio
Novo `AboutSupportersWall` usa `useInfiniteSupportersWall({ limit: 23 })`: 23 itens + o card "Seu nome aqui" fecham 4 linhas de 6 no desktop. Cada card: avatar 64 px com anel violeta (`#9747ff`, a cor Premium já usada em `SupportersWallItem`/`SupporterBadge`), username, pill "Premium" com coroa no estilo de `SupporterBadge` e link para `/profile/:userId`. Sem título nem "desde" (a API não tem). Grade: 6 colunas ≥ lg, 4 em md, 3 em sm, 2 abaixo. Em telas estreitas, como no frame mobile, mostra só os 7 primeiros + CTA até o visitante tocar em "Ver mais"; depois disso, segue o "carregar mais" com `fetchNextPage`. Estados de loading/erro/vazio seguem a lógica de `SupportersWall` (skeletons, retry, e no vazio só o card CTA).
O `SupportersWall` compartilhado não muda: continua servindo a variante `settings` do mobile. A variante `page` fica sem consumidores; remover a variante fica fora desta change para não mexer em `@repo/ui` e nos testes do mobile.
Alternativa: estender `SupportersWall` com uma variante `about`. Rejeitada: o card é bem diferente e o componente já mistura duas variantes.
A nota do rodapé do mural troca "Perfis de exemplo." pela frase que explica a opção Lista Premium.

### D4. Contador do Daily real, opcional
`AboutBeyondLibrarySection` chama `useDailyToday()` e, quando há `data.nextResetAt`, renderiza um badge com `useDailyCountdown`. Sem dado ou com erro, o badge não aparece. É a única chamada à API além do mural. O campo é `DailyTodayResponseDto.nextResetAt`, o mesmo que `DailyHomeView` passa a `DailyCountdown`.

### D5. Rodapé compartilhado e link ativo no cabeçalho
O `<footer>` de `index.tsx` vira `components/landing/LandingFooter.tsx` sem mudança visual, usado por landing e Sobre; os links continuam relativos (`#features`, `#premium`), e a página Sobre expõe `id="features"` (índice) e `id="premium"` (seção Premium), então os mesmos links funcionam nas duas páginas. `LandingHeader` lê `useRouter().pathname` e, para o link cujo `href` é a rota atual, aplica o sublinhado brand de 2 px do design e `aria-current="page"`. Os links do cabeçalho continuam os atuais (inclui `/mcp`, que não está no frame do Sobre) para não divergir da landing.

### D6. Destinos
| Elemento | Destino |
| --- | --- |
| "Criar minha conta grátis", "Cadastre-se", "Começar grátis" | `/home` (mesmo fluxo da landing; sem sessão vai para `/auth`) |
| "Entrar", "Já tem conta? Entrar" | `/home` |
| Hero "Conhecer o Premium →" | `#premium` (seção Premium da própria página) |
| Premium "Conhecer o Premium", mural "Assinar o Premium" / "Seu nome aqui" | `useSupporterEntryHref()` |
| Índice | âncoras das seções (`#library`, `#journal`, `#progress`, `#community`, `#connections`, `#ai`, `#daily`, `#mobile-app`, `#premium`); "Notificações" não tem seção e fica sem link |
| "Conecte seu assistente" | `/mcp` |
| Cards Daily / Blog | `/daily` / `/blog`; Prêmios sem link (não há rota estável sem ano) |
| Google Play | `https://play.google.com/store/apps/details?id=app.gamenode` (nova aba) |
| App Store | botão desabilitado |
| "Ver no GitHub" / "Entrar no Discord" | `https://github.com/game-node-app` / `https://discord.gg/kcAT562B5A` (nova aba) |

### D7. Assets
Pedir `get_design_context` por frame filho (desktop e, para geometrias diferentes, mobile) com o skill `figma-design-to-code` e baixar as imagens retornadas para `apps/web/public/img/about/` com nomes descritivos (`cover-hades.png`, `phone-mockup.png`…), sem URLs do Figma no código. Capas que se repetem entre seções (Hades, Celeste, Outer Wilds, Hollow Knight, Baldur's Gate 3, It Takes Two…) são baixadas uma vez. Ícones das plataformas, logo e wordmark reaproveitam `public/img/landing/`. Ícones de interface usam `@tabler/icons-react` quando houver equivalente exato; caso contrário, o SVG do design. As imagens são `<img>` com `width`/`height` e `loading="lazy"` fora do hero, como na landing. Imagens do hero com `fetchPriority="high"` na primeira capa.

### D8. Cores
Laranja = `brand` (Mantine) / `brand-*` (Tailwind); fundos `#0b0b0b`/`#141414` e bordas `#262626` como na landing. A seção Premium e o mural usam o violeta Premium já existente (`#9747ff`, `#c7a6ff`, `rgba(151,71,255,…)`) via classes Tailwind arbitrárias ou `color="violet"` do Mantine para o botão; sem novas paletas no tema (regra do `AGENTS.md`).

### D9. Traduções
Namespace novo `about` em `en.json`/`pt-BR.json`, agrupado por seção (`about.hero.*`, `about.index.items.<key>.{title,description}`, `about.premium.*`…). Títulos com destaque colorido ("um lugar.", "passar a ser pago.") e frases com trechos em negrito ("Já tem conta? Entrar", nomes no feed) usam chaves separadas (`titleStart`/`titleHighlight`), porque `@repo/locales` não exporta `Trans`. No feed do mockup, a ordem das partes vem de chaves por idioma para não forçar a ordem do português no inglês. Depois, `yarn locales:generate-types`. As chaves `landing.*` exclusivas da página antiga são removidas depois de confirmar com grep que não há outros usos.

## Risks / Trade-offs

- [Mural sem título/data] → Fica mais simples que o design; registrar no PR e, se o produto quiser, abrir pedido de backend para expor título e `supporterSince` no `SupporterWallItemDto`.
- [Muitas imagens] → Página longa e pesada. Mitigação: `loading="lazy"`, dimensões declaradas, exportar capas no tamanho de exibição em 2x no máximo e preferir WebP quando o Figma entregar PNG grande.
- [Capas de jogos e usuários reais nos mockups] → Mesmo padrão já usado na landing; os nomes (ThePrado, Lamarcke…) vêm do design.
- [Deriva entre landing e Sobre] → Rodapé e cabeçalho compartilhados evitam duas versões.
- [Contador do Daily em SSR] → `useDailyCountdown` só tem valor depois de montar, então não há divergência de hidratação; o badge aparece um tick depois.

## Migration Plan

Mudança só de front-end em uma rota pública. Deploy normal do web com changeset `web` (patch/minor). Rollback = reverter o commit; não há dados nem rotas novas.
