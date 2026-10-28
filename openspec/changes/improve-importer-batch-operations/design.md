# Design

## Context

Ver `proposal.md` para motivação. A inspeção confirmou que `ImporterScreen` mantém IDs de jogos no formulário, limpa seleção ao paginar, usa `useGames`, consulta biblioteca por card e executa criação e mudança de status sequenciais. `GameSelectView` trabalha por `game.id` e também atende `CollectionEntryFormDlcsPanel`; esse contrato compartilhado deve ser preservado.

`useImporterEntries` tem prefixo de cache `["importer", "entries", "unprocessed", source]`. As consultas próprias usam `["connections", "own"]` e `["connections", "own", type]`, enquanto o prefetch Web usa outra chave. O Mobile usa roteamento por aba, `getTabAwareHref` e uma tela unificada de preferências; o listener de deep link força `/home`. Os controles de conexão Web/Mobile aparentam switches de estado, mas abrem modais. Já existem testes de conexão, callback, StrictMode e listener em `apps/mobile/src/components/preferences/connections/connection-auth.test.tsx`.

Os DTOs e o controller em `../game-node-server/src/importer` e `src/connection/dto/own-user-connection.dto.ts` confirmam os contratos do hand-off. O snapshot `../game-node-server/server_swagger.json` consultado ainda não contém os novos DTOs/endpoints; copiar esse arquivo sem atualizar sua origem não atende à regeneração. O frontend usa `packages/wrapper/input/server_swagger.json` e `generate.js` com o gerador já instalado.

O antigo `ImporterWatchAggregatedNotification.tsx` não existe. O ramo `import.discovery-completed` de `AggregatedNotification.tsx` contém os textos atuais em inglês. `getTimeSinceString` também retorna inglês; não deve ser reutilizado diretamente para novos textos localizados.

## Goals / Non-Goals

**Goals:** usar a fila como origem de dados dos cards; manter identidades externas até o envio; delegar atomicidade e preservação da biblioteca ao backend; reaproveitar Mantine, React Query, roteadores e Vitest existentes; limitar alterações compartilhadas ao necessário.

**Non-Goals:** alterar contratos ou lógica do servidor, criar infraestrutura de seleção genérica, persistir seleção após recarregar a aplicação, adicionar polling, implementar OAuth novo ou traduzir todos os outros tipos de notificação. A seleção persiste apenas durante o uso da mesma fonte.

## Decisions

### 1. Regenerar a partir de OpenAPI atualizado

Obter o documento OpenAPI exportado pela versão do backend com esses contratos, atualizar o input do servidor e executar `yarn workspace @repo/wrapper wrapper:generate`. Conferir diff de serviços, modelos e `src/server/index.ts`, incluindo retornos próprios como `OwnUserConnectionDto`. Não editar arquivos gerados manualmente nem promover campos privados para o DTO público. O gerador também processa search; reverter somente alterações geradas incidentais sem relação com este escopo. Alternativa de edição manual rejeitada por perder reprodutibilidade. Se o schema correto não estiver disponível na aplicação, registrar o bloqueio específico antes de adaptar consumidores a um contrato incompleto.

### 2. Consulta da fila com filtro e 404 normalizado

Adicionar `excludeInLibrary = true` às props e à query key e enviá-lo na posição gerada do método (esperada após search). Capturar `ApiError` 404 somente nessa listagem e retornar `{ data: [], pagination: { totalItems: 0, totalPages: 0, hasNextPage: false } }`; propagar os demais erros. Renderizar `entry.game` e usar `excludeItemsInLibrary={false}`. O hook de biblioteca do card já desabilita a consulta ao receber `undefined`, dispensando mudança no comportamento compartilhado.

Manter busca visível quando não há resultados; alterar ou limpar busca volta à página 1 sem apagar seleção. Consultar conexão própria por tipo válido para explicar estado vazio; exibir seu erro sem inferir sucesso de sincronização. Normalizar/validar source na fronteira da tela segundo os enums gerados, sem casts que aceitem fontes arbitrárias. Após lotes, voltar à página 1 é a recuperação mais simples contra páginas que deixaram de existir.

