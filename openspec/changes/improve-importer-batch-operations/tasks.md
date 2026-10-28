# Tasks

## 1. Contratos gerados e traduções de base

- [x] 1.1 Obter OpenAPI exportado do backend com os contratos novos e atualizar `packages/wrapper/input/server_swagger.json`; verificar presença de `excludeInLibrary`, endpoints de lote, `isInLibrary`, DTOs de lote e `OwnUserConnectionDto` antes de gerar (o snapshot local do backend inspecionado está desatualizado).
- [x] 1.2 Executar `yarn workspace @repo/wrapper wrapper:generate` e revisar serviços, modelos e exports; verificar as assinaturas dos dois novos métodos, retornos próprios e compatibilidade dos métodos antigos com `yarn workspace @repo/wrapper check-types`, sem alterações incidentais no cliente search.
- [x] 1.3 Acrescentar chaves en/pt-BR para lote, confirmação, seleção, status inicial, contagens, vazios, conexão, acessibilidade e notificações; reutilizar traduções de status, executar `yarn locales:generate-types` e `yarn workspace @repo/locales type-check` e conferir paridade dos dois JSONs.

## 2. Listagem e seleção persistente

- [x] 2.1 Atualizar `useImporterEntries` com `excludeInLibrary=true`, query key correspondente e normalização de `ApiError` 404 para paginação zerada; adicionar testes no runner mobile que diferenciem filtros, resposta vazia e propagação de erros diferentes de 404.
- [x] 2.2 Remover `useGames` de `ImporterScreen`, renderizar `entry.game` e desativar exclusão por biblioteca no seletor; verificar em teste de carregamento da página que não são chamados repositório de jogos nem endpoint de biblioteca por card, incluindo jogo sem capa.
- [x] 2.3 Guardar seleção por ID externo com adaptação local para `game.id`, preservar entre buscas/páginas, implementar união/subtração da página e limpeza; testar seleção fora da página, mesma quantidade com itens diferentes, aliases do mesmo jogo e reset ao trocar fonte.
- [x] 2.4 Manter busca disponível sem resultados, resetar página ao alterar/limpar busca e distinguir busca vazia, primeira sincronização e fila processada usando conexão própria; testar 404, `data: []`, data ausente/presente e falha de consulta sem falso sucesso.

## 3. Operações em lote e barra de ações

- [x] 3.1 Adicionar seletor de status inicial com padrão PLANNED e manter seleção de coleções; substituir loop por uma chamada `importerControllerImportBatchV1` com IDs externos, status e coleções. Testar payload após navegar para outra página e ausência de chamadas individuais de criação/status.
- [x] 3.2 Adicionar importar todos com modal confirmando fonte, alcance, status e coleções; usar contagem sem busca ou omitir número desconhecido. Testar cancelamento, modo exclusivo `importAll: true`, ausência de filtro search no envio e confirmação durante busca sem resultados.
- [x] 3.3 Adicionar ignorar selecionados via `importerControllerChangeStatusBatchV1`; testar envio único com fonte e todos os IDs externos selecionados, status ignored, limpeza no sucesso e preservação em falha.
- [x] 3.4 Exibir resultados de importedCount/skippedCount, encerrar notificações em sucesso/erro e impedir operações concorrentes e retries automáticos de escrita; testar sucesso misto, resultado zero, falha sem perda de seleção e bloqueio durante envio.
- [x] 3.5 Invalidar caches de importer/entries, connections/own e collection-entries após sucesso e retornar à página 1; testar que o lote atualiza lista, metadados e biblioteca sem depender do cache removido de jogos.
- [x] 3.6 Implementar barra sticky com contador e ações limpar/ignorar/importar, nomes acessíveis e estados pendentes; testar ações por interação e verificar em Web/Mobile que a barra permanece alcançável sem cobrir paginação ou navegação inferior.

## 4. Plataformas e gerenciamento de conexões

