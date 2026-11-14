# Design

## Context

Motivação em `proposal.md`, requisitos em `specs/web-app-navigation/spec.md` e `specs/notification-center/spec.md`.

Estado atual:

- `GlobalAppShell` usa `AppShell` do Mantine com `header.height = 54`, `navbar.width = 64` e `breakpoint: "md"`. A navbar (`GlobalShellNavbar`) mostra só ícones com `Tooltip`, um `HoverCard` de coleções (`GlobalShellNavbarCollectionsMenu`) e o menu do avatar (`GlobalShellNavbarSettingsMenu`). `GlobalShellNavbarItem` é um stub vazio. `GlobalShellNavbarUserMenu` não é importado em lugar nenhum.
- `GlobalShellHeader` tem burger (abaixo de `md`), logo, lupa (`toggleSpotlight`) e `GlobalShellHeaderNotifications`. O `Spotlight.Root` de `CommandCenter` já usa o atalho padrão `mod + K`.
- `GlobalShellHeaderNotifications` e `apps/mobile/src/pages/notifications.tsx` repetem a mesma lógica: `useInfiniteAggregatedNotifications`, `acknowledgeNotificationsRead`, achatamento das páginas e `AggregatedNotification` com fundo zebrado. `AggregatedNotification` tem textos em inglês fixos ("has started following you.", "and N others", "commented on your …").
- `NotificationInboxItemDto` traz `type`, `actors[]`, `actorCount`, `preview`, `target`, `lastEventAt`, `version` e `readVersion`. O `@repo/wrapper` atual ainda reflete o contrato antigo: `GET /v1/notifications` com só `cursor` e `limit`, `avatar {id, filename}` e `target.game {id, name, slug}`.
- O `game-node-server` já implementou os itens de `server-handoff.md` (ainda sem commit no momento desta revisão). O `server_swagger.json` dele expõe:
  - `GET /v1/notifications?filter=all|unread` (padrão `all`). O cursor guarda o filtro, e um cursor usado com outro filtro retorna 400. `unreadCount` é sempre o total.
  - `PATCH /v1/notifications/read-all` (`NotificationsController_acknowledgeReadAll_v1`), com body `NotificationReadAllRequestDto { before?: date-time }`, obrigatório mas com campos opcionais. Responde `{ success, unreadCount }`, mas o Swagger não declara o schema da resposta (`200` sem `content`).
  - `NotificationActorDto.isFollowedByRecipient?: boolean`, calculado em lote por página. Ator deletado retorna `false`.
  - `NotificationGameContextDto.coverUrl: string | null`, a URL IGDB de `game_cover.url`, preenchida no projector e com backfill pela migração `1795100000000-AddNotificationGameCoverUrl`. É a capa padrão do jogo, não a capa personalizada do destinatário.
  - `NotificationAvatarDto.extension: string`. Não há `avatarVideo`.
- `UserAvatar` busca o perfil por `userId` (`useUserProfile`) para montar a URL com ``getS3StoredUpload(`${filename}.${extension}`)`` e mostrar o vídeo de apoiador. O follow acontece em `UserFollowActions` (`FollowService.followControllerRegisterFollowV1({ followedUserId })`, invalidando `useFollowStatus`).
- `useSettingsModalState().open(tab, section?)` abre o modal de configurações nas abas `premium`, `profile`, `notifications` e `appearance`, entre outras.
- O web carrega Roboto pelo `next/font` só nos pesos 300, 500 e 700. O Figma usa 400 (Regular) e 600 (SemiBold).
- Testes de UI ficam em `apps/mobile` (vitest + jsdom). Os testes atuais de notificação (`notification-inbox.test.tsx`, `achievement-unlocked-notification.test.tsx`, `connection-reauth-notification.test.tsx`, `import-discovery-notification.test.tsx`) renderizam `AggregatedNotification`.

## Goals / Non-Goals

**Goals:** reproduzir fielmente os componentes "Navegação final" do Figma. Concentrar a apresentação de notificações em `@repo/ui` para que web e mobile compartilhem item, abas, agrupamento e lista. Remover textos fixos do código.

**Non-Goals:** mudar o servidor (o contrato já foi entregue), mostrar vídeo de avatar ou a capa personalizada do destinatário nas notificações, mudar a navegação do mobile (menu lateral ou tabs Ionic), criar modo claro ou novo sistema de temas, e alterar o tema Mantine (`DEFAULT_MANTINE_THEME`).

## Decisions

### 0. Sincronizar `@repo/wrapper` com o servidor

Antes de qualquer código de notificação, alinhar o wrapper:

