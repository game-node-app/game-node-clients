# Tasks

## 1. Base compartilhada

- [x] 1.1 Criar a branch da change a partir de `main` (o checkout atual é `feature/redesign-feats-page`) e confirmar com `git status` que só arquivos desta change entram nela.
- [x] 1.2 Extrair o `<footer>` de `apps/web/src/pages/index.tsx` para `apps/web/src/components/landing/LandingFooter.tsx` e usá-lo na landing; verificar em `yarn dev -F web` que `/` fica visualmente igual em 1440 e 390 px e que `#features`/`#premium` continuam funcionando.
- [x] 1.3 Adicionar ao `LandingHeader` o estado ativo (sublinhado brand de 2 px e `aria-current="page"` no link da rota atual, via `useRouter().pathname`); verificar em `/about` que só "Sobre" fica marcado e em `/` que nenhum link fica.
- [x] 1.4 Criar `apps/web/src/components/about/` com `About.module.css`, `aboutAssets.ts`, `aboutMockData.ts` e os componentes comuns (cabeçalho de seção com eyebrow, card escuro, capa com legenda); verificar com `yarn workspace web lint` sem erros novos.

## 2. Assets e traduções

- [x] 2.1 Carregar o skill `figma-design-to-code`, pedir `get_design_context` por frame filho de `5335:19115` (e dos frames de `5337:19115` com layout diferente) e baixar as imagens para `apps/web/public/img/about/` com nomes descritivos, reaproveitando os ícones de plataforma, logo e wordmark de `public/img/landing/`; verificar que cada arquivo existe, não está vazio, tem dimensões coerentes com o slot e que `grep -r "figma.com/api" apps/web/src` não encontra nada.
- [x] 2.2 Adicionar o namespace `about.*` em `packages/locales/src/translations/json/pt-BR.json` (texto completo do design, lido do `get_design_context`, não dos nomes de camada truncados) e `en.json`, e rodar `yarn locales:generate-types`; verificar que as duas línguas têm as mesmas chaves e que `yarn type-check -F web` passa.

## 3. Seções do topo

- [x] 3.1 Implementar `AboutHero` (título com destaque brand, texto, CTAs, nota "Já tem conta? Entrar", mosaico de capas com glow e os cards flutuantes "Jogando"/"Concluído") e `AboutManifesto` (eyebrow, texto em dois tons, três colunas com ícone); verificar contra os frames Hero e Manifesto em 1440 e 390 px, e que a primeira capa usa `fetchPriority="high"`.
- [x] 3.2 Implementar `AboutFeatureIndex` com `id="features"`, 16 itens em duas colunas (uma no mobile, ordem do frame mobile), ícones e links para as âncoras da D6 ("Notificações" sem link); verificar que clicar em "Biblioteca" rola até a seção e que `/about#features` abre no índice.

## 4. Seções de funcionalidades

- [x] 4.1 Implementar `AboutLibrarySection` (texto, lista com checks e estante de quatro colunas por status com contadores e capas); verificar contra o frame e que a estante empilha sem rolagem horizontal em 390 px.
- [x] 4.2 Implementar `AboutJournalSection` (gráfico de barras da semana, sessões, barras de tempo para zerar com a nota de valores ilustrativos, card de review com estrelas); verificar geometria das barras e cards em 1440/768/390 px.
- [x] 4.3 Implementar `AboutProgressSection` (cartão de nível com barra de XP e três conquistas, painel laranja da retrospectiva com quatro números, chips e nota de exemplo); verificar contra o frame nos três tamanhos.
- [x] 4.4 Implementar `AboutCommunitySection` (feed com abas estáticas e quatro atividades, card Explorar com chips de período, ranking de quatro capas e chips de filtro); verificar que nenhum elemento do mockup recebe foco por Tab e que o mockup tem `aria-hidden`.
- [x] 4.5 Implementar `AboutConnectionsSection` (seis plataformas, conectores e hub GameNode com três chips e glow); verificar curvas e proporções em 1440 px e o layout do frame mobile em 390 px.
- [x] 4.6 Implementar `AboutAiSection` (texto, chips dos assistentes, CTA para `/mcp`, chat ilustrativo com card do jogo e lista de permissões com interruptores decorativos); verificar o destino do CTA e que os interruptores não são focáveis.
- [x] 4.7 Implementar `AboutBeyondLibrarySection` (card Daily com quatro modos e badge com `useDailyToday` + `useDailyCountdown`, card Prêmios com "+1000 XP", card Blog); verificar que o contador decresce a cada segundo com o serviço disponível e que o card aparece sem badge quando a requisição falha (bloquear a chamada no DevTools), e que Daily e Blog levam a `/daily` e `/blog`.
- [x] 4.8 Implementar `AboutMobileAppSection` (mockup dos celulares com glow, botão Google Play em nova aba, App Store desabilitado); verificar destino e estado desabilitado.

