# Spec Delta

## Purpose

Define a tela pública de resultado do Awards no web e no mobile, com o Jogo do Ano em destaque, a comparação entre todos os votos e os votos de quem jogou, o placar pessoal e seu compartilhamento.

## ADDED Requirements

### Requirement: Resultado só com resultados calculados
`/awards/:year/result` SHALL ler `GET /v1/awards/:eventId/results`. Quando a lista estiver vazia ou a fase não for `results`, a tela SHALL informar a data de `resultsDate` em vez de mostrar vencedores.

#### Scenario: Resultado ainda não saiu
- **WHEN** alguém abre o resultado com o evento em `voting_closed` e a leitura retorna `[]`
- **THEN** a tela informa que o resultado sai em `resultsDate` e não mostra vencedores

### Requirement: Jogo do Ano em destaque
A tela SHALL destacar o resultado cuja `category.isGOTY` é verdadeira: capa do vencedor (`position = 1`), "Resultado · Jogo do Ano · {totalVotesCount} votos", o título "{vencedor} é o Jogo do Ano." e a lista de jogos votados com a porcentagem de cada um.

#### Scenario: Destaque do GOTY
- **WHEN** o resultado do GOTY tem 4812 votos e o primeiro colocado é "Resident Evil Requiem" com `votesPercentage: 0.31`
- **THEN** a tela mostra "Resident Evil Requiem é o Jogo do Ano.", "4.812 votos" e "31%" na primeira linha

### Requirement: Todos os votos e só quem jogou
A lista de votos SHALL alternar entre "Todos os votos" (`votesPercentage`) e "Só quem jogou" (`playedVotesPercentage`). Abaixo da lista, uma nota SHALL comparar os dois primeiros colocados entre quem jogou. Quando o resultado não tiver votos de quem jogou (`totalPlayedVotesCount` nulo ou zero), a alternância e a nota SHALL ser omitidas.

#### Scenario: Alternar para quem jogou
- **WHEN** o usuário escolhe "Só quem jogou"
- **THEN** as barras e porcentagens passam a usar `playedVotesPercentage` e a ordem reflete esses valores

#### Scenario: Nota de disputa
- **WHEN** entre quem jogou o primeiro tem 29% e o segundo 27%
- **THEN** a nota mostra "Contando só quem jogou, a disputa aperta: {primeiro} 29%, {segundo} 27%."

#### Scenario: Evento antigo
- **WHEN** o resultado do evento 2025 tem `totalPlayedVotesCount: 0`
- **THEN** só "Todos os votos" é exibido, sem nota

### Requirement: Vencedores por categoria
Abaixo do destaque, a tela SHALL listar o vencedor de cada categoria não pessoal, ordenadas por `category.order`, e um cartão final do GOTY pessoal.

#### Scenario: Ordem das categorias
- **WHEN** o servidor retorna os resultados ordenados por id
- **THEN** a tela os exibe pela ordem de `category.order`

### Requirement: Placar pessoal
Para um usuário logado, ou para o usuário indicado no link compartilhado, a tela SHALL ler `GET /v1/awards/:eventId/scoreboard/:userId` e mostrar "Você acertou {hits} de {scorable} categorias." e, em cada vencedor, o chip "Seu voto venceu" (`hit`), "Seu voto: {jogo}" (`miss`) ou "Você não votou" (`not_voted`). O total SHALL vir da resposta, nunca de um número fixo.

#### Scenario: Placar
- **WHEN** o placar tem `totals.hits: 7` e `totals.scorable: 11`
- **THEN** a tela mostra "Você acertou 7 de 11 categorias."

#### Scenario: Chip de erro
- **WHEN** em "Narrativa" o usuário votou em outro jogo (`outcome: "miss"`)
- **THEN** o cartão de "Narrativa" mostra o vencedor e o chip "Seu voto" com o jogo votado

#### Scenario: Placar indisponível
- **WHEN** a leitura do placar responde 404
- **THEN** a tela omite o bloco "Seu placar" e os chips, sem erro

#### Scenario: Visitante
- **WHEN** um visitante abre `/awards/2026/result` sem usuário no link
- **THEN** vê apenas o resultado público, sem placar nem chips

### Requirement: GOTY pessoal no resultado
Quando o placar tiver `personalGOTY`, a tela SHALL mostrar o cartão "Seu GOTY pessoal" com o jogo e "Também é o GOTY pessoal de {otherUsersCount} outras pessoas no GameNode."; com `otherUsersCount` 0, SHALL omitir a frase.

#### Scenario: GOTY pessoal compartilhado
- **WHEN** `personalGOTY` é `{ gameId: 103, otherUsersCount: 312 }`
- **THEN** o cartão mostra o jogo 103 e a contagem de 312 outras pessoas

### Requirement: Compartilhar o placar
A ação "Compartilhar meu placar" SHALL compartilhar o link `/awards/{ano}/result?user={userId}`, que abre o resultado com o placar desse usuário para qualquer visitante.

#### Scenario: Abrir placar compartilhado
- **WHEN** um visitante abre `/awards/2026/result?user=abc`
- **THEN** vê o resultado com "Seu placar" e os chips calculados para o usuário `abc`, identificado pelo nome do perfil