1. No `game-node-server`, gerar o Swagger pelo caminho normal (`yarn start`, que grava `server_swagger.json`) e conferir que bate com o merge manual feito pelo agente do servidor. Se divergir, vale o gerado.
2. Antes de copiar, pedir ao servidor que declare a resposta de `read-all` (`@ApiOkResponse({ type: NotificationReadAllResponseDto })`). Sem isso, o método gerado retorna `any`. Se não der para esperar, tipar a resposta localmente no hook (`{ success: boolean; unreadCount: number }`) e registrar a pendência.
3. Copiar o arquivo para `packages/wrapper/input/server_swagger.json` e rodar `yarn wrapper:generate`. Os arquivos gerados nunca são editados à mão.
4. Conferir no gerado: `notificationsControllerFindAllV1(cursor?, limit?, filter?)` (a ordem dos parâmetros vem do Swagger), `notificationsControllerAcknowledgeReadAllV1(requestBody)`, `NotificationActorDto.isFollowedByRecipient`, `NotificationGameContextDto.coverUrl` e `NotificationAvatarDto.extension`. Rodar `yarn type-check`: o novo parâmetro posicional pode quebrar callers de `findAll`.

O cliente só pode ir para produção depois do deploy do servidor com a migração.

### 1. Layout do shell: `AppShell` com navbar flutuante

Manter o `AppShell` do Mantine e mudar as dimensões. Desktop (`md`+): `header.height = 72` (16 px de respiro + Topbar de 56 px), `navbar.width = collapsed ? 72 + 32 : 248 + 32` (o painel tem margem de 16 px dos dois lados) e `padding` do main igual a 16. A Topbar e o Dock são painéis internos com fundo, borda e raio próprios, e o `AppShell.Header`/`AppShell.Navbar` ficam transparentes e sem borda (`withBorder={false}`, `classNames`). O Dock usa `position: sticky` dentro da navbar, com altura `calc(100dvh - 72px - 32px)`.

Abaixo de `md`: `navbar.collapsed.mobile = !drawerOpened` e largura 248 + 32. O Dock aparece sempre aberto, e o burger da Topbar alterna a gaveta. Acionar um item chama `onNavigate`, que fecha a gaveta.

Alternativa rejeitada: trocar o `AppShell` por grid próprio. Isso duplicaria o controle de offsets, de breakpoint e do footer estático que o `AppShell` já resolve.

### 2. Componentes do web ficam em `apps/web`

Dock, Topbar e menu da conta só existem no web e usam `next/link`/`next/router` diretamente, como o shell atual. Estrutura nova em `apps/web/src/components/general/shell/`:

```
navbar/
  Dock.tsx                 // painel, cabeçalho, grupos, rodapé; prop collapsed
  DockItem.tsx             // Navigation/Item (ícone, rótulo, badge New, estados)
  DockGroup.tsx            // título do grupo (aberto) ou divisor (recolhido)
  DockAccount.tsx          // Navigation/Account + Menu (menu da conta)
  AccountMenuItem.tsx      // Account menu/Item (Tone Default | Danger)
  dockItems.ts             // definição dos grupos e destinos
header/
  GlobalShellHeader.tsx    // Topbar/Bar (refeito)
  TopbarIconButton.tsx     // botão 40×40 compartilhado por lupa e sino
  GlobalShellHeaderNotifications.tsx  // sino + Popover com NotificationsPanel
```

Remover: `GlobalShellNavbar.tsx`, `GlobalShellNavbarItem.tsx`, `GlobalShellNavbarCollectionsMenu.tsx`, `GlobalShellNavbarCollectionsSection.tsx` (se não tiver outro uso), `user-menu/GlobalShellNavbarUserMenu.tsx`, `user-menu/GlobalShellNavbarSettingsMenu.tsx`, `user-menu/GlobalShellNavbarUserMenuItem.tsx` e `user-menu/GlobalShellUserMenuOverview.tsx`. Mover `GAMENODE_ANDROID_URL` para `dockItems.ts` ou um `constants.ts` do shell e atualizar os imports existentes. O acesso às coleções passa a ser o item "Coleções" (`/profile?tab=collections`).

### 3. Estado recolhido persistido com `useLocalStorage`

`useLocalStorage<boolean>({ key: "gamenode.dock.collapsed", defaultValue: false, getInitialValueInEffect: true })` de `@mantine/hooks`, como em `pages/home`. O `getInitialValueInEffect` evita divergência de hidratação no SSR. O primeiro render sempre sai aberto e a preferência é aplicada depois da montagem. Para evitar o salto visual, a transição de largura do navbar usa `transition: width 150ms`.

Alternativa rejeitada: cookie lido no SSR. Seria mais preciso, mas exigiria mexer no `_app` e em todos os `getServerSideProps` só por isso.

### 4. Item ativo

`isActive(item)` compara `router.pathname`/`asPath`. Para itens de perfil, o ativo vale quando `pathname` começa com `/profile` e `query.tab` é igual ao `tab` do item. "Perfil" é ativo com `tab` ausente ou `main`. Para os demais, vale `pathname === href || pathname.startsWith(href + "/")`. Com isso, `/home` não ativa nada além de Início. O item ativo recebe `aria-current="page"`.

