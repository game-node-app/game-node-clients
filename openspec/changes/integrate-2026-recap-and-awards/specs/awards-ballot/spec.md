# Spec Delta

## Purpose

Define a cédula do Awards no web e no mobile: categorias com progresso, indicados com o contexto de jogo do usuário, voto restrito aos indicados, GOTY pessoal e a versão pública compartilhável da cédula.

## ADDED Requirements

### Requirement: Leitura da cédula
A cédula (`/awards/:year/vote`) SHALL ser montada a partir de uma leitura de `GET /v1/awards/:eventId/ballot` e de `GET /v1/awards/:eventId/categories`, mais uma leitura em lote do repositório de jogos para os indicados exibidos. As categorias SHALL aparecer na ordem retornada pelo servidor, numeradas "Categoria NN de MM" por essa ordem.

#### Scenario: Ordem das categorias
- **WHEN** o servidor retorna 12 categorias com o GOTY global em primeiro e o GOTY pessoal em último
- **THEN** a lista mostra "01 Jogo do Ano" no topo e "12 Seu GOTY pessoal" no fim

#### Scenario: Progresso
- **WHEN** a cédula tem `categoriesVoted: 7` e `categoriesTotal: 12`
- **THEN** o cabeçalho "Sua cédula" mostra "7 de 12" e a barra de progresso proporcional

### Requirement: Estados da linha de categoria
Cada linha da lista SHALL mostrar o estado "Escolhendo" para a categoria ativa, a capa do jogo votado com um check quando há `voteGameId`, e "Votar" quando não há voto. A linha do GOTY pessoal sem voto SHALL mostrar "Sugerido: {jogo}" quando houver `suggestedGameId`.

#### Scenario: Categoria votada
- **WHEN** a categoria "Narrativa" tem `voteGameId: 101`
- **THEN** a linha mostra a capa do jogo 101 e um check

#### Scenario: Sugestão do GOTY pessoal
- **WHEN** o GOTY pessoal tem `voteGameId: null` e `suggestedGameId: 101` ("Nioh 3")
- **THEN** a linha mostra "Sugerido: Nioh 3"

### Requirement: Cartão de indicado com contexto de jogo
Cada indicado SHALL mostrar capa, nome, desenvolvedora e plataformas do jogo e o status do usuário: `played` como "Você jogou · {horas} h · nota {nota}" (nota omitida quando nula), `planned` como "Na sua lista de desejos" (mobile: "Na sua lista") e `not_played` como "Ainda não jogou" (mobile: "Não jogou"). A nota SHALL ser exibida na escala 0–10 (`rating × 2`).

#### Scenario: Jogo jogado com nota
- **WHEN** um indicado tem `status: "played"`, `playtimeSeconds: 309600` e `rating: 4.5`
- **THEN** o cartão mostra "Você jogou · 86 h · nota 9"

#### Scenario: Jogo jogado sem horas registradas
- **WHEN** um indicado tem `status: "played"`, `playtimeSeconds: 0` e `rating: null`
- **THEN** o cartão mostra "Você jogou", sem horas e sem nota

#### Scenario: Jogo planejado
- **WHEN** um indicado tem `status: "planned"`
- **THEN** o cartão mostra "Na sua lista de desejos"

### Requirement: Filtro por jogos jogados
O painel da categoria SHALL oferecer os filtros "Todos · {N}" e "Que joguei · {M}", com N igual ao número de indicados e M igual a `playedNomineesCount`. O filtro SHALL ser aplicado no cliente.

#### Scenario: Filtrar jogados
- **WHEN** a categoria tem 6 indicados, 4 jogados, e o usuário escolhe "Que joguei · 4"
- **THEN** só os 4 indicados com `status: "played"` aparecem

### Requirement: Ordem dos indicados
O jogo votado SHALL aparecer em primeiro na grade, marcado com "Seu voto"; os demais SHALL seguir a ordem retornada pelo servidor. A interface SHALL não apresentar essa ordem como ranking.

#### Scenario: Voto em primeiro
- **WHEN** o usuário votou no indicado de maior `gameId`
- **THEN** esse cartão aparece em primeiro com o selo "Seu voto"

