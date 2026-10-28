# Proposal

## Why

A landing atual de `apps/web` não corresponde à apresentação definida no Figma. Substituí-la pelo frame aprovado apresenta coleção, descoberta, comunidade e apoio ao projeto com identidade visual consistente e componentes Mantine.

## What Changes

- Recriar a rota pública `/` conforme o frame `3994:4538` do arquivo Figma `ikcThguwowTdynGz0L2YkS`: cabeçalho, hero, funcionalidades, conexões, Premium e rodapé.
- Usar componentes Mantine e o tema existente, mantendo layout responsivo, acessibilidade e traduções pt-BR/en.
- Integrar CTAs e links com rotas, âncoras e destinos existentes; preservar o redirecionamento de autenticados para `/home`.
- Armazenar localmente os assets específicos do design sem URLs temporárias do Figma.
- Fora de escopo: checkout, alterações de planos/preços no backend, novas integrações de plataformas e mudanças nos aplicativos mobile/admin.

## Capabilities

### New Capabilities

- `web-landing`: apresentação pública responsiva do produto, navegação e chamadas para entrada e apoio ao projeto.

### Modified Capabilities

Nenhuma. O inventário atual não contém specs publicadas.

## Impact

- `apps/web/src/pages/index.tsx`, `apps/web/src/components/general/header/LandingHeader.tsx` e componentes/estilos locais da landing; o único consumidor encontrado de `LandingHeader` é a rota `/`.
- Assets em `apps/web/public/img/landing/`; traduções em `packages/locales/src/translations/json/{pt-BR,en}.json` e tipos gerados pelo comando existente.
- Reutilizar Mantine 9, Next Pages Router, `useUserId`, `useTranslation` e tema `DEFAULT_MANTINE_THEME`. Sem dependências adicionais nem mudanças de API.
- Preservar a exclusão de `/` do `GlobalAppShell`, o provider Mantine global e alterações locais já presentes. Riscos principais: links sem destino no mockup, assets/fontes e divergência entre oferta ilustrada e condições reais do Patreon.