### 5. Componentes de notificação em `@repo/ui`

Nova estrutura em `packages/ui/src/components/notifications/`:

```
view/
  NotificationItem.tsx            // Notifications/Item (só apresentação)
  NotificationItemLeading.tsx     // Avatar (do DTO) | Icon | Cover
  NotificationsTabs.tsx           // Notifications/Tabs
  NotificationsSectionTitle.tsx   // Notifications/Section title
  NotificationsActionButton.tsx   // Notifications/Action button
  NotificationsList.tsx           // abas + seções + itens + "carregar mais" + vazio/loading
  NotificationsPanel.tsx          // cabeçalho (título, marcar todas, engrenagem) + NotificationsList + rodapé opcional
  InboxNotificationItem.tsx       // liga NotificationInboxItemDto → NotificationItem (mensagem, leading, navegação)
hooks/
  useNotificationsInbox.ts        // inbox por filtro + agrupamento + ack + read-all
  useFollowBackNotification.ts    // mutation "Seguir de volta" com atualização do cache da inbox
util/
  getNotificationContent.ts       // (item, t) → { name, message, leading } por tipo, sem requisições
  groupNotificationsByDate.ts     // itens → [{ key: "today" | "week" | "older", items }]
  formatNotificationTime.ts       // lastEventAt → "2 min" | "1 h" | "2 d" | data curta
  navigateToNotificationTarget.ts // navegação atual de AggregatedNotification, extraída sem mudança
```

`NotificationItem` recebe apenas props visuais (`leading`, `name`, `time`, `message`, `unread`, `action?`, `onClick`) e pode ser reutilizado e testado sem DTO. `InboxNotificationItem` substitui `AggregatedNotification`. A navegação por alvo (inclusive a resolução de `review` no clique) é movida sem mudança de comportamento.

`useInfiniteAggregatedNotifications` ganha o parâmetro `filter: "all" | "unread"` (padrão `"all"`), repassado ao serviço. A chave passa a ser `["notifications", "aggregated", "infinite", userId, filter]` (hoje termina em `userId`), e `getNotificationsInboxKey(userId, filter?)` é exportado para invalidação e `setQueryData`. O prefixo `["notifications"]` continua valendo para invalidar tudo, como no `IonRefresher`. O sino da Topbar e o badge do mobile usam `filter: "all"`, para compartilhar o cache com a aba "Todas".

`useNotificationsInbox({ filter })` retorna `{ sections, unreadCount, hasUnread, markAllAsRead, markAsRead, isMarkingAll, isLoading, isFetching, hasNextPage, fetchNextPage, refetch }`:

- `unreadCount` vem de `pages[0].unreadCount` da consulta ativa. É o total do servidor nos dois filtros.
- Na aba "Não lidas", os itens vêm do servidor. Um item aberto nessa aba fica na lista como lido até o próximo `invalidate`, para a lista não pular sob o dedo.
- Página vazia com `hasMore = true` (refill limitado do servidor): a sentinela continua visível e dispara `fetchNextPage`. O estado vazio só aparece com `hasNextPage === false`.
- `markAllAsRead` usa `useMutation` com `NotificationsService.notificationsControllerAcknowledgeReadAllV1({ before })`. `before` é o maior `lastEventAt` entre as páginas em cache dos dois filtros (`queryClient.getQueriesData({ queryKey: ["notifications", "aggregated"] })`), ou omitido se não houver itens.
  - `onMutate`: `cancelQueries(["notifications", "aggregated"])`, snapshot de todas as consultas do prefixo, `setQueriesData` marcando `readVersion = version` nos itens com `lastEventAt <= before` e zerando `unreadCount` de forma provisória.
  - `onSuccess`: grava o `unreadCount` retornado em `pages[0]` das consultas.
  - `onError`: restaura os snapshots e chama `createErrorNotification`.
  - `onSettled`: invalida `["notifications", "aggregated"]`.
- `markAsRead(item)` mantém `acknowledgeNotificationsRead` (um item, `PATCH /read`), com atualização otimista do item e do `unreadCount` nas duas consultas. O helper de lotes de 100 continua existindo para esse caminho, mas deixa de ser usado para "marcar todas".

`useFollowBackNotification()` é uma mutation com `FollowService.followControllerRegisterFollowV1({ followedUserId })`:

- `onMutate`: em todas as consultas `["notifications", "aggregated"]`, define `isFollowedByRecipient = true` nos atores com esse `userId`. Assim o botão some na hora e não reaparece em outros itens do mesmo ator. Guarda o snapshot.
- `onError`: rollback e `createErrorNotification`.
- `onSettled`: invalida `["follow", "status", ownUserId, actorUserId]` (a chave de `useFollowStatus`), para que o perfil reflita o follow. A inbox não é invalidada, porque o estado otimista já é o do servidor.
- A ação usa `stopPropagation`, não navega e não confirma a leitura do item.

