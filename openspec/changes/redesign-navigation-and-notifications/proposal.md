# Proposal

## Why

O Figma "Version 3.0" (`ikcThguwowTdynGz0L2YkS`, grupo "Navegação final") define a nova navegação do GameNode. Ela traz um Dock lateral com rótulos e grupos, uma Topbar com busca e sino com contador, um menu da conta e um popover de notificações com abas e seções por data. Hoje o web usa uma barra de 64 px só com ícones e tooltips, um menu de avatar diferente do design e itens de notificação com fundo zebrado e textos em inglês fixos no código. O mobile repete os mesmos itens antigos. A inbox materializada de `rebuild-notification-system` já entrega a base. O `game-node-server` estendeu esse contrato para o novo design (ver `server-handoff.md`): filtro `unread` na listagem, `PATCH /v1/notifications/read-all`, `actors[].isFollowedByRecipient`, `target.game.coverUrl` e `actors[].avatar.extension`. Com isso, o cliente implementa o design completo sem consultas por item.

## What Changes

- **Web: novo Dock lateral** (substitui `GlobalShellNavbar`). Painel flutuante de 248 px aberto e 72 px recolhido, com cabeçalho "Navegar" e botão de recolher, grupos "Descobrir" e "Seu espaço", itens com estados Default/Hover/Active/Focus, badge "Novo" (pill no aberto, ponto no recolhido), tooltip no recolhido, item Premium no rodapé e bloco da conta. O estado recolhido persiste no navegador. Abaixo de `md`, o Dock abre como gaveta pelo botão de menu.
- **Web: nova Topbar** (substitui o conteúdo de `GlobalShellHeader`). Logo, espaço flexível, busca recolhida (lupa que abre o Spotlight existente, atalho Ctrl/⌘ K) e sino com badge de contagem de não lidas. Visitantes continuam vendo "Entrar".
- **Web: novo menu da conta**, aberto pelo bloco da conta no rodapé do Dock. Mostra cabeçalho com avatar, nome e "Ver perfil", depois Configurações, Temas e Downloads, divisor e Sair em tom de perigo. Substitui `GlobalShellNavbarSettingsMenu` e remove o `GlobalShellNavbarUserMenu` legado, que não é usado.
- **Wrapper**: `packages/wrapper/input/server_swagger.json` recebe o contrato novo de notificações e `@repo/wrapper` é regenerado (`yarn wrapper:generate`).
- **Web e mobile: novos componentes de notificação** em `@repo/ui`: `NotificationItem` (Leading Avatar/Ícone/Capa, nome, horário relativo, mensagem, ponto de não lida, ação opcional), `NotificationsTabs` (Todas / Não lidas com contador), `NotificationsSectionTitle` (Hoje / Esta semana / Mais antigas) e `NotificationsActionButton`. Todos os textos passam a vir de `@repo/locales`.
- **Web: novo popover de notificações** (400 × 556) com cabeçalho, "Marcar todas como lidas", atalho para as configurações de notificação, abas, lista agrupada por data e rodapé "Ver todas".
- **Web: nova página `/notifications`**, destino de "Ver todas", com a mesma lista compartilhada e paginação completa.
- **Mobile: a página `notifications`** passa a usar a mesma lista compartilhada (abas, seções, itens), mantendo pull-to-refresh e paginação.
- **BREAKING (API interna de `@repo/ui`)**: `AggregatedNotification` e sua prop `backgroundColor` saem e dão lugar a `NotificationItem`. Os callers em web e mobile são atualizados na mesma change.
- **Web e mobile: dados do servidor na inbox.** A aba "Não lidas" pagina pelo servidor (`filter=unread`). "Marcar todas como lidas" chama `read-all` uma vez, com `before` igual ao `lastEventAt` mais recente exibido. `profile.followed` mostra "Seguir de volta" quando `isFollowedByRecipient === false`. Atividades com jogo mostram a capa (`coverUrl`). O avatar dos atores sai do DTO, sem buscar o perfil de cada ator.

## Capabilities

### New Capabilities
- `web-app-navigation`: estrutura de navegação autenticada do web, com Dock lateral (aberto/recolhido, grupos, estados, badges, gaveta em telas pequenas), Topbar (logo, busca, sino) e menu da conta.
- `notification-center`: apresentação da inbox em web e mobile, com item de notificação por tipo, abas Todas/Não lidas, agrupamento por data, marcar todas como lidas, popover do sino e página completa de notificações.

### Modified Capabilities

- `notification-inbox` (da change `rebuild-notification-system`): a busca paginada aceita o filtro `unread`, e "marcar todas como lidas" passa a usar `read-all` em vez de lotes de 100 sobre os itens carregados. Zero hidratação, navegação por alvo e confirmação de leitura por item continuam iguais. `rebuild-notification-system` precisa ser arquivada antes desta change para o delta `MODIFIED` ser aplicado.

## Impact

- **Web**: `apps/web/src/components/general/shell/GlobalAppShell.tsx`, `header/GlobalShellHeader.tsx`, `header/GlobalShellHeaderNotifications.tsx`, `navbar/**` (Dock, itens, conta e menu da conta substituem `GlobalShellNavbar`, `GlobalShellNavbarItem`, `GlobalShellNavbarCollectionsMenu`, `user-menu/*`), nova página `apps/web/src/pages/notifications.tsx`.
- **UI compartilhada**: `packages/ui/src/components/notifications/**` (novos componentes, util de agrupamento e mensagens, remoção de `AggregatedNotification`), barrels regenerados.
- **Mobile**: `apps/mobile/src/pages/notifications.tsx` e os testes de `apps/mobile/src/components/notifications/*.test.tsx`, que hoje usam `AggregatedNotification`.
- **Tokens**: novos tokens Tailwind semânticos de navegação em `packages/config-tailwind/tailwind.config.ts` (cores do Figma), sem alterar o tema Mantine.
- **Traduções**: novas chaves em `packages/locales/src/translations/json/{en,pt-BR}.json` mais `yarn locales:generate-types`.
- **Wrapper**: `packages/wrapper/input/server_swagger.json` e os arquivos gerados em `packages/wrapper/src/server` (`NotificationsService.notificationsControllerFindAllV1` com `filter`, novo `notificationsControllerAcknowledgeReadAllV1`, DTOs com `isFollowedByRecipient`, `coverUrl` e `extension`).
- **Servidor**: depende das mudanças em `game-node-server` (`src/notifications`, migração `1795100000000-AddNotificationGameCoverUrl`), que precisam estar em produção antes do deploy dos clientes.
- Sem novas dependências (Mantine 9, `@tabler/icons-react`, `dayjs` já instalados).
- Changeset para `web` e `mobile`.