### 3. Seleção externa com adaptação local ao seletor existente

Guardar na tela apenas os itens selecionados como um mapa `externalGameId -> gameId`; as chaves são o payload, e os valores adaptam a seleção ao contrato por jogo do `GameSelectView`. Selecionar um jogo visível adiciona todos os IDs externos visíveis correspondentes; desmarcar o jogo remove suas entradas selecionadas. Não converter o payload a partir da página no submit. Deduplicar jogos visíveis por `game.id` para evitar chaves React repetidas quando houver aliases, mantendo todos os IDs externos visíveis associados.

Selecionar página faz união dos IDs externos visíveis; desmarcar página subtrai somente esses IDs. A indicação de seleção completa verifica presença de cada ID visível e exige página não vazia. O contador da seleção representa itens externos selecionados; os resultados de importação representam jogos contabilizados pelo backend e podem diferir quando existem aliases. Limpar remove todo o mapa. Trocar source reinicializa seleção, página, busca e confirmação para impedir envio cruzado; não alterar a API compartilhada do seletor. Alternativas de guardar apenas game IDs ou consultar páginas no envio reproduzem o bug relatado.

### 4. Dois modos de importação e uma ação de descarte

Manter status e coleções no formulário atual; localizar a validação de seleção mínima. Importar selecionados valida seleção e faz uma chamada com `{ externalGameIds, status, collectionIds }`. Importar todos tem ação separada, não depende da validação de seleção e envia `{ importAll: true, status, collectionIds }`. Um modal Mantine confirma fonte, alcance completo, status e coleções, capturando os valores confirmados; cancelar não executa mutação. Não enviar ambos os modos, `gameId`, plataforma ou texto de busca.

O total da listagem é filtrado por search. Sem busca, usar `pagination.totalItems`; com busca ativa, usar o total sem busca de conexão própria ou da consulta sem busca já em cache. Se não houver total conhecido, omitir o número do botão e manter o alcance explícito no diálogo. Nunca rotular importAll com o total filtrado. Os totais são informativos; o resultado do servidor é definitivo e inclui candidatos já presentes na biblioteca, contabilizados em skippedCount.

Ignorar envia `{ source, externalGameIds, status: "ignored" }` em uma chamada. Compartilhar o bloqueio de operação pendente entre as ações; desabilitar também mudanças de seleção e configurações durante envio. Manter tratamento de erro e notificações com ciclo de loading encerrado no sucesso e na falha. Limpar seleção somente no sucesso; falha permite tentar novamente por ação explícita, sem retries automáticos de escrita. Não assumir que a seleção é válida após modificações externas: o erro do servidor permanece visível.

Invalidar `["importer", "entries"]`, `["connections", "own"]` e `["collection-entries"]` após sucesso de lote, sem invalidar `useGames`, removido desse fluxo. Usar os contadores retornados no toast e distinguir skippedCount de itens ignorados voluntariamente. Uma barra `position: sticky` no fluxo mostra contador, limpar, ignorar e importar enquanto existir seleção. Usar o scroll container existente e reservar espaço suficiente para paginação, safe area e tab bar Ionic; controles com nomes acessíveis e navegação por teclado.

### 5. Conexões próprias e navegação

Tipar o card com `OwnUserConnectionDto`, sem alterar consumidores de conexões públicas. Mostrar badge apenas para contagem definida e timestamp somente quando válido. Preferir formatação nativa com o idioma ativo para a data de sincronização; não expandir o helper global em inglês. `REAUTH_REQUIRED` substitui CTA principal por acesso a `/preferences/connections`, via abstração de Link existente que aplica prefixo mobile.