`getNotificationContent` retorna `action: { kind: "followBack", userId }` quando `type === "profile.followed"` e `actors[0]?.isFollowedByRecipient === false`. `InboxNotificationItem` liga essa ação ao hook e passa `loading` para `NotificationsActionButton`.

Leading:

- **Avatar**: `NotificationActorAvatar` (interno à pasta) recebe `actor.avatar` e monta ``getS3StoredUpload(`${filename}.${extension}`)``, ou mostra o `Avatar` vazio do Mantine se for `null`. Não usa `UserAvatar`/`useUserProfile`, então não mostra vídeo de apoiador. Isso é aceito porque a lista não deve fazer consulta por ator.
- **Cover**: `content.liked`, `comment.created` e `comment.replied` com `target.type === "activity"` e `target.game?.coverUrl` usam `getSizedImageUrl(coverUrl, ImageSize.COVER_SMALL)` (ou o menor tamanho que fique nítido em 36 × 42 com DPR 2), com `alt` igual a `target.game.name`. Se a imagem falhar (`onError`), cai para o avatar.

Web (popover e página) e mobile (página) apenas renderizam `NotificationsPanel` com props diferentes (`variant: "popover" | "page"`, `onSeeAll?`, `onOpenSettings`, `onItemNavigate?`). Assim a regra de leitura e agrupamento fica num só lugar.

Alternativa rejeitada: um presenter novo no registry do `UIProvider`. As diferenças entre apps são só de contêiner (Popover, página Next, `AppPage` Ionic), então props bastam.

### 6. Mensagens traduzidas e plural

Novas chaves em `notifications.*` (en e pt-BR), com plural do i18next (`_one`/`_other`) baseado em `actorCount`. O nome do ator principal e "e mais N" ficam em `name`. A ação fica em `message`. O mapa completo está em "Textos" abaixo. As chaves antigas `notifications.discovery.*`, `achievementUnlocked` e `connectionReauthRequired` são reaproveitadas quando servirem. Os textos dos `reports.messages.*` continuam os mesmos.

### 7. Tokens: escala `nav` no Tailwind compartilhado

Adicionar em `packages/config-tailwind/tailwind.config.ts`, dentro de `theme.extend.colors`:

```ts
nav: {
  canvas: "#0B0B0B",   // color/bg/canvas: fundo das abas
  surface: "#111111",  // color/bg/sidebar: Dock, Topbar, menus, popover
  raised: "#222222",   // color/bg/raised, color/nav/item-bg-active: hover/active/aba selecionada
  border: "#2A2A2A",   // color/border/subtle: bordas e divisores
  text: "#FFFFFF",     // color/text/primary
  muted: "#ADADAD",    // color/text/secondary
  danger: "#DDA4A4",   // color/danger/text: Sair
  "accent-subtle": "rgba(241, 80, 37, 0.12)", // color/accent/subtle: pill Novo, fundo de ícone
},
```

Laranja (`color/primary`, `color/badge/bg`, `color/nav/icon-active`) usa `brand` (`#F15025`), e o texto da badge (`color/badge/text`) usa `nav-canvas`. Não usar `brand.N` do Mantine (todos são `#F15025`, ver AGENTS.md). Para Badge/ThemeIcon, usar classes Tailwind `bg-nav-accent-subtle text-brand-5` em componentes próprios (`Box`), não props `c=`/`bg=` em `Badge` do Mantine.

Alternativa rejeitada: variáveis CSS globais (`--color-bg-sidebar`). Duplicaria o mecanismo de cores do Tailwind já usado no repo.

### 8. Fonte

Adicionar os pesos `"400"` e `"600"` ao `Roboto({ weight: [...] })` em `apps/web/src/pages/_app.tsx`, para que `font-normal`/`font-semibold` não sejam sintetizados. No mobile, conferir a origem da Roboto e incluir 400/600 se faltarem.

### 9. Ícones: Tabler com traço ajustado

Os glyphs do Figma são ícones Tabler redesenhados em 20 px (traço de 1,333 px). Usar `@tabler/icons-react` com `size={20} stroke={1.6}` (1,6 × 20/24 ≈ 1,333). A cor vem do item: `currentColor`, herdando `text-nav-muted`/`text-nav-text`. Mapa de candidatos (a tarefa 1.2 confirma comparando o path do SVG exportado do nó Figma com o do Tabler):

