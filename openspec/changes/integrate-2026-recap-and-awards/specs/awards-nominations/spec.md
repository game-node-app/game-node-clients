# Spec Delta

## Purpose

Permite que cada usuário indique até três jogos elegíveis por categoria durante a fase de indicações do Awards, e mostra as categorias e os indicados finais quando essa fase termina.

## ADDED Requirements

### Requirement: Tela de indicações
O web e o mobile SHALL oferecer `/awards/:year/nominations`, com a lista de categorias do evento na ordem de `order` (sem o GOTY pessoal) e, para a categoria ativa, as indicações atuais do usuário e uma busca de jogos. Os nomes e capas dos jogos SHALL vir do repositório de jogos, em uma leitura em lote por tela.

#### Scenario: Abrir as indicações
- **WHEN** um usuário logado abre `/awards/2026/nominations` com o evento em `nominations`
- **THEN** vê as categorias na ordem do servidor, sem "Seu GOTY pessoal", e, para a primeira categoria, seus jogos indicados com capa e nome

#### Scenario: Progresso
- **WHEN** o usuário tem indicações em 4 de 11 categorias
- **THEN** a tela mostra "4 de 11" no cabeçalho da lista de categorias

### Requirement: Indicar e remover jogos
Na fase `nominations`, o usuário SHALL poder adicionar e remover jogos da categoria ativa, até 3 jogos distintos. Cada alteração SHALL substituir as indicações da categoria por `PUT /v1/awards/:eventId/nominations/:categoryId` e, em caso de erro, desfazer a alteração na tela e exibir a notificação de erro.

#### Scenario: Adicionar um jogo
- **WHEN** a categoria tem 2 indicações e o usuário escolhe um terceiro jogo na busca
- **THEN** o cliente envia os 3 ids e a categoria passa a mostrar os 3 jogos

#### Scenario: Limite atingido
- **WHEN** a categoria já tem 3 indicações
- **THEN** a busca não permite adicionar outro jogo e mostra que o limite é 3

#### Scenario: Limpar a categoria
- **WHEN** o usuário remove o último jogo da categoria
- **THEN** o cliente envia uma lista vazia e a categoria aparece sem indicações

#### Scenario: Jogo recusado pelo servidor
- **WHEN** o servidor responde 400 para um jogo inelegível
- **THEN** o jogo sai da categoria na tela e uma notificação de erro é exibida

### Requirement: Busca de candidatos elegíveis
A busca de jogos da tela de indicações SHALL filtrar os resultados para jogos lançados no ano do evento e, quando houver `eligibilityCutoffDate`, até essa data. Jogos sem data de lançamento SHALL continuar elegíveis. A validação final SHALL continuar sendo do servidor.

#### Scenario: Jogo de outro ano
- **WHEN** a busca encontra um jogo lançado em 2025 para o evento 2026
- **THEN** o jogo não é oferecido como candidato

#### Scenario: Jogo depois do corte
- **WHEN** o evento tem corte em 30 nov 2026 e um jogo foi lançado em 5 dez 2026
- **THEN** o jogo não é oferecido como candidato

### Requirement: Fora da fase de indicações
Fora da fase `nominations`, a tela SHALL ser somente leitura. Em `nominations_closed` e depois, cada categoria SHALL mostrar os indicados finais (`suggestions`) e as indicações do usuário, sem ações de edição. Antes da abertura, a tela SHALL mostrar a data de início das indicações.

#### Scenario: Indicações encerradas
- **WHEN** o usuário abre a tela com o evento em `nominations_closed`
- **THEN** vê os indicados finais de cada categoria e não consegue adicionar ou remover jogos

#### Scenario: Antes da abertura
- **WHEN** o evento está em `upcoming` com `nominationStartDate` em 20 nov
- **THEN** a tela informa que as indicações abrem em 20 nov e não mostra a busca

### Requirement: Indicações exigem sessão
Sem sessão, a tela SHALL mostrar as categorias públicas e um convite para entrar, sem chamar a leitura de indicações do usuário.

#### Scenario: Visitante
- **WHEN** um visitante abre `/awards/2026/nominations` durante as indicações
- **THEN** vê as categorias e a ação "Entrar para indicar", e o cliente não chama `GET /nominations/me`
