# Spec Delta

## Purpose

Define os cinco stories da Retrospectiva anual, sua navegação em tela cheia e a exportação de cada story como imagem pronta para redes sociais, renderizados no cliente a partir da mesma leitura do Recap.

## ADDED Requirements

### Requirement: Visualizador de stories
`/recap/:year/:userId/stories` SHALL mostrar, em tela cheia, os cinco stories na ordem Abertura, Jogo do ano, Calendário, Opinião minoritária e Card final, com cinco barras de progresso, a marca GameNode, um botão de fechar que volta à Retrospectiva, e a indicação "{n} / 5 · toque para seguir". Tocar à direita SHALL avançar e à esquerda voltar.

#### Scenario: Avançar
- **WHEN** o usuário toca na metade direita do story 1
- **THEN** o story 2 aparece e a segunda barra fica ativa

#### Scenario: Fechar
- **WHEN** o usuário aciona o botão de fechar
- **THEN** o app volta para `/recap/{ano}/{userId}`

### Requirement: Dados dos stories
Todos os stories SHALL ler apenas o Recap, o perfil e os jogos já carregados pela Retrospectiva; o story 5 SHALL também ler a cédula e as categorias quando o leitor for o dono logado. Um story cujos dados obrigatórios faltem SHALL ser pulado, e a contagem de stories SHALL refletir os que restam.

#### Scenario: Abertura
- **WHEN** o Recap tem 412 h, 38 jogos distintos e 14 zerados
- **THEN** o story 1 mostra "412 horas de jogo." e "38 jogos, 14 zerados"

#### Scenario: Calendário
- **WHEN** `calendar.topMonth` é março com 71 h e `longestStreak.days` é 23
- **THEN** o story 3 mostra "Março foi o seu mês.", "71 h no mês", "23 dias seguidos" e o calendário de março a partir de `dailyPlaytimeSeconds`

#### Scenario: Recap sem destaques de comunidade
- **WHEN** `communityHighlights` é nulo
- **THEN** o story 4 é pulado e a indicação passa a "{n} / 4"

### Requirement: Card final e atalho para o Awards
O story 5 SHALL mostrar "Seu ano em um card" com @usuário, "{horas} h em {ano}", as capas do top 5, jogos, zerados, mês mais intenso e jogo do ano, e as ações "Compartilhar nos stories" e, só para o dono logado com o Awards do mesmo ano em `voting`, "Votar no Awards {ano}" com "Você jogou {X} dos {Y} indicados a GOTY.".

#### Scenario: Fora da votação
- **WHEN** o Awards do ano está em `results`
- **THEN** o story 5 não mostra a ação de votar

### Requirement: Exportar story como imagem
"Compartilhar" e "Compartilhar nos stories" SHALL exportar o story visível como imagem PNG de 1080×1920 px, igual à prévia, e entregá-la ao compartilhamento do app. "Baixar card", no card da Home, SHALL abrir o visualizador no story final, de onde ele é exportado da mesma forma. Uma falha SHALL mostrar a notificação de erro.

#### Scenario: Tamanho da imagem
- **WHEN** o usuário compartilha o story 2
- **THEN** a imagem gerada tem 1080×1920 px e o mesmo conteúdo da prévia

#### Scenario: Baixar card pela Home
- **WHEN** o usuário aciona "Baixar card" no card "Retrospectiva · Fechada"
- **THEN** o app abre `/recap/{ano}/{userId}/stories` no story final

#### Scenario: Falha no compartilhamento
- **WHEN** o compartilhamento lança um erro
- **THEN** uma notificação de erro é exibida e o visualizador continua aberto

### Requirement: Stories de outra pessoa
Um visitante SHALL poder ver os stories de uma Retrospectiva compartilhada, sem ações exclusivas do dono, com um convite de cadastro no último story.

#### Scenario: Visitante no último story
- **WHEN** um visitante chega ao story 5 de outra pessoa
- **THEN** vê "Crie sua conta e veja seu ano" no lugar da ação de votar