Registrar explicitamente `${prefix}/preferences/:category` antes da rota genérica de preferências, reutilizando `PreferencesPage`; preservar `/preferences`. O destino compartilhado do callback continua `/preferences/connections`. No listener, callbacks de conexão usam `getTabAwareHref(slug)`; manter os tratamentos especiais atuais de `/search` e `/m/auth`, query/hash e fechamento de Browser. Não modificar validação de state, proteção StrictMode nem política sem retry do callback.

Exibir nome e estado nos itens mobile, usando o Web existente como referência. Substituir os switches que só abrem configuração por botões conectar/configurar/reconectar nos dois consumidores; o switch real de autoimportação dentro do modal permanece. Exibir erros de consulta sem confirmar desconexão. Acrescentar CTA `Importar jogos` no gerenciamento e no destino de preferências após conectar quando a conexão estiver autenticada e for elegível. Isso atende tanto conexão por identificador quanto OAuth sem interromper o redirecionamento atual. Configurações de conexão e remoção mantêm validação e tratamento de falhas.

Passar título traduzido e `withSearch={false}` às duas páginas mobile. Alinhar o prefetch Web a `["connections", "own"]`; preservar o mecanismo atual de autenticação do SSR, sem introduzir mudanças de sessão nesta change.

### 6. Traduções e verificação no runner existente

Adicionar chaves e plurais em `packages/locales/src/translations/json/{en,pt-BR}.json`, reutilizando traduções de status já existentes. Regenerar `src/generated/translation-schema.d.ts` com `yarn locales:generate-types`. Traduzir o ramo atual de descoberta em `AggregatedNotification`, incluindo encontrados/importados/pulados/falhas e alt; preservar amostras e navegação. Traduzir tooltip e aria-label de `GameSelectActions`, mantendo o consumidor de DLCs compatível.

Usar Vitest e Testing Library instalados em `apps/mobile` para testes focados dos componentes compartilhados, seguindo os testes existentes que importam `packages/ui` diretamente. Testar interações e payloads na fronteira do serviço, não detalhes privados. Cobrir seleção entre buscas/páginas, ambos os modos de importação, descarte, erro, zero resultados e ausência de chamadas N+1. Estender testes de conexões para aba diferente de home, parâmetros embutidos e CTA. Verificar tradução nos dois idiomas e executar typechecks por workspace; não criar runner ou dependência.

## Risks / Trade-offs

- [Schema local desatualizado] → Obter export atualizado do backend antes de regenerar; não inventar o contrato no cliente.
- [Frontend publicado antes do backend] → Publicar contratos backend primeiro; rollback do frontend é compatível com os endpoints antigos preservados.
- [Seleção fica obsoleta por outra operação ou usuário] → Backend valida atomicamente; mostrar erro, preservar seleção e permitir limpeza/atualização. Não filtrar silenciosamente itens no submit.
- [Total e disponibilidade mudam durante confirmação] → Informar alcance de toda a fonte e apresentar contagens reais do servidor ao concluir.
- [Consulta de conexão própria pode custar descoberta adicional] → Reusar cache existente e não introduzir polling; a remoção de N+1 refere-se aos cards, não à consulta de metadados.
- [Sticky depende do scroll Ionic] → Validar em viewport estreita e aparelho/emulador, com safe area, teclado e tab bar.
- [Estado OAuth é consumido uma vez] → Preservar validação e teste de StrictMode; alterar somente roteamento e acesso ao importador.
- [Workspace já possui alterações fora da change] → Preservar essas alterações; separar falhas preexistentes nos checks da implementação.

## Migration Plan

1. Confirmar backend com endpoints novos e obter seu OpenAPI atualizado.
2. Regenerar wrapper e traduções, implementar consumidores e testes sem remover endpoints antigos.
3. Executar verificações de tipos/lint focadas, regressões e inspeção de rede em Web/Mobile; validar OAuth nativo quando houver ambiente.
4. Publicar frontend após backend; não há migração de dados nem estado de seleção persistido a migrar.
5. Em rollback, reverter frontend/wrapper desta change; operações de importação ou descarte já confirmadas no backend permanecem válidas e não são desfeitas automaticamente.