| Figma (`Icons/Nav/*`, nó) | Tabler candidato |
|---|---|
| home `5192:1842` | `IconHome` |
| explore `5192:1845` | `IconCompass` |
| daily `5192:1848` | `IconDeviceGamepad2` |
| ai `5192:1851` | `IconRobot` |
| activity `5192:1854` | `IconBolt` |
| blog `5192:1857` | `IconNews` |
| user `5192:1860` | `IconUser` |
| library `5192:1863` | `IconBooks` |
| collections `5192:1866` | `IconLayoutGrid` |
| journal `5192:1869` | `IconNotebook` |
| achievements `5192:1872` | `IconTrophy` |
| feats `5192:1875` | `IconMedal` |
| wrapped `5192:1878` | `IconLayoutDashboard` |
| premium `5192:1887` | `IconCrown` |
| settings `5192:1890` | `IconAdjustmentsHorizontal` |
| palette `5201:2037` | `IconPalette` |
| download `5192:1902` | `IconDownload` |
| logout `5192:1905` | `IconLogout` |
| bell `5192:1881` | `IconBell` |
| search `5192:1884` | `IconSearch` |
| gear `5201:2040` | `IconSettings` |
| checks `5201:2046` | `IconChecks` |
| chevron-left/right `5192:1896`/`5192:1899` | `IconChevronLeft`/`IconChevronRight` |

Se algum glyph não tiver equivalente Tabler exato, exportar o SVG do nó pelo MCP Figma para `packages/ui/src/components/general/icons/nav/` (mantendo `width`/`height` 20) e usá-lo como componente. Não redesenhar.

### 10. Testes

Testes vitest em `apps/mobile/src/components/notifications/`, importando de `packages/ui` por caminho relativo quando preciso. Cobrem `getNotificationContent` (todos os tipos, plural, ação de seguir de volta, leading Cover e fallback para avatar), `groupNotificationsByDate` e `formatNotificationTime` (com `vi.setSystemTime`), `useNotificationsInbox` (`filter` repassado ao serviço e chave por filtro, `read-all` com `before`, otimista, `unreadCount` retornado e rollback, com `vi.spyOn(NotificationsService, …)`), `useFollowBackNotification` (cache otimista, rollback e invalidação do status de follow, com `vi.spyOn(FollowService, …)`) e renderização de `InboxNotificationItem` (avatar montado do DTO, sem chamada a `ProfileService`). Os quatro testes existentes migram de `AggregatedNotification` para `InboxNotificationItem`, mantendo as asserções de comportamento. Não há runner no web: o shell é verificado por `lint`, `type-check`, `build` e conferência visual.

## Referência de design (Figma)

Arquivo `ikcThguwowTdynGz0L2YkS`, página "Version 3.0" (`3994:677`), grupo "Navegação final". Tipografia: Roboto. `text/sm/semibold` = 14/600, `text/sm/regular` = 14/400 e `text/xs/regular` = 12/400, todos com line-height `normal` e sem letter-spacing. Espaçamentos: `3xs` 4, `2xs` 8, `sm` 12, `md` 16. Raios: `sm` 4, `md` 8.

### Topbar/Bar — nó `5206:18769` (componente `5202:2266`)

- Painel `bg-nav-surface rounded-md h-14 px-4 flex items-center gap-2`, sem borda.
- Logo 72,8 × 28 (`GameNodeLogo`, link para `/home`). Depois, espaço flexível.
- `Topbar/Search` (`5202:2177`), recolhido: botão 40×40 `rounded-md`, ícone search 20. Hover `bg-nav-raised`. Focus: contorno 2 px `brand`. Aciona `spotlight.open()`. `aria-label` "Buscar". Tooltip com "Ctrl K"/"⌘ K".
- `Topbar/Notification button` (`5202:2220`): botão 40×40 com ícone bell 20. Hover e Active (popover aberto) `bg-nav-raised`. Badge Count: `absolute left-[23px] top-[3px] h-4 px-1 rounded-md bg-brand-5 border-2 border-nav-surface text-[12px] text-nav-canvas`, conteúdo `min(count, 99)` ou "99+". Badge Dot fica disponível, mas não é usada.
- Abaixo de `md`: burger (botão 40×40, ícone `IconMenu2`) antes do logo. Visitante: botão "Entrar" `variant="outline"` como hoje.

### Navigation/Dock — aberto `5206:18785`, recolhido `5211:15029` (componente `5195:1901`)

