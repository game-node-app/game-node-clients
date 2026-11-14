# Spec Delta

## Purpose

Apresentar a inbox de notificações do usuário no web (popover do sino e página completa) e no mobile (página de notificações) com o mesmo visual. Isso inclui itens por tipo, abas Todas/Não lidas, agrupamento por data e confirmação de leitura.

## ADDED Requirements

### Requirement: Layout do item de notificação
Cada notificação SHALL aparecer em uma linha com padding de 12 px e raio de 8 px. A linha tem um elemento à esquerda de 36 px, a primeira linha com o nome em semibold de 14 px e o horário relativo em 12 px `#ADADAD`, a mensagem em 14 px, uma ação opcional e, à direita, um ponto laranja quando não lida. No hover, o fundo fica `#222222`.

#### Scenario: Notificação não lida
- **WHEN** um item tem `readVersion < version`
- **THEN** a mensagem aparece em branco e o ponto laranja aparece à direita
- **AND** o item informa o estado não lido para leitores de tela

#### Scenario: Notificação lida
- **WHEN** um item tem `readVersion >= version`
- **THEN** a mensagem aparece em `#ADADAD` e não há ponto

#### Scenario: Mensagem longa
- **WHEN** a mensagem passa de duas linhas
- **THEN** ela é truncada com reticências após duas linhas, sem rolagem horizontal

### Requirement: Conteúdo por tipo de notificação
O item SHALL montar nome, mensagem e elemento à esquerda a partir dos campos materializados do item (`type`, `actors`, `actorCount`, `preview`, `target`), com todos os textos traduzidos pelo idioma do app, sem requisições extras por item para montar o texto.

#### Scenario: Interações sociais
- **WHEN** o tipo é `profile.followed`, `content.liked`, `comment.created` ou `comment.replied`
- **THEN** o elemento à esquerda é o avatar circular do primeiro ator, montado a partir de `actors[0].avatar` (`filename` e `extension`), sem buscar o perfil do ator
- **AND** o nome é o nome de usuário do primeiro ator, seguido de "e mais N" quando `actorCount` for maior que 1
- **AND** a mensagem descreve a ação no singular ou plural conforme `actorCount`, cita o jogo quando o alvo é uma atividade com jogo e cita o texto do comentário entre aspas quando disponível

#### Scenario: Atividade com capa de jogo
- **WHEN** o tipo é `content.liked`, `comment.created` ou `comment.replied`, o alvo é uma atividade e `target.game.coverUrl` não é nulo
- **THEN** o elemento à esquerda é a capa do jogo (36 × 42 px), carregada de `coverUrl` no tamanho adequado, no lugar do avatar

#### Scenario: Alvo sem capa
- **WHEN** o alvo é uma atividade, mas `target.game` está ausente ou `target.game.coverUrl` é nulo
- **THEN** o elemento à esquerda volta a ser o avatar do primeiro ator

#### Scenario: Conquista desbloqueada
- **WHEN** o tipo é `achievement.unlocked`
- **THEN** o elemento à esquerda é um ícone de troféu laranja sobre fundo laranja translúcido, o nome é "Conquista" e a mensagem cita o nome da conquista e o nível

#### Scenario: Descoberta de importação
- **WHEN** o tipo é `import.discovery-completed`
- **THEN** o elemento à esquerda é um ícone de download no mesmo estilo, o nome é "Descoberta concluída" e a mensagem informa quantos jogos foram encontrados e de qual conexão, com as contagens de importados, já na biblioteca e com falha quando forem maiores que zero

#### Scenario: Conexão precisa ser refeita
- **WHEN** o tipo é `connection.reauth-required`
- **THEN** o elemento à esquerda é um ícone no mesmo estilo, o nome identifica a conexão e a mensagem pede para reconectá-la

#### Scenario: Moderação
- **WHEN** o tipo é `moderation.applied`
- **THEN** o elemento à esquerda é um ícone de alerta, o nome é o aviso traduzido para `preview.action` (aviso, suspensão ou banimento) e a mensagem inclui o motivo quando houver, que o conteúdo foi removido e como contestar

