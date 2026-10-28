# Spec Delta

## Purpose

Permitir que usuários revisem, importem ou ignorem a fila de jogos de suas conexões com seleção persistente, baixo custo de rede e resultados confiáveis no Web e Mobile.

## ADDED Requirements

### Requirement: Cliente compatível com os contratos de lote
O cliente gerado SHALL expor o filtro `excludeInLibrary`, os endpoints de importação e status em lote, os DTOs correspondentes, `isInLibrary` nos itens e os metadados de conexões próprias, preservando os contratos anteriores.

#### Scenario: Contratos consumíveis
- **WHEN** um consumidor usa o cliente regenerado
- **THEN** ele pode listar com `excludeInLibrary`, importar por IDs externos ou `importAll=true`, atualizar status em lote e receber `importedCount` e `skippedCount`
- **AND** conexões próprias expõem `unprocessedCount` opcional e `lastSyncedAt` opcional e anulável
- **AND** o endpoint anterior de status individual continua disponível

### Requirement: Listagem sem consultas por card
A fila SHALL solicitar `excludeInLibrary=true` por padrão e renderizar jogos e capas da resposta do importador sem buscar novamente os jogos ou consultar a biblioteca por card. O cache SHALL distinguir consultas com filtros diferentes.

#### Scenario: Página com vinte candidatos
- **WHEN** uma página de vinte candidatos é carregada
- **THEN** a listagem inclui o filtro de biblioteca no servidor
- **AND** nenhuma consulta ao repositório de jogos ou à presença na biblioteca por card é disparada pelo importador

#### Scenario: Filtro explícito
- **WHEN** um consumidor opta por `excludeInLibrary=false`
- **THEN** a consulta envia esse valor e seu cache não reutiliza o resultado do filtro verdadeiro

### Requirement: Seleção persistente por identidade externa
A seleção SHALL preservar IDs de itens externos entre páginas e buscas da mesma fonte. Selecionar ou desmarcar uma página SHALL afetar apenas os itens visíveis; limpar a seleção ou trocar a fonte SHALL remover a seleção correspondente.

#### Scenario: Seleção fora da página atual
- **WHEN** o usuário seleciona um item na busca, limpa a busca, seleciona outro em uma página diferente e importa
- **THEN** ambos os IDs externos são enviados sem depender de reencontrar os itens na página atual

#### Scenario: Seleção da página
- **WHEN** há itens selecionados fora da página e o usuário seleciona todos os itens visíveis
- **THEN** os itens visíveis são adicionados sem apagar ou duplicar seleções anteriores
- **AND** desmarcar a página remove somente os itens dessa página
- **AND** a indicação de página selecionada depende de todos os itens visíveis estarem selecionados, não da igualdade entre contagens

#### Scenario: Vários itens externos para um jogo
- **WHEN** mais de um item da fonte corresponde ao mesmo jogo apresentado
- **THEN** selecionar esse jogo preserva os IDs externos correspondentes para processamento sem confundir IDs externos com IDs de jogo

### Requirement: Importação selecionada em uma operação
A importação selecionada SHALL enviar uma única requisição de lote com IDs externos, coleções e status inicial escolhido entre `PLANNED`, `PLAYING`, `FINISHED`, `ONGOING` e `DROPPED`, com padrão `PLANNED`. O cliente SHALL delegar plataforma e preservação de entradas existentes ao servidor.

#### Scenario: Status e coleções escolhidos
- **WHEN** o usuário importa sua seleção com status e coleções definidos
- **THEN** uma requisição é enviada a `POST /v1/importer/{source}/import` com `externalGameIds`, `status` e `collectionIds`
- **AND** `importAll` é omitido e não há chamadas individuais para criar entradas ou marcar processado

#### Scenario: Entrada criada por outro fluxo
- **WHEN** uma entrada selecionada já está na biblioteca na execução do lote
- **THEN** o cliente usa a resposta do servidor sem tentar atualizar essa entrada
- **AND** o sucesso informa os importados e, quando maior que zero, quantos foram pulados por já estarem na biblioteca

