# Design

## Context

Ver motivação em `proposal.md`. A página atual concentra o conteúdo em `apps/web/src/pages/index.tsx`, importa `LandingHeader` e usa `useUserId` para redirecionar a `/home`. `/` já está fora do shell global. O provider global aplica modo escuro e Roboto; `packages/ui/src/util/theme.ts` já define `brand: #F15025`.

O MCP Figma retornou contexto detalhado e screenshot do frame de 1440 px: hero com fundo luminoso e dois mockups, bento de cinco cards, diagrama Steam/Xbox/PlayStation/Epic Games/GOG/Ubisoft, Premium de R$ 9,90 e rodapé com painel laranja. O MCP Mantine confirmou `SimpleGrid` e suporte a propriedades responsivas. Não há specs anteriores nem infraestrutura de teste web declarada no package.json.

## Goals / Non-Goals

**Goals:** traduzir a referência para composição Mantine 9, aproveitando tema, router e traduções existentes; isolar estilos da landing para evitar regressões no produto.

**Non-Goals:** copiar o JSX absoluto gerado pelo Figma, criar design system paralelo, simular integrações ou implementar cobrança.

## Decisions

1. Manter `index.tsx` como entrada e preservar o efeito de sessão. Reutilizar `LandingHeader`, extraindo seções para `apps/web/src/components/landing/` somente quando facilitar a leitura. Alternativa rejeitada: nova rota ou shell, que duplicaria integração existente.
2. Compor `Container`, `Box`, `Stack`, `Group`, `SimpleGrid`/`Grid`, `Paper`, `Title`, `Text`, `Button`, `Anchor` e `List`. Usar props Mantine e CSS Modules para fundo, gradientes, contornos e posicionamento de ilustrações. Não alterar o tema global. Alternativa rejeitada: transportar Tailwind e coordenadas absolutas do protótipo para todo o layout.
3. Referência desktop de 1440 px com conteúdo de aproximadamente 1270 px; bento com três cards na primeira linha e dois na segunda. Em telas estreitas, empilhar cards, colunas Premium e rodapé; adaptar navegação com componentes Mantine e preservar todas as ações. Reservar posicionamento absoluto a elementos decorativos e composição interna do diagrama. Não inferir animação apenas do nome Animated Beam: a versão inicial usa o visual estático retornado.
4. Na implementação, renovar o contexto Figma e baixar assets conforme instruções do MCP para `public/img/landing/`. Reusar assets existentes somente se forem correspondências exatas; preservar proporções e dimensões raiz dos SVGs. Incluir mockups, capas, avatares, logos, estrelas, radar, gráfico e curvas. Não usar screenshot da tela como asset. Roboto vem do provider; para a marca Friza no rodapé, preferir exportação fiel do elemento de marca se a fonte não estiver disponível, sem adicionar fonte sem licença.
5. Mapa de destinos: Sobre → `/about`; Blog → `/blog`; Privacidade → `/privacy`; funcionalidades/Premium → âncoras; Entrar/CTA principal → `/home`; Downloads → Google Play existente; Assinar Premium → `https://patreon.com/GameNodeApp`; comunidade/ajuda → Discord existente; contato → `mailto:support@gamenode.app`; X → endereço existente. Instagram não foi encontrado: representar como texto sem aparência de link até existir URL oficial confirmada, sem inventar endereço. Não criar páginas vazias ou links `#` sem alvo.
6. Manter preço e benefícios como conteúdo da referência pt-BR, traduzir textos via `@repo/locales` em pt-BR/en e gerar tipos com `yarn locales:generate-types`. O preço não constitui configuração de cobrança nem exige conversão monetária. Exemplos 4.8 e 24h são ilustrações do produto, sem consultas ao backend.

## Risks / Trade-offs

- [Preço/benefícios do mockup podem divergir do Patreon] → conferir condições no destino antes da publicação; registrar divergências para decisão do responsável, sem implementar billing.
- [Frame disponível apenas para desktop] → adaptação mobile proposta; validar em 375, 768 e 1440 px, inclusive textos em inglês.
- [Links e fonte de marca incompletos] → destinos existentes e exportação fiel; não inventar canais nem substituir imagens por aproximações.
- [Mudanças locais pré-existentes em providers e traduções] → editar somente chaves necessárias, sem sobrescrever arquivos ou regenerar código alheio.
- [Assets pesados e deslocamento de layout] → dimensões explícitas, proporções corretas e lazy loading abaixo da dobra; não atrasar a imagem principal desnecessariamente.

## Migration Plan

Substituir o conteúdo da landing na rota atual junto com assets e traduções. Sem migração de dados ou configuração. Validar lint/build do web e cenários da spec; adicionar verificação pequena de navegação/sessão se houver nova lógica. Reverter os arquivos da change restaura a landing anterior, preservando alterações locais externas ao escopo.