#### Scenario: Tipo desconhecido
- **WHEN** o tipo não é nenhum dos anteriores
- **THEN** o item usa o avatar do primeiro ator, se houver, e `preview.text` como mensagem, sem quebrar a lista

### Requirement: Horário relativo
O item SHALL mostrar há quanto tempo o evento mais recente (`lastEventAt`) aconteceu, em forma curta e traduzida: minutos ("2 min"), horas ("1 h"), dias ("2 d"), ou a data curta para eventos com mais de 7 dias.

#### Scenario: Evento recente
- **WHEN** `lastEventAt` foi há 2 minutos
- **THEN** o horário mostra "2 min"

#### Scenario: Evento antigo
- **WHEN** `lastEventAt` foi há 20 dias
- **THEN** o horário mostra a data curta no idioma do app

### Requirement: Abrir uma notificação
Acionar um item SHALL confirmar a leitura dele quando estiver não lido e navegar para o alvo tipado, como definido em `notification-inbox`. No web, SHALL também fechar o popover.

#### Scenario: Clique em item não lido
- **WHEN** o usuário aciona um item não lido com alvo de post
- **THEN** o cliente confirma a leitura daquele item com sua `version`
- **AND** navega para o post

#### Scenario: Acesso por teclado
- **WHEN** um item recebe foco e o usuário pressiona Enter
- **THEN** o comportamento é o mesmo do clique

### Requirement: Ação dentro da notificação
O item SHALL aceitar uma ação opcional, mostrada abaixo da mensagem como botão contornado de 28 px. Acioná-la não SHALL abrir o alvo da notificação nem confirmar a leitura do item. O único tipo com ação SHALL ser `profile.followed`, que mostra "Seguir de volta" quando o primeiro ator tem `isFollowedByRecipient === false`. O estado vem da inbox, sem consulta de follow por item.

#### Scenario: Seguidor que o usuário ainda não segue
- **WHEN** chega um `profile.followed` cujo primeiro ator tem `isFollowedByRecipient` igual a `false`
- **THEN** o item mostra o botão "Seguir de volta"

#### Scenario: Seguidor que o usuário já segue
- **WHEN** o primeiro ator tem `isFollowedByRecipient` igual a `true` ou o campo está ausente
- **THEN** o item aparece sem o botão

#### Scenario: Seguir de volta
- **WHEN** o usuário aciona "Seguir de volta"
- **THEN** o cliente segue o ator, o botão mostra carregamento e some depois do sucesso, sem navegar para o perfil
- **AND** a inbox em cache passa a ter `isFollowedByRecipient = true` para esse ator, e o status de follow do ator é invalidado

#### Scenario: Falha ao seguir
- **WHEN** a requisição de follow falha
- **THEN** o usuário vê uma notificação de erro e o botão volta a aparecer

### Requirement: Abas Todas e Não lidas
A lista SHALL ter as abas "Todas" e "Não lidas". "Não lidas" mostra um contador laranja com o `unreadCount` da inbox quando for maior que zero. Cada aba SHALL paginar pelo servidor com seu próprio filtro (`filter=all` ou `filter=unread`) e seu próprio cursor.

#### Scenario: Filtrar não lidas
- **WHEN** o usuário seleciona "Não lidas"
- **THEN** o cliente busca a inbox com `filter=unread` e mostra os itens retornados, e a aba fica selecionada (fundo `#222222`, texto branco)
- **AND** ao chegar ao fim, carrega mais páginas com o cursor dessa aba enquanto `pagination.hasMore` for verdadeiro

#### Scenario: Item lido na aba Não lidas
- **WHEN** o usuário abre um item na aba "Não lidas"
- **THEN** o item passa a aparecer como lido até a próxima atualização da lista, sem sumir na hora