- [x] 4.1 Adaptar `ImporterPlatform` para conexão própria, badge positivo/zero, ausência de contagem desconhecida e última sincronização localizada; testar contagens positiva, zero e omitida, timestamp presente/ausente e REAUTH_REQUIRED com CTA de reconexão.
- [x] 4.2 Exibir sourceUsername e estados no item mobile e usar botões explícitos conectar/configurar/reconectar nos itens Web/Mobile; preservar o switch real de autoimportação. Testar que abrir configuração não altera conexão e que falhas de consulta não confirmam desconexão.
- [x] 4.3 Oferecer CTA importar jogos nos itens de preferências autenticados e elegíveis e no gerenciamento da conexão; verificar acesso à fonte após conexão por identificador e retorno OAuth e ausência de CTA ativo para conexão inelegível ou REAUTH_REQUIRED, com regressão dos testes de configuração existentes.

## 5. Navegação e apresentação Web/Mobile

- [x] 5.1 Registrar `${prefix}/preferences/:category` reutilizando PreferencesPage antes da rota genérica; testar acesso por `/preferences/connections` e `/preferences` em abas distintas, inclusive destino de sucesso/erro do callback compartilhado.
- [x] 5.2 Usar `getTabAwareHref(slug)` no retorno de conexão em `AppUrlListener`, preservando exceções existentes, query/hash e Browser.close; estender `connection-auth.test.tsx` para callback fora de home, URL embutida e remoção do listener, mantendo validações e consumo único sob StrictMode.
- [x] 5.3 Adicionar título traduzido e `withSearch={false}` nas duas páginas mobile; verificar título e ausência de busca global duplicada e manter pull-to-refresh funcional para fila e metadados exibidos.
- [x] 5.4 Corrigir query key do prefetch Web para `["connections", "own"]`; verificar que o estado desidratado usa a mesma chave do hook e não requer entrada paralela de cache para os mesmos dados.

## 6. Textos dos componentes existentes

- [x] 6.1 Localizar a validação de seleção mínima e tooltip/aria-label de `GameSelectActions`; conferir uso no importador e em `CollectionEntryFormDlcsPanel` nos dois idiomas sem alterar a API compartilhada de seleção.
- [x] 6.2 Traduzir o ramo `import.discovery-completed` de `AggregatedNotification.tsx`, sem recriar o componente antigo removido; testar contagens encontradas/importadas/puladas/falhas, amostra, nome acessível e destino do importador em en e pt-BR, preservando os demais tipos.
- [x] 6.3 Regenerar tipos de tradução caso os consumidores exijam ajustes e executar checks de locales/UI; verificar que os novos textos do fluxo e datas não exibem inglês fixo em pt-BR.

## 7. Verificação integrada

- [x] 7.1 Rodar os testes focados e regressões de notificações/conexões no runner existente com `yarn workspace mobile test.unit --run <arquivos-afetados>`; registrar resultados e profissional falhas preexistentes sem ampliar escopo.
- [x] 7.2 Executar typechecks dos workspaces afetados (`@repo/wrapper check-types`, `@repo/locales type-check`, `@repo/ui type-check`, `yarn workspace web exec tsc --noEmit`, `mobile typecheck`) e lint dos arquivos alterados; verificar também os consumidores admin do wrapper quando o diff gerado os afetar e registrar limitações preexistentes.
- [x] 7.3 Validar integrado com backend atualizado em Web e Mobile: uma listagem sem N+1 por card, um POST por lote, seleção entre busca/páginas, FINISHED existente preservado, importAll/ignore e cards/cache atualizados; registrar evidência e qualquer cenário não executável no ambiente.
- [x] 7.4 Conferir sticky em viewport estreita, teclado, safe area/tab bar e OAuth Steam/Xbox nativo quando houver dispositivo/emulador; registrar explicitamente limitações se hardware ou credenciais não estiverem disponíveis.
- [x] 7.5 Executar `openspec validate improve-importer-batch-operations --strict`, revisar alinhamento entre implementação e cenários das duas specs e registrar ordem de publicação backend antes do frontend e limites do rollback descritos em design.md.
