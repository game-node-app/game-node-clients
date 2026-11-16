# Spec Delta

## Purpose

Define a página pública da Retrospectiva anual de um usuário no web e no mobile: as seções do design 2026, os estados por fase, os dados que cada seção lê e o comportamento com Recaps gerados antes da extensão do servidor.

## ADDED Requirements

### Requirement: Leitura da Retrospectiva
`/recap/:year/:userId` SHALL ler o status (`GET /v1/recap/:year/:userId/status`) e, só quando `isRecapCreated` for verdadeiro, o Recap (`GET /v1/recap/:year/:userId`). Nome e avatar do dono SHALL vir da leitura de perfil, e os jogos de uma leitura em lote do repositório de jogos. A página SHALL funcionar sem sessão.

#### Scenario: Recap existente
- **WHEN** alguém abre `/recap/2026/abc` e o status tem `isRecapCreated: true`
- **THEN** a página mostra as seções da Retrospectiva 2026 de `abc`

#### Scenario: Recap não gerado
- **WHEN** o status tem `isRecapCreated: false` e `isRecapEligible: true`
- **THEN** a página informa que a Retrospectiva é gerada diariamente e ainda não está pronta, sem chamar a leitura do Recap

#### Scenario: Usuário não elegível
- **WHEN** o status tem `isRecapCreated: false` e `isRecapEligible: false`
- **THEN** a página informa que não há Retrospectiva para esse ano

### Requirement: Cabeçalho e alternância entre eventos
A página SHALL mostrar a trilha "Eventos {ano} › Retrospectiva" e um seletor "Retrospectiva | Awards". O seletor SHALL levar à tela da fase do Awards do mesmo ano quando houver evento desse ano, e SHALL ficar oculto quando não houver.

#### Scenario: Trocar para o Awards
- **WHEN** o usuário aciona "Awards" com o evento 2026 em `voting`
- **THEN** o app abre `/awards/2026/vote`

### Requirement: Hero
O hero SHALL mostrar "Retrospectiva {ano} · @{usuário}", "{horas} horas de jogo.", uma frase com os jogos (`topGames.length`) e zerados (`totalFinishedGames`), as ações "Compartilhar meu ano" e "Ver em stories", e o gráfico "Seu ano em {N} nós", em que cada jogo de `topGames` é um nó posicionado pelo mês de `firstPlayedAt` e dimensionado pelas horas. Enquanto a fase for `live`, SHALL mostrar o marcador "Hoje · {data}" e "Atualiza todo dia até 31 dez".

#### Scenario: Contagem de jogos distintos
- **WHEN** o Recap tem `totalPlayedGames: 41` e 38 entradas em `topGames`
- **THEN** o hero diz 38 jogos e o gráfico tem 38 nós

#### Scenario: Retrospectiva fechada
- **WHEN** o Recap tem `isFinal: true`
- **THEN** o hero não mostra o marcador "Hoje" nem "Atualiza todo dia"

### Requirement: Jogo do ano e top 5
A seção "Mais jogado em {ano}" SHALL mostrar o primeiro de `topGames` com capa, "{jogo} ficou com {share}% do seu ano.", horas jogadas, data de zerado (`finishedAt`) e nota em 0–10, além do top 5 por horas com plataforma e barra proporcional. Valores ausentes SHALL ser omitidos, sem exibir zero.

#### Scenario: Jogo não zerado e sem nota
- **WHEN** o primeiro jogo tem `finishedAt: null` e `rating: null`
- **THEN** a seção mostra só as horas, sem "zerado" e sem "sua nota"

#### Scenario: Plataforma do top 5
- **WHEN** um jogo do top 5 tem `platformIds: [167]`
- **THEN** a linha mostra a abreviação da plataforma 167 obtida em `playedGames[].platform`