### Requirement: Votar em uma categoria
Ao escolher um indicado, a barra de voto SHALL mostrar "Seu voto em {categoria}" com o jogo escolhido, a ação "Pular por agora" e a ação "Confirmar e ir para {próxima categoria}". Confirmar SHALL enviar `POST /v1/awards/vote`, atualizar a cédula de forma otimista, avançar para a próxima categoria na ordem de exibição e desfazer a mudança em caso de erro.

#### Scenario: Confirmar voto
- **WHEN** o usuário escolhe "Nioh 3" em "Jogo do Ano" e confirma
- **THEN** o cliente envia o voto, a linha "Jogo do Ano" passa a votada, o progresso sobe um e a categoria ativa passa a "Direção de Arte"

#### Scenario: Pular
- **WHEN** o usuário aciona "Pular por agora"
- **THEN** a categoria ativa passa à próxima sem enviar voto

#### Scenario: Erro ao votar
- **WHEN** o servidor recusa o voto
- **THEN** a cédula volta ao estado anterior e uma notificação de erro é exibida

#### Scenario: Última categoria
- **WHEN** o usuário confirma o voto na última categoria
- **THEN** a barra mostra que a cédula está completa e oferece "Compartilhar minha cédula"

### Requirement: Escolha restrita aos indicados
Em eventos com fase de indicações, as categorias comuns SHALL oferecer só os indicados da categoria, sem busca livre. O GOTY pessoal e as categorias sem indicados (eventos sem fase de indicações) SHALL oferecer a busca de jogos elegíveis do ano do evento.

#### Scenario: Categoria comum em 2026
- **WHEN** o usuário abre "Direção de Arte" no evento 2026
- **THEN** só os indicados aparecem e não há campo de busca

#### Scenario: GOTY pessoal
- **WHEN** o usuário abre "Seu GOTY pessoal"
- **THEN** vê a sugestão, se houver, e uma busca de jogos elegíveis, sem grade de seis indicados

#### Scenario: Evento antigo sem indicações
- **WHEN** o usuário abre a cédula do evento 2025, cujas categorias têm `nominees: []`
- **THEN** cada categoria oferece a busca de jogos elegíveis de 2025

### Requirement: Cédula fora da votação
Fora da fase `voting`, a cédula SHALL ser somente leitura: mostra os votos do usuário e não permite votar. Em `results`, SHALL oferecer o link para o resultado.

#### Scenario: Votação encerrada
- **WHEN** o usuário abre a cédula com o evento em `voting_closed`
- **THEN** vê seus votos e nenhuma ação de voto

### Requirement: Cédula exige sessão
Sem sessão, `/awards/:year/vote` SHALL mostrar um convite para entrar e SHALL não chamar `GET /ballot`. Uma resposta 401 SHALL não ser tratada como cédula vazia.

#### Scenario: Visitante na cédula
- **WHEN** um visitante abre `/awards/2026/vote`
- **THEN** vê o convite para entrar e nenhum progresso de cédula

### Requirement: Cédula compartilhada pública
`/awards/:year/nominees/:userId` SHALL mostrar, sem sessão, os votos do usuário por categoria a partir de `GET /v1/awards/:eventId/votes/:userId`, com nomes das categorias, capas dos jogos e o perfil do dono. Visitantes SHALL ver um convite de cadastro; usuários logados, durante a votação, um atalho para a própria cédula.

#### Scenario: Link compartilhado aberto por visitante
- **WHEN** um visitante abre a cédula compartilhada de um usuário com 8 votos
- **THEN** vê as 8 categorias votadas com os jogos escolhidos e a ação de cadastro

#### Scenario: Usuário sem votos
- **WHEN** a leitura de votos retorna `[]`
- **THEN** a página informa que o usuário ainda não votou

### Requirement: Compartilhar a cédula
A ação "Compartilhar minha cédula" SHALL compartilhar o link público da cédula do usuário pelo mecanismo de compartilhamento de cada app.

#### Scenario: Compartilhar no web
- **WHEN** o usuário aciona "Compartilhar minha cédula" no web
- **THEN** o link `/awards/{ano}/nominees/{userId}` é compartilhado ou copiado