- Painel `bg-nav-surface border border-nav-border rounded-md flex flex-col gap-4`. Aberto: `w-[248px] p-4`. Recolhido: `w-[72px] px-3 py-4`. O Dock ocupa a altura disponível, e um espaço flexível empurra o rodapé para baixo. A área de grupos rola (`overflow-y-auto`) se faltar altura.
- **Cabeçalho** (`Navigation/Collapse toggle`, `5192:2077`). Aberto: "Navegar" 14/600 branco (flex-1) + botão 40×40 `rounded-md` com chevron-left 20. Recolhido: só o botão, centralizado, com chevron-right. Hover do botão `bg-nav-raised`. `aria-label` "Recolher navegação"/"Expandir navegação" e `aria-expanded`.
- **Grupo** (`gap-3`). Aberto: título (`Navigation/Group title`, `5192:2057`) 12/400 `text-nav-muted` e itens com `gap-1`. Recolhido: o título vira `Navigation/Divider` (`5192:2059`, `h-px bg-nav-border w-full`) antes do grupo, e há outro divisor entre "Utilitários" e Conta.
- **Item** (`Navigation/Item`, `5192:1908`): `h-10 rounded-md flex items-center gap-3`. Aberto: `px-3`. Recolhido: `justify-center`. Ícone 20. Rótulo flex-1 14 px.
  - Default: rótulo `text-nav-muted` 400, ícone `text-nav-muted`.
  - Hover: `bg-nav-raised`, rótulo branco 400.
  - Active: `bg-nav-raised`, rótulo branco 600.
  - Focus (`:focus-visible`): `outline outline-2 outline-brand-5` (sem fundo), rótulo branco.
  - Badge New aberto: pill `h-5 px-1.5 rounded-sm bg-nav-accent-subtle text-[12px] text-brand-5` "Novo". Badge New recolhido: ponto `absolute left-[30px] top-2 size-2 rounded-full bg-brand-5` (relativo ao item de 48 px de largura útil).
  - Recolhido: `Tooltip` com o rótulo, `position="right"`.
- **Ordem e destinos**:

| Grupo | Rótulo pt-BR / en | Ícone | Destino | Badge |
|---|---|---|---|---|
| Descobrir / Discover | Início / Home | home | `/home` | — |
| | Explorar / Explore | explore | `/explore` | — |
| | Daily Nodes / Daily Nodes | daily | `/daily` | New |
| | GameNode + IA / GameNode + AI | ai | `/mcp` | New |
| | Atividade / Activity | activity | `/activity` | — |
| | Blog / Blog | blog | `/blog` | — |
| Seu espaço / Your space | Perfil / Profile | user | `/profile` | — |
| | Biblioteca / Library | library | `/library` | — |
| | Coleções / Collections | collections | `/profile?tab=collections` | — |
| | Diário / Journal | journal | `/profile?tab=journal` | — |
| | Conquistas / Achievements | achievements | `/achievements` | — |
| | Feitos / Feats | feats | `/feats` | — |
| | Wrapped / Wrapped | wrapped | abre `RecentlyPlayedGamesShare` | — |
| Utilitários (sem título) | Premium / Premium | premium | `settings.open("premium")` | — |

- **Conta** (`Navigation/Account`, `5192:2102`): `h-[52px] px-2 rounded-md flex items-center gap-3`. Contém `UserAvatar` 32 (circular), nome 14/600 branco e "Minha conta" 12/400 `text-nav-muted`, com `truncate` no nome. Recolhido: só o avatar, centralizado. Hover `bg-nav-raised`. Focus: contorno 2 px brand. Open: `bg-nav-raised border border-nav-border`.

### Account menu/Panel — nó `5206:19210` (componente `5202:2068`)

- `Menu` do Mantine com `position="right-end"`, `offset={8}`, `withinPortal`. `Menu.Dropdown`: `w-[232px] p-2 bg-nav-surface border border-nav-border rounded-md flex flex-col gap-1`.
- Cabeçalho: `Navigation/Account` com legenda "Ver perfil" / "View profile", link para `/profile/{userId}`, `h-[52px] px-2`.
- Divisor (`h-px bg-nav-border`).
- Itens (`Account menu/Item`, `5202:2037`): `h-10 px-3 rounded-md gap-3`, ícone 20, rótulo 14/400.
  - Default: `text-nav-muted`. Hover: `bg-nav-raised` e texto branco. Focus: contorno 2 px brand e texto branco.
  - Tone Danger (só Sair): texto e ícone `text-nav-danger` em todos os estados.
- Ordem: Configurações / Settings (settings → `settings.open("profile")`), Temas / Themes (palette → `settings.open("appearance")`), Downloads / Downloads (download → `GAMENODE_ANDROID_URL`, `target="_blank"`), divisor, Sair / Log out (logout → `/auth/logout`).

### Notifications/Popover — nó `5206:19001` (componente `5203:2353`)

