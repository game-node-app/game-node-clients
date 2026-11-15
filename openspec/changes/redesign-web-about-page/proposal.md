# Proposal

## Why

A rota pública `/about` do cliente web ainda usa o layout antigo (headline sobre fundo, quatro imagens de funcionalidades, lista de plataformas, chamada para o app, apoio e mural simples) e não segue a identidade da landing nova. O Figma tem um redesign completo da página (seção `5334:19790`, "About (Sam)") que apresenta todas as funcionalidades do GameNode, o Premium e o compromisso de manter grátis o que já é grátis.

## What Changes

- Substituir o conteúdo de `apps/web/src/pages/about.tsx` pela composição dos frames Figma `5335:19115` (desktop, 1440 px) e `5337:19115` (mobile, 390 px) do arquivo `ikcThguwowTdynGz0L2YkS`, com 16 seções na ordem do design: cabeçalho, hero, manifesto, índice de funcionalidades, biblioteca e coleções, diário/tempo para zerar/avaliações, conquistas/níveis/retrospectiva, atividades e explorar, conexões, GameNode + IA, Daily/Prêmios/Blog, app para celular, Premium, Mural Premium, promessa, CTA final e rodapé.
- Montar as ilustrações de produto (estante por status, gráfico do diário, barras de tempo para zerar, review, cartão de nível, retrospectiva, feed, ranking do explorar, chat com assistente, cards do Daily, perfil Premium) como mockups estáticos em Mantine/Tailwind, com textos traduzidos e imagens locais, sem chamadas à API.
- Mostrar no Mural Premium os apoiadores reais (`GET /v1/supporters`, `useInfiniteSupportersWall`) no visual de cards do design, com o card "Seu nome aqui" levando à assinatura. O contador "Próximo em" do Daily usa o `nextResetAt` real do Daily de hoje.
- Extrair o rodapé hoje embutido em `pages/index.tsx` para um componente compartilhado usado pela landing e pela página Sobre, e marcar o link ativo ("Sobre") no `LandingHeader`.
- Adicionar o namespace `about.*` em `pt-BR.json` e `en.json` e remover as chaves `landing.*` que só a página antiga usa.
- Fora de escopo: mudanças de backend (título e data de início no mural, por exemplo), checkout/preços do Premium, a landing `/` (além do rodapé extraído e do link ativo no cabeçalho) e os apps mobile/admin.

## Capabilities

### New Capabilities

- `web-about-page`: página pública "Sobre" do cliente web, com o conteúdo institucional, as funcionalidades, o Premium, o mural de apoiadores e as chamadas para cadastro e comunidade.

### Modified Capabilities

Nenhuma. As specs publicadas (`achievement-authoring`, `blog-editorial-access`, `blog-reading`, `notification-inbox`, `platform-achievements`) não cobrem a página Sobre; a spec `web-landing` ainda está só na change `implement-web-landing-figma`, não arquivada, e não muda de comportamento.

## Impact

- Código: `apps/web/src/pages/about.tsx` (página fina), novos componentes em `apps/web/src/components/about/`, novo `apps/web/src/components/landing/LandingFooter.tsx` (extraído de `pages/index.tsx`), `apps/web/src/components/general/header/LandingHeader.tsx` (estado ativo).
- Assets: imagens do design baixadas para `apps/web/public/img/about/`; reaproveitamento dos ícones de plataforma e do wordmark em `public/img/landing/`. As imagens antigas de `public/img/about_us/` usadas só pela página atual deixam de ser referenciadas.
- i18n: `packages/locales/src/translations/json/{pt-BR,en}.json` e tipos gerados por `yarn locales:generate-types`.
- Dados: reutiliza `useInfiniteSupportersWall`, `useSupporterEntryHref`, `useDailyToday` e `useDailyCountdown` de `@repo/ui`; sem novas dependências nem mudanças de API.
- Mantém `/about` fora do `GlobalAppShell` e na lista do `OpenInAppDialog`. Precisa de changeset para `web`.
