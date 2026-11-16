# Spec Delta

## Purpose

Define como os eventos sazonais do GameNode (Awards e Retrospectiva) aparecem nas entradas do produto: cards da Home, Dock web e menu lateral mobile, conforme a fase de cada evento, os períodos mortos, o fim da temporada e o estado de login.

## ADDED Requirements

### Requirement: Fase do Awards vinda do servidor
Os clientes SHALL determinar o evento corrente do Awards e sua fase exclusivamente por `GET /v1/awards/events/current` (`phase`). Uma resposta 404 SHALL significar "nenhum evento começou" e não exibir nenhuma entrada do Awards. Nenhuma superfície SHALL inferir o ano ou a fase a partir do mês corrente ou de `isVotable`.

#### Scenario: Evento em indicações
- **WHEN** `events/current` retorna o evento 2026 com `phase: "nominations"`
- **THEN** Home, Dock e menu mobile tratam o Awards 2026 como em indicações

#### Scenario: Nenhum evento começou
- **WHEN** `events/current` responde 404
- **THEN** nenhuma entrada do Awards é exibida e nenhum erro é mostrado ao usuário

#### Scenario: Evento de um ano anterior ainda corrente
- **WHEN** em 10 jan 2027 `events/current` retorna o evento 2026 com `phase: "results"`
- **THEN** as entradas tratam o Awards 2026 como em resultado, sem trocar para 2027

### Requirement: Janela da Retrospectiva vinda do servidor
Os clientes SHALL determinar o ano e a fase da Retrospectiva por `GET /v1/recap/current` e, para o usuário logado, por `GET /v1/recap/:year/:userId/status`. O Recap SHALL ser lido só quando `isRecapCreated` for verdadeiro.

#### Scenario: Retrospectiva aberta
- **WHEN** `recap/current` retorna `{ year: 2026, phase: "live" }` e o status do usuário tem `isRecapCreated: true`
- **THEN** as entradas tratam a Retrospectiva 2026 como "atualizando" e leem o Recap 2026 do usuário

#### Scenario: Antes da abertura
- **WHEN** em 10 nov 2026 `recap/current` retorna `{ year: 2025, phase: "closed" }` e o fim da temporada 2025 já passou
- **THEN** nenhuma entrada da Retrospectiva é exibida

#### Scenario: Recap ainda não gerado
- **WHEN** a fase é `live` e o status tem `isRecapCreated: false`
- **THEN** a Home não exibe o card da Retrospectiva e o cliente não chama a leitura do Recap

### Requirement: Fim da temporada
A temporada de cada evento SHALL terminar em um instante calculado a partir das datas do servidor: para o Awards, 31 dias após `resultsDate`; para a Retrospectiva fechada, 27 dias após `closesAt`. Depois desse instante nenhuma superfície de entrada SHALL exibir o evento.

#### Scenario: Awards depois do fim da temporada
- **WHEN** o evento 2026 tem `resultsDate` em 27 dez 2026 e hoje é 28 jan 2027
- **THEN** a Home não exibe o card do Awards e o Dock não exibe "Awards 2026"

#### Scenario: Retrospectiva depois do fim da temporada
- **WHEN** `recap/current` retorna 2026 `closed` com `closesAt` em 31 dez 2026 e hoje é 28 jan 2027
- **THEN** a Home não exibe o card da Retrospectiva e o Dock volta a exibir "Wrapped"

### Requirement: Seção de eventos na Home
A Home web e mobile SHALL exibir, logo após a busca e antes de "Em alta", uma seção única com 0, 1 ou 2 cards de evento. Com um card, o web SHALL usar o formato Wide; com dois, Half + Half, com o Awards primeiro. O mobile SHALL exibir os cards em carrossel com espiada do próximo. Sem cards, a seção SHALL ser omitida.

#### Scenario: Dois eventos ativos no web
- **WHEN** o Awards está em `voting` com cédula incompleta e a Retrospectiva está `live` com Recap criado
- **THEN** a Home web mostra o card "Awards · Votação" e o card "Retrospectiva · Atualizando" lado a lado

#### Scenario: Um evento ativo
- **WHEN** o Awards está em `nominations_closed` e a Retrospectiva está `live` com Recap criado
- **THEN** a Home web mostra só o card "Retrospectiva · Atualizando" no formato Wide

#### Scenario: Nenhum evento
- **WHEN** nenhum card se aplica
- **THEN** a Home não renderiza a seção nem espaço vazio

#### Scenario: Mobile
- **WHEN** dois cards se aplicam no app mobile
- **THEN** eles aparecem em um carrossel horizontal com indicador de página

### Requirement: Card do Awards por fase
O card do Awards SHALL existir só quando há algo a fazer: `nominations` (card "Indicações"), `voting` com cédula incompleta ou visitante (card "Votação") e `results` até o fim da temporada (card "Resultado"). Em `upcoming`, `nominations_closed` e `voting_closed` SHALL não haver card.

#### Scenario: Indicações
- **WHEN** a fase é `nominations` e faltam menos de 24 h para `nominationEndDate`
- **THEN** o card mostra "Awards {ano} · Indicações abertas", o chip "Fecha amanhã", a linha do tempo Indicações/Votação/Resultado com as datas do evento e as ações "Indicar jogos" e "Ver categorias", que levam à tela de indicações

