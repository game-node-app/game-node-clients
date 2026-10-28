# Spec Delta

## Purpose

Permitir que usuários identifiquem suas contas conectadas, conheçam a disponibilidade de importação e concluam configuração ou reconexão sem perder o contexto de navegação no Web e Mobile.

## ADDED Requirements

### Requirement: Disponibilidade conhecida por plataforma
Os cards de plataformas elegíveis SHALL distinguir contagem positiva, zero conhecido e disponibilidade desconhecida, apresentando última sincronização apenas quando fornecida pela conexão própria.

#### Scenario: Contagem conhecida
- **WHEN** a conexão informa `unprocessedCount` maior que zero
- **THEN** o card exibe a quantidade de jogos disponíveis
- **WHEN** a contagem é zero
- **THEN** o card informa que está tudo em dia com zero pendentes

#### Scenario: Metadados ausentes
- **WHEN** `unprocessedCount` está ausente
- **THEN** o card não apresenta zero nem afirma que a fila está concluída
- **AND** `lastSyncedAt` ausente ou nulo não gera data fictícia
- **WHEN** `lastSyncedAt` é informado
- **THEN** a última sincronização é exibida discretamente no idioma ativo

### Requirement: Reconexão necessária tem ação explícita
Uma conexão com `REAUTH_REQUIRED` SHALL exibir alerta e uma ação acessível para reconectar no lugar da ação principal que abre uma fila potencialmente desatualizada.

#### Scenario: Abrir reconexão
- **WHEN** o usuário aciona reconectar no card
- **THEN** ele chega à configuração da conexão no Web ou na aba mobile atual
- **AND** pode iniciar o fluxo de autenticação existente preservando suas preferências

### Requirement: Identidade e controles claros nas preferências
As preferências Web e Mobile SHALL mostrar `sourceUsername` quando disponível e estado conectado, desconectado ou reconexão necessária. Abrir configuração SHALL ser uma ação explícita, sem aparentar ativar ou desativar uma conexão imediatamente.

#### Scenario: Gerenciar conta existente
- **WHEN** o usuário consulta uma conexão existente
- **THEN** vê o nome da conta e seu estado
- **AND** uma ação de configurar ou reconectar abre o modal de gerenciamento
- **AND** abrir ou fechar esse modal não desconecta nem altera a conta

#### Scenario: Conta ausente ou consulta com erro
- **WHEN** a conexão está ausente
- **THEN** é oferecida uma ação de conectar
- **WHEN** sua consulta falha por erro diferente da ausência de conexão
- **THEN** o erro não é apresentado como estado desconectado confirmado

### Requirement: Acesso ao importador após conectar
Conexões elegíveis e autenticadas SHALL oferecer CTA de importar jogos na configuração ou destino pós-conexão, com navegação para a fila da fonte correspondente.

#### Scenario: Configuração ou OAuth concluído
- **WHEN** o usuário conclui uma conexão elegível por identificador público ou autenticação redirecionada
- **THEN** o destino pós-conexão ou modal oferece uma ação de importar jogos
- **AND** essa ação abre a fonte correta, preservando a aba no Mobile
- **AND** conexões não elegíveis ou exigindo reconexão não recebem CTA de importação ativa

### Requirement: Preferências de conexões navegáveis no Mobile
A rota de preferências de conexões SHALL ser válida em todas as abas mobile, mantendo compatibilidade com a tela unificada de preferências e com os links compartilhados do Web.

#### Scenario: Configurar a partir do importador
- **WHEN** o usuário segue `/preferences/connections` a partir do importador ou callback mobile
- **THEN** a tela de preferências é exibida na aba atual sem rota inexistente

### Requirement: Callback OAuth preserva aba e parâmetros
O deep link de callback SHALL navegar na aba mobile ativa preservando integralmente caminho, query e fragmento, fechar o navegador externo e manter a validação e o consumo único do estado OAuth.

#### Scenario: Callback fora da aba inicial
- **WHEN** um callback Steam ou Xbox chega enquanto outra aba está ativa
- **THEN** o destino usa o prefixo dessa aba e mantém parâmetros, inclusive URLs de retorno embutidas
- **AND** o navegador externo é fechado e o listener é removido ao desmontar

#### Scenario: Estado inválido ou falha
- **WHEN** o callback contém estado ausente ou duplicado, cancelamento ou provedor incompatível
- **THEN** o erro é exibido sem completar autenticação
- **WHEN** o servidor rejeita o callback
- **THEN** não há reenvio automático do estado de uso único e existe retorno válido às preferências

### Requirement: Páginas de importação mobile identificadas
As páginas mobile de plataformas e de fila SHALL apresentar título traduzido do importador e desabilitar a busca global do cabeçalho, preservando a busca própria da fila.

#### Scenario: Abrir uma fonte
- **WHEN** o usuário abre o importador mobile por fonte
- **THEN** vê o título do importador e uma única busca de jogos na tela

### Requirement: Cache de conexões compatível entre servidor e cliente
O prefetch Web do importador SHALL alimentar o mesmo cache de conexões próprias utilizado na renderização do cliente.

#### Scenario: Hidratação do importador
- **WHEN** o servidor fornece conexões próprias pré-carregadas
- **THEN** a página cliente reconhece esses dados como resultado da sua consulta de conexões próprias
- **AND** uma atualização de conexões próprias invalida também esse conjunto de dados