### Requirement: Importação de toda a fonte com confirmação
O usuário SHALL poder importar toda a fila da fonte com confirmação que explicita alcance, status e coleções. Essa ação SHALL ser independente de página, seleção e busca e enviar somente `importAll=true` como modo de seleção.

#### Scenario: Confirmar durante uma busca
- **WHEN** o usuário abre importar todos enquanto uma busca está ativa
- **THEN** a confirmação informa que a ação alcança toda a fonte e apresenta o total conhecido sem filtro de busca
- **AND** confirmar envia `importAll=true`, status e coleções, sem `externalGameIds` nem `search`

#### Scenario: Cancelar ou concluir fila concorrente
- **WHEN** o usuário cancela a confirmação
- **THEN** nenhuma importação é enviada
- **WHEN** confirma e o servidor retorna zero importados e zero pulados
- **THEN** o resultado é apresentado como conclusão válida e os dados são atualizados

### Requirement: Ignorar seleção em lote
O usuário SHALL poder ignorar a seleção com uma requisição de status em lote, incluindo IDs externos, fonte e status `ignored`.

#### Scenario: Ignorar entre páginas
- **WHEN** o usuário ignora itens selecionados em páginas distintas
- **THEN** todos os IDs são enviados em uma chamada a `POST /v1/importer/status/batch`
- **AND** o sucesso é notificado, a seleção é limpa e os itens deixam a fila após atualização

### Requirement: Ações acessíveis e consistência após operações
Com seleção não vazia, a tela SHALL apresentar contador e ações de limpar, ignorar e importar em barra sticky acessível no Web e Mobile. Operações concorrentes e reenvios durante processamento SHALL ser bloqueados; falhas SHALL manter a seleção para recuperação.

#### Scenario: Operação em andamento e falha
- **WHEN** uma importação ou descarte está pendente
- **THEN** as ações conflitantes são desabilitadas e há indicação de processamento
- **WHEN** a operação falha
- **THEN** o erro é exibido, o indicador termina e a seleção permanece disponível

#### Scenario: Atualizar informações após sucesso
- **WHEN** um lote conclui com sucesso
- **THEN** a seleção é limpa e os caches de fila, conexões próprias e entradas da biblioteca são invalidados
- **AND** a página atual é reposicionada se ficou fora do intervalo disponível
- **AND** a barra não cobre controles da paginação nem a navegação inferior mobile

### Requirement: Estados vazios e erros distintos
O frontend SHALL tratar somente o 404 da listagem do importador como fila vazia. Busca sem resultados, primeira sincronização e fila já processada SHALL ter mensagens distintas, preservando erros reais de conexão e do provedor.

#### Scenario: Busca sem correspondência
- **WHEN** há busca ativa e a listagem está vazia
- **THEN** é exibido que nenhum jogo foi encontrado para a busca
- **AND** a busca continua acessível para ser alterada ou limpa

#### Scenario: Fonte sem candidatos
- **WHEN** não há busca e a listagem retorna 404 ou lista vazia
- **THEN** a consulta é representada com lista vazia e paginação zerada
- **AND** sem data de descoberta conhecida a mensagem informa que a primeira sincronização pode estar em andamento
- **AND** com descoberta bem-sucedida conhecida a mensagem informa que os jogos encontrados já foram importados ou processados
- **AND** a dica de privacidade aparece como orientação secundária

#### Scenario: Falha real
- **WHEN** a listagem retorna erro diferente de 404 ou a consulta de conexão falha
- **THEN** a falha permanece visível e não é apresentada como confirmação de fila concluída

### Requirement: Textos de importação localizados
O fluxo SHALL apresentar validação, seleção, ações de lote, contagens, estados vazios, textos acessíveis e notificações de descoberta em inglês e português do Brasil, preservando contagens e amostras de jogos retornadas pelo servidor.

#### Scenario: Notificação com resultados mistos
- **WHEN** a descoberta informa jogos encontrados, importados, pulados ou com falha
- **THEN** a notificação usa o idioma ativo, interpola as contagens e preserva a amostra e o destino do importador

#### Scenario: Seleção compartilhada
- **WHEN** o controle de seleção é usado no importador ou na seleção de DLCs
- **THEN** seu rótulo acessível e tooltip são traduzidos sem alterar o comportamento de seleção do consumidor