#### Scenario: Votação com cédula incompleta
- **WHEN** a fase é `voting`, a cédula tem `categoriesVoted: 7` e `categoriesTotal: 12`, e o GOTY global tem 6 indicados dos quais 4 jogados
- **THEN** o card mostra "Faltam 5 categorias na sua cédula", "Você jogou 4 dos 6 indicados a Jogo do Ano", a barra "7 de 12 categorias" e as ações "Continuar votando" e "Ver cédula"

#### Scenario: Cédula completa
- **WHEN** a fase é `voting` e `categoriesVoted === categoriesTotal`
- **THEN** a Home não mostra o card do Awards

#### Scenario: Resultado
- **WHEN** a fase é `results`, o GOTY global tem vencedor e o placar do usuário tem `hits: 7` e `scorable: 11`
- **THEN** o card mostra "{vencedor} é o Jogo do Ano", o total de votos, "Você acertou 7 de 11" e as ações "Ver vencedores" e "Compartilhar placar"

#### Scenario: Período morto
- **WHEN** a fase é `nominations_closed` ou `voting_closed`
- **THEN** a Home não mostra o card do Awards

### Requirement: Card da Retrospectiva por fase
O card da Retrospectiva SHALL existir para o usuário logado com Recap criado: "Atualizando" na fase `live` e "Fechada" na fase `closed` até o fim da temporada. Os números SHALL vir do Recap: horas de `totalPlaytimeSeconds`, jogos de `topGames.length`, barras mensais de `calendar.monthlyPlaytimeSeconds` e participação do jogo mais jogado de `topGames[0].share`.

#### Scenario: Atualizando
- **WHEN** a fase é `live` e o Recap tem 412 h, 38 entradas em `topGames` e o primeiro jogo com `share: 0.21`
- **THEN** o card mostra "412 h", "em 38 jogos · até hoje", as 12 barras mensais, a frase com o jogo e "21%" e as ações "Ver minha retrospectiva" e "Compartilhar"

#### Scenario: Fechada
- **WHEN** a fase é `closed` e o Recap tem `isFinal: true` e 14 jogos zerados
- **THEN** o card mostra "Seu {ano} fechou. Bora compartilhar?", o resumo em horas, jogos e zerados e as ações "Ver stories" e "Baixar card"

#### Scenario: Recap antigo sem calendário
- **WHEN** o Recap tem `calendar: null`
- **THEN** o card omite as barras mensais e mantém os demais números

### Requirement: Entradas para visitantes
Sem sessão, os clientes SHALL exibir apenas dados públicos: o card do Awards com a ação "Entrar para votar" ou "Entrar para indicar" no lugar das ações autenticadas e, na fase `live`, um card teaser da Retrospectiva com "Crie sua conta e veja seu ano". Nenhuma leitura autenticada SHALL ser chamada sem sessão.

#### Scenario: Visitante durante a votação
- **WHEN** um visitante abre a Home com o Awards em `voting`
- **THEN** vê o card de votação sem progresso de cédula e com a ação "Entrar para votar", e o cliente não chama `GET /ballot`

#### Scenario: Visitante durante a Retrospectiva
- **WHEN** um visitante abre a Home com a Retrospectiva `live`
- **THEN** vê o teaser com a ação de cadastro e nenhum número pessoal

### Requirement: Entradas no Dock web
Durante a temporada, o Dock web SHALL exibir "Awards {ano}" no grupo "Descobrir", logo após "Início", e SHALL substituir "Wrapped" por "Retrospectiva" no grupo "Seu espaço" enquanto a Retrospectiva estiver na temporada e houver Recap criado. Fora da temporada o Dock SHALL voltar à lista normal.

#### Scenario: Awards ao vivo
- **WHEN** a fase do Awards é `nominations` ou `voting`
- **THEN** o item "Awards {ano}" exibe o badge "Ao vivo" e leva à tela da fase

#### Scenario: Awards com resultado
- **WHEN** a fase é `results` antes do fim da temporada
- **THEN** o item exibe o badge "Novo" e leva ao resultado

#### Scenario: Awards em período morto
- **WHEN** a fase é `nominations_closed` ou `voting_closed`
- **THEN** o item continua visível, sem badge

#### Scenario: Retrospectiva nova
- **WHEN** a Retrospectiva está `live`, o usuário tem Recap criado e nunca abriu a página da Retrospectiva desse ano
- **THEN** "Retrospectiva" aparece no lugar de "Wrapped" com o badge "Nova", e o badge some depois da primeira visita a `/recap/{ano}/{userId}`

#### Scenario: Dock recolhido
- **WHEN** o Dock está recolhido
- **THEN** os badges aparecem como ponto sobre o ícone, como nos demais itens

### Requirement: Entradas no menu lateral mobile
O menu lateral mobile SHALL aplicar as mesmas regras de visibilidade, destino e badge do Dock web para o Awards e a Retrospectiva.

#### Scenario: Menu durante a votação
- **WHEN** o usuário abre o menu lateral com o Awards em `voting`
- **THEN** vê "Awards {ano}" com o badge "Ao vivo", que abre a cédula

### Requirement: Destino por fase do Awards
A rota `/awards/:year` e toda entrada do Awards SHALL levar à tela correspondente à fase: indicações em `nominations`, cédula em `voting` e `voting_closed`, lista de categorias em `nominations_closed` e resultado em `results`.

#### Scenario: Redirecionamento na votação
- **WHEN** alguém abre `/awards/2026` com o evento em `voting`
- **THEN** o app substitui a rota por `/awards/2026/vote`

#### Scenario: Redirecionamento no resultado
- **WHEN** alguém abre `/awards/2026` com o evento em `results`
- **THEN** o app substitui a rota por `/awards/2026/result`