- `Popover` do Mantine com `position="bottom-end"`, `offset={8}`, sem seta. `Popover.Dropdown`: `w-[400px] h-[556px] p-2 bg-nav-surface border border-nav-border rounded-md flex flex-col gap-1`. Em telas menores que 432 px, usar `w-[calc(100vw-32px)]`.
- **Cabeçalho**: `pl-3 pr-1 py-1 flex items-center gap-1`, com "Notificações" 14/600 branco (flex-1); o botão "Marcar todas como lidas" (`h-8 px-2 gap-1.5 rounded-md`, ícone checks 20 e texto 12/400 `text-brand-5`; hover `bg-nav-raised`; desabilitado com opacidade 50%); e o botão engrenagem 32×32 (`aria-label` "Configurações de notificações").
- **Filtros**: `px-1 pb-1`, com `Notifications/Tabs` (`5203:2330`): contêiner `bg-nav-canvas p-0.5 rounded-md flex gap-0.5`. Cada aba tem `h-7 px-3 rounded-sm text-[12px]`. Selecionada: `bg-nav-raised text-white`. Não selecionada: `text-nav-muted`. A aba "Não lidas" tem o contador `h-4 px-[5px] rounded-md bg-brand-5 text-[12px] text-nav-canvas` com `gap-1.5`. Usar `role="tablist"`/`role="tab"`/`aria-selected`.
- Divisor.
- **Lista**: flex-1, `overflow-y-auto` (`ScrollArea` do Mantine). Ao chegar perto do fim, chama `fetchNextPage` (`IntersectionObserver` com sentinela) se `hasNextPage`.
- **Section title** (`5203:2345`): `pl-3 pt-2 pb-1`, 12/400 `text-nav-muted`. Rótulos: Hoje / Today, Esta semana / This week, Mais antigas / Earlier.
- **Rodapé**: divisor e botão "Ver todas" / "See all" (`h-10 w-full rounded-md`, 14/400 branco, hover `bg-nav-raised`).

### Notifications/Item — componente `5203:2193`

- `p-3 rounded-md flex items-start gap-3 w-full text-left`, como `UnstyledButton`. Hover `bg-nav-raised`. Focus: contorno 2 px brand.
- Leading 36×36:
  - Avatar: `Avatar` circular de 36, com `src` montado do DTO (ver Decisão 5).
  - Icon: `size-9 rounded-md bg-nav-accent-subtle` com ícone 20 `text-brand-5`.
  - Cover: `w-9 h-[42px] rounded-sm object-cover`, imagem de `target.game.coverUrl` (ver Decisão 5).
- Conteúdo: `flex-1 min-w-0 flex flex-col gap-1`.
  - Linha 1: `flex items-center gap-1.5`, com nome 14/600 branco (`truncate`) e horário 12/400 `text-nav-muted` (`shrink-0`).
  - Mensagem: 14/400, `line-clamp-2`. Não lida: branco. Lida: `text-nav-muted`.
  - Ação opcional (`Notifications/Action button`, `5203:2188`): `h-7 px-2.5 rounded-md border border-nav-border text-[12px] text-white`, hover `bg-nav-raised`. Usa `stopPropagation`.
- Indicador de não lida: coluna `w-2 h-5 flex items-center` com ponto `size-2 rounded-full bg-brand-5`, mais texto visualmente oculto "Não lida" / "Unread".

### Página `/notifications` (web) e página mobile

Sem frame próprio no Figma. Usar `NotificationsPanel variant="page"`: mesma composição do popover, sem altura fixa, com largura máxima de 640 px centralizada (web) ou largura total (mobile), cabeçalho com título 14/600 e sem rodapé "Ver todas". O mobile mantém `AppPage withMenuButton`, `SessionAuth` e `IonRefresher`. O web usa o padrão de rota autenticada de `pages/activity/following.tsx` (`SessionAuth`).

### Textos (en / pt-BR)

| Chave sugerida | en | pt-BR |
|---|---|---|
| `navigation.dock.title` | Navigate | Navegar |
| `navigation.dock.collapse` / `expand` | Collapse navigation / Expand navigation | Recolher navegação / Expandir navegação |
| `navigation.dock.groups.discover` / `yourSpace` | Discover / Your space | Descobrir / Seu espaço |
| `navigation.dailyNodes` | Daily Nodes | Daily Nodes |
| `navigation.ai` | GameNode + AI | GameNode + IA |
| `navigation.wrapped` | Wrapped | Wrapped |
| `navigation.premium` | Premium | Premium |
| `navigation.new` | New | Novo |
| `navigation.account.caption` / `viewProfile` | My account / View profile | Minha conta / Ver perfil |
| `navigation.account.themes` | Themes | Temas |
| `navigation.search` | Search | Buscar |
| `notifications.markAllAsRead` | Mark all as read | Marcar todas como lidas |
| `notifications.settings` | Notification settings | Configurações de notificações |
| `notifications.tabs.all` / `unread` | All / Unread | Todas / Não lidas |
| `notifications.sections.today` / `thisWeek` / `earlier` | Today / This week / Earlier | Hoje / Esta semana / Mais antigas |
| `notifications.seeAll` | See all | Ver todas |
| `notifications.actions.followBack` | Follow back | Seguir de volta |
| `notifications.unread` | Unread | Não lida |
| `notifications.emptyUnread` | You're all caught up. | Nada novo por aqui. |
| `notifications.actors.andOthers` | {{name}} and {{count}} more | {{name}} e mais {{count}} |
| `notifications.messages.followed_one/_other` | started following you. / started following you. | começou a seguir você. / começaram a seguir você. |
| `notifications.messages.likedReview_one/_other` | liked your review{{game}}. / liked your review{{game}}. | curtiu sua review{{game}}. / curtiram sua review{{game}}. |
| `notifications.messages.likedActivity_one/_other` | liked your activity{{game}}. | curtiu sua atividade{{game}}. / curtiram sua atividade{{game}}. |
| `notifications.messages.likedPost_one/_other` | liked your post. | curtiu seu post. / curtiram seu post. |
| `notifications.messages.likedComment_one/_other` | liked your comment. | curtiu seu comentário. / curtiram seu comentário. |
| `notifications.messages.liked_one/_other` | liked your content. | curtiu seu conteúdo. / curtiram seu conteúdo. |
| `notifications.messages.gameSuffix` | of {{name}} | de {{name}} |
| `notifications.messages.commented_one/_other` | commented on your {{target}}: "{{text}}" | comentou na sua {{target}}: "{{text}}" / comentaram… |
| `notifications.messages.commentedNoText_*` | commented on your {{target}}. | comentou na sua {{target}}. |
| `notifications.messages.replied_*` / `repliedNoText_*` | replied to your comment: "{{text}}" / replied to your comment. | respondeu seu comentário: "{{text}}" / respondeu seu comentário. |
| `notifications.targets.review` / `post` / `activity` / `content` | review / post / activity / content | review / publicação / atividade / publicação |
| `notifications.achievement.title` | Achievement | Conquista |
| `notifications.connection.title` | {{provider}} connection | Conexão com {{provider}} |
| `notifications.time.minutes` / `hours` / `days` / `now` | {{count}} min / {{count}} h / {{count}} d / now | {{count}} min / {{count}} h / {{count}} d / agora |