### Requirement: Calendário de jogo
A seção "Calendário de jogo" SHALL mostrar um quadrado por dia UTC do ano a partir de `dailyPlaytimeSeconds`, com intensidade proporcional às horas, o título "{mês} foi o seu mês: {horas} horas." de `calendar.topMonth`, e três cartões: horas do mês, maior sequência (`longestStreak`) e dia da semana (`topWeekday.weekday`) com a parcela de fim de semana (`weekendShare`). Quando `calendar` for nulo, a seção SHALL ser omitida.

#### Scenario: Fim de semana
- **WHEN** `topWeekday` é `{ weekday: 6, share: 0.18 }` e `weekendShare` é 0.31
- **THEN** o cartão mostra "Sábado" e "31% das suas horas caíram no fim de semana"

#### Scenario: Recap antigo
- **WHEN** o Recap tem `dailyPlaytimeSeconds: null` e `calendar: null`
- **THEN** a página não mostra a seção de calendário

#### Scenario: Datas em UTC
- **WHEN** o visitante está em um fuso diferente de UTC
- **THEN** cada quadrado continua correspondendo ao dia UTC do índice no array

### Requirement: Você vs. comunidade
A seção SHALL mostrar o cartão "Opinião minoritária" de `communityHighlights.minority` (nota do usuário, média da comunidade e "Só {beyondShare}% de quem avaliou deu {nota} ou mais") e o cartão "Em sintonia" de `inTune` ("Você e mais {sameRangeCount} pessoas no mesmo tom"), com notas em 0–10. Cartões nulos SHALL ser omitidos, e a seção inteira quando ambos forem nulos.

#### Scenario: Sem destaques
- **WHEN** `communityHighlights` é nulo
- **THEN** os cartões de comunidade não aparecem

### Requirement: Gêneros e plataformas
A seção SHALL mostrar a distribuição de gêneros como porcentagens calculadas a partir de `distributionByGenre[].count` e a divisão de horas por plataforma a partir de `playtimeByPlatform` (`share` e `totalPlaytimeSeconds`). A divisão por plataforma SHALL não misturar horas com contagens.

#### Scenario: Porcentagem de gênero
- **WHEN** os gêneros têm contagens 17, 11 e 22
- **THEN** a barra mostra 34%, 22% e 44%

### Requirement: Backlog
A seção "Backlog" SHALL mostrar "Você adicionou {totalAddedGames} jogos e zerou {totalFinishedGames}.", o crescimento de `backlogGrowth` e uma grade com zerados, abandonados (`totalDroppedGames`) e na fila.

#### Scenario: Backlog sem crescimento
- **WHEN** `backlogGrowth` é 0
- **THEN** a seção omite a frase de crescimento

### Requirement: Atalho para a cédula
Na seção de backlog, para o dono logado da Retrospectiva com o Awards do mesmo ano em `voting`, a página SHALL mostrar o cartão "Awards {ano} · votação aberta" com "Você jogou {X} dos {Y} indicados a GOTY." e a ação "Abrir minha cédula". Em qualquer outro caso o cartão SHALL ser omitido.

#### Scenario: Visitante vendo Retrospectiva alheia
- **WHEN** um visitante abre a Retrospectiva de outra pessoa durante a votação
- **THEN** o cartão do Awards não aparece

### Requirement: Rodapé e marcação da visita
O rodapé SHALL mostrar o período coberto (de 1 jan até a data de geração, ou o ano inteiro quando final) e, para o dono logado, as fontes conectadas lidas das conexões do usuário. Ao abrir a própria Retrospectiva, o cliente SHALL registrar localmente a visita desse ano.

#### Scenario: Visitante
- **WHEN** um visitante abre a Retrospectiva de outra pessoa
- **THEN** o rodapé mostra o período sem a lista de fontes

### Requirement: Compartilhar o ano
"Compartilhar meu ano" SHALL compartilhar o link público da Retrospectiva e "Ver em stories" SHALL abrir os stories do mesmo ano e usuário.

#### Scenario: Ver em stories
- **WHEN** o usuário aciona "Ver em stories" em `/recap/2026/abc`
- **THEN** o app abre `/recap/2026/abc/stories` no primeiro story
