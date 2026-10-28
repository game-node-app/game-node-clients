# Proposal

## Why

O importador atual multiplica requisições por página, perde seleções entre páginas e pode sobrescrever entradas existentes ao importar. Os contratos de lote entregues pelo backend permitem corrigir esses problemas e oferecer importação, descarte e visibilidade da fila com uma experiência consistente no Web e Mobile.

## What Changes

- Atualizar o snapshot OpenAPI e regenerar `@repo/wrapper` com filtro de biblioteca, DTOs e endpoints de lote e metadados das conexões próprias.
- Consumir os jogos e capas da própria fila, filtrar a biblioteca no servidor e normalizar apenas o 404 de fila vazia.
- Preservar seleção de IDs externos entre páginas e buscas; oferecer status inicial, coleções, seleção da página, limpeza, importação selecionada, importação de toda a fonte com confirmação e descarte em lote.
- Disponibilizar ações sticky acessíveis no Web e Mobile, resultados reais de importados/ignorados por presença na biblioteca e invalidação dos caches afetados.
- Mostrar pendências conhecidas, última sincronização e reconexão necessária nos cards; diferenciar busca vazia, primeira sincronização e fila concluída.
- Corrigir rota mobile de preferências, aba ativa no retorno OAuth, títulos/busca das páginas mobile e query key do prefetch Web.
- Mostrar conta e estado de conexão, substituir controles que aparentam ligar/desligar a conexão por ações explícitas e oferecer CTA de importação para conexões elegíveis.
- Traduzir validação, ações e notificações de importação em inglês e português, usando o renderer atual `AggregatedNotification`.

## Capabilities

### New Capabilities

- `library-import-queue`: experiência frontend da fila por fonte, contratos gerados, seleção persistente, operações em lote, estados vazios, cache e mensagens localizadas.
- `connection-management`: apresentação das conexões próprias, disponibilidade e reconexão, acesso ao importador e navegação Web/Mobile durante configuração e OAuth.

### Modified Capabilities

Nenhuma: não há specs principais neste repositório. A capability homônima do backend é uma dependência externa, não uma spec a modificar aqui.

## Impact

- `packages/wrapper/input/server_swagger.json`, serviços/modelos/exports gerados em `src/server`; `packages/locales` e tipos de tradução gerados.
- `packages/ui`: hooks/telas do importador, seleção compartilhada, preferências, callback e ramo de descoberta de `AggregatedNotification`; preservar uso da seleção no formulário de DLCs.
- `apps/web/src/pages/importer/index.tsx`; páginas, rotas, listener de deep link e preferências de `apps/mobile`; testes existentes de conexões e novos testes focados de importação no runner Vitest mobile.
- Depende dos novos contratos de `game-node-server` estarem disponíveis antes da publicação do frontend. Sem alterações de backend, dependências novas, polling de sincronização ou migrações de dados.