## 5. Premium, mural e fechamento

- [x] 5.1 Implementar `AboutPremiumSection` com `id="premium"` (perfil Premium ilustrativo, benefícios agrupados, CTA violeta para `useSupporterEntryHref()`, "Começar grátis" e as duas garantias); verificar destinos com e sem sessão e que o hero "Conhecer o Premium" rola até a seção.
- [x] 5.2 Implementar `AboutSupportersWall` conforme D3 (limite 23, cards com anel violeta e pill Premium, card "Seu nome aqui", 7 itens + "Ver mais" em telas estreitas, carregar mais, skeleton/erro com retry/vazio só com o CTA, nota sobre a Lista Premium); verificar contra o serviço local com lista cheia, vazia e com falha simulada, e que cada card abre o perfil.
- [x] 5.3 Implementar `AboutPromiseSection` (título com destaque, texto, GitHub e Discord em nova aba) e `AboutFinalCta`; verificar destinos e layout em 390 px.
- [x] 5.4 Reescrever `apps/web/src/pages/about.tsx` como página fina (`<Head>` com título/descrição traduzidos, `LandingHeader`, seções na ordem do design, `LandingFooter`); verificar que `/about` continua fora do `GlobalAppShell` e que `yarn workspace web build` passa.
- [x] 5.5 Remover as chaves `landing.headline`, `landing.features.*`, `landing.mobile.*`, `landing.platforms.*`, `landing.support.*` (e `headlineAlt`, `subheadline`, `featureDescription`, `header` se seguirem sem uso) das duas línguas, regenerar os tipos e apagar de `public/img/about_us/` só os arquivos que não tiverem mais referências; verificar com `grep -r` em `apps/` e `packages/` antes de cada remoção e com `yarn type-check -F web`.
- [x] 5.6 Adicionar o changeset (`yarn changeset`, só `web`) descrevendo o redesign da página Sobre; verificar que o arquivo aparece em `.changeset/`.

## 6. Verificação integrada

- [x] 6.1 Comparar `/about` com os frames `5335:19115` (1440 px) e `5337:19115` (390 px) e conferir 768 px, em pt-BR e en; corrigir divergências de assets, geometria, sobreposição, foco e rolagem horizontal, e registrar diferenças intencionais (mural sem título/data, menu mobile do cabeçalho). (Revisão principal em 2026-11-15: R01 estante mobile e R02 tipografia corrigidos e confirmados em navegador; F1 classificado como diferença intencional exigida pela D5, que preserva o footer da landing, inclusive a grade mobile de duas colunas e os links atuais. Mural sem título/data e header/menu existentes conforme D3/D5. Rede validada com respostas simuladas; backend local indisponível. Evidências em `/tmp/opencode/about-wave4/REPORT.md`.)
- [x] 6.2 Rodar `yarn workspace web lint`, `yarn type-check -F web` e `yarn workspace web build`; registrar resultados, separando falhas pré-existentes das introduzidas. (2026-11-15, após o CSS final: lint exit 0 com 0 warnings, type-check exit 0, build exit 0; logs em `/tmp/opencode/about-wave4/checks/`; único aviso é o `baseline-browser-mapping` pré-existente.)
- [x] 6.3 Conferir cada cenário de `specs/web-about-page/spec.md` e revisar o diff para garantir que `@repo/ui`, mobile e admin não mudaram e que a landing `/` só ganhou o rodapé extraído e o estado ativo do cabeçalho. (Cenários, âncoras, destinos, auth, mural e Daily verificados com rede mockada; `git status` de `packages/ui`, `apps/mobile` e `apps/admin` vazio; diff de `index.tsx` só remove o footer inline para `LandingFooter`; detalhes e a pendência F1 do footer mobile em `/tmp/opencode/about-wave4/REPORT.md`.)