A mensagem de `content.liked` escolhe a chave pelo `target.type` (`review`, `activity`, `post`, `comment`, outros). O sufixo de jogo só aparece quando `target.game.name` existe. A concordância de gênero de `{{target}}` em pt-BR fica nas chaves por alvo: usar variantes completas por alvo se "na sua"/"no seu" variar. A conferência do texto pt-BR com o Figma ("curtiram sua review de Elden Ring.") faz parte da tarefa de traduções.

## Risks / Trade-offs

- [Cliente publicado antes do servidor] → `filter` desconhecido seria ignorado, mas `read-all` retornaria 404 e `coverUrl`/`extension` viriam ausentes. Fazer o deploy do servidor com a migração antes do release dos clientes. O código trata `coverUrl` e `isFollowedByRecipient` ausentes como "sem capa" e "sem ação".
- [Swagger mesclado à mão no servidor] → Regenerar com `yarn start` antes de copiar (Decisão 0) e conferir o diff de `packages/wrapper/src/server`.
- [Resposta de `read-all` sem schema no Swagger] → Pedir `@ApiOkResponse` ao servidor. Até lá, o hook tipa a resposta localmente.
- [Avatar sem vídeo de apoiador nas notificações] → Escolha consciente para manter zero consultas por ator. O vídeo continua no perfil.
- [Capa padrão em vez da capa personalizada do destinatário] → Limitação documentada no servidor. Aplicar capas personalizadas exigiria uma consulta em lote na leitura e fica para outra change.
- [`isFollowedByRecipient` desatualizado depois de seguir pelo perfil] → O estado vem na próxima busca da inbox. Seguir pela própria notificação já atualiza o cache na hora.
- [Item lido continua na aba "Não lidas" até atualizar] → Comportamento intencional para não reordenar a lista sob o ponteiro. O próximo `invalidate` remove o item.
- [Hidratação do estado recolhido no SSR] → `getInitialValueInEffect` com transição curta. Aceitar um quadro com o Dock aberto no primeiro carregamento de quem prefere recolhido.
- [Altura útil do Dock em telas baixas (< 760 px)] → A área de grupos rola, e o cabeçalho e o rodapé (Premium e Conta) ficam fixos.
- [Remoção do menu de coleções em hover] → O item "Coleções" leva à aba de coleções do perfil, que já lista e cria coleções. Validar com o responsável de produto na revisão visual.
- [Mudança de offsets do `AppShell` afeta páginas com layout próprio (ex.: `sticky` com `top-[54px]`)] → Procurar usos de `54`/`--app-shell-header-height` e ajustar para a nova altura.

## Migration Plan

Entrega única para web e mobile. A migração de dados (`coverUrl`) é do servidor e precisa estar aplicada antes do release dos clientes. Ordem: sincronizar o wrapper, tokens e fonte, componentes de notificação em `@repo/ui` e migração dos callers (web e mobile), Topbar e popover, Dock e menu da conta, página `/notifications`, remoção dos componentes antigos. Rollback: reverter a change restaura o shell e os itens anteriores. Não há estado persistido além da chave `gamenode.dock.collapsed` no `localStorage`, que é ignorada pelo código antigo.

## Open Questions

- O texto "Novo" de Daily Nodes e GameNode + IA deve sair em alguma data? Por enquanto fica fixo no `dockItems.ts`, como o `isNew` atual.
