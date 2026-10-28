# Tasks

## 1. Assets e conteúdo

- [ ] 1.1 Renovar contexto e screenshot do frame `3994:4538` pelo MCP Figma e baixar os assets para `apps/web/public/img/landing/` conforme instruções retornadas; verificar arquivos não vazios, dimensões, correspondência com os slots e ausência de URLs temporárias no código.
- [ ] 1.2 Adicionar textos da landing em pt-BR/en nas traduções existentes e executar `yarn locales:generate-types`; verificar chaves geradas e preservar mudanças locais alheias.
- [ ] 1.3 Aplicar o mapa de destinos do design; verificar links internos existentes e registrar conferência de preço/benefícios do Patreon e situação do Instagram antes da publicação.

## 2. Cabeçalho e hero

- [ ] 2.1 Adaptar `LandingHeader` com componentes Mantine, navegação desktop/mobile e CTAs do design; verificar destinos, teclado e acesso a todas as ações em 375 e 1440 px.
- [ ] 2.2 Substituir o hero de `index.tsx` por composição Mantine com fundo e mockups fiéis, mantendo o redirecionamento de sessão; verificar imagem principal, proporções e navegação de visitante/autenticado. Se houver nova lógica de navegação, adicionar um teste pequeno ou self-check que cubra seu comportamento.

## 3. Seções da landing

- [ ] 3.1 Implementar o bento com cinco cards e assets originais usando Paper/Grid e tipografia Mantine; verificar três cards superiores e dois inferiores em desktop, empilhamento mobile e conteúdo traduzido sem cortes.
- [ ] 3.2 Implementar o diagrama estático de conexões com as seis plataformas do Figma; verificar logos, curvas, proporções e legibilidade em 375, 768 e 1440 px.
- [ ] 3.3 Implementar oferta Premium com preço, sete benefícios e CTA para Patreon; verificar conteúdo pt-BR conforme referência e funcionamento do link sem checkout novo.
- [ ] 3.4 Implementar rodapé com marca, painel em gradiente, colunas e destinos definidos; verificar navegação, contraste, foco e ausência de links fictícios, documentando qualquer canal ainda sem URL oficial.

## 4. Verificação integrada

- [ ] 4.1 Comparar a página completa com a referência Figma em 1440 px e conferir 375/768 px nos dois idiomas; registrar resultado e corrigir diferenças em assets, geometria, sobreposição, foco e rolagem horizontal usando ferramentas de teste permitidas no ambiente.
- [ ] 4.2 Executar `yarn workspace web lint` e `yarn workspace web build`; registrar resultados e distinguir falhas pré-existentes das introduzidas pela change.
- [ ] 4.3 Conferir todos os cenários de `specs/web-landing/spec.md`, incluindo sessão, destinos e assets locais; revisar diff para garantir que providers, shell global e aplicações mobile/admin não sofreram alterações fora do escopo.