#### Scenario: Página vazia com mais resultados
- **WHEN** o servidor devolve uma página vazia com `pagination.hasMore` verdadeiro
- **THEN** a lista continua buscando a próxima página em vez de mostrar o estado vazio

#### Scenario: Nenhuma não lida
- **WHEN** a aba "Não lidas" está selecionada e o servidor não devolve itens nem mais páginas
- **THEN** aparece a mensagem de vazio própria da aba

### Requirement: Agrupamento por data
A lista SHALL agrupar os itens por `lastEventAt`, na ordem recebida, sob os títulos "Hoje", "Esta semana" (últimos 7 dias, sem hoje) e "Mais antigas", omitindo grupos vazios.

#### Scenario: Itens de hoje e da semana
- **WHEN** a lista tem itens de hoje e de três dias atrás
- **THEN** aparece "Hoje" com os itens de hoje, depois "Esta semana" com os demais

### Requirement: Marcar todas como lidas
A lista SHALL oferecer "Marcar todas como lidas", que marca a inbox inteira como lida com uma única chamada a `PATCH /v1/notifications/read-all`, enviando como `before` o `lastEventAt` do item mais recente carregado. Assim, o que chegou depois do que o usuário viu continua não lido. A ação SHALL ficar desabilitada quando `unreadCount` for zero e enquanto a chamada estiver em andamento.

#### Scenario: Marcar todas
- **WHEN** `unreadCount` é 30, há 10 itens carregados e o usuário aciona "Marcar todas como lidas"
- **THEN** o cliente faz uma única chamada a `read-all` com `before` igual ao maior `lastEventAt` entre os itens carregados nas duas abas
- **AND** os itens carregados aparecem como lidos na hora, e o contador assume o `unreadCount` retornado

#### Scenario: Notificação nova durante a ação
- **WHEN** uma notificação chega depois do `before` enviado
- **THEN** ela continua não lida e entra no contador retornado

#### Scenario: Falha
- **WHEN** a chamada falha
- **THEN** o usuário vê uma notificação de erro, e os itens e o contador voltam ao estado anterior

### Requirement: Popover de notificações no web
O sino da Topbar SHALL abrir um popover de 400 × 556 px. Ele tem cabeçalho ("Notificações", "Marcar todas como lidas" em laranja e engrenagem que abre o modal de configurações na aba `notifications`), abas, divisor, lista rolável e rodapé "Ver todas", que leva a `/notifications`.

#### Scenario: Abrir e fechar
- **WHEN** o usuário aciona o sino
- **THEN** o popover abre alinhado à direita, abaixo do sino
- **AND** fecha com Esc, clique fora ou ao navegar

#### Scenario: Ver todas
- **WHEN** o usuário aciona "Ver todas"
- **THEN** o popover fecha e o app abre `/notifications`

#### Scenario: Estados de carregamento e vazio
- **WHEN** a inbox está carregando ou vazia
- **THEN** o popover mostra esqueletos de item ou a mensagem traduzida de inbox vazia, sem mudar de tamanho

### Requirement: Página completa de notificações
O web SHALL ter a rota autenticada `/notifications` e o mobile SHALL manter sua página de notificações, ambas com cabeçalho, abas, lista agrupada e carregamento de mais páginas. No mobile, a página SHALL manter o gesto de puxar para atualizar.

#### Scenario: Página web
- **WHEN** um usuário autenticado abre `/notifications`
- **THEN** vê o título, "Marcar todas como lidas", as abas e a lista agrupada
- **AND** ao chegar ao fim, pode carregar mais páginas enquanto `pagination.hasMore` for verdadeiro

#### Scenario: Visitante
- **WHEN** um visitante abre `/notifications`
- **THEN** é levado ao fluxo de login, como nas demais rotas autenticadas

#### Scenario: Puxar para atualizar no mobile
- **WHEN** o usuário puxa a lista para baixo na página de notificações do mobile
- **THEN** a inbox é recarregada e o indicador de atualização some ao terminar
