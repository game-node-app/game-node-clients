# Spec Delta

## Purpose

Permite que administradores configurem pelo admin o calendário completo do Awards (indicações, votação, resultado e corte de elegibilidade), o número de indicados por categoria e a abertura anual da Retrospectiva, sem deploy.

## ADDED Requirements

### Requirement: Datas de indicação e corte no evento
O formulário de evento do admin SHALL aceitar, além das datas de votação e resultado, as datas opcionais de início e fim das indicações e a data opcional de corte de elegibilidade, e SHALL enviá-las em `POST /v1/awards/admin/event`. Ao editar, SHALL carregar os valores salvos.

#### Scenario: Criar evento com indicações
- **WHEN** o admin preenche indicações de 20 a 28 nov, votação de 1 a 20 dez, resultado em 27 dez e corte em 30 nov
- **THEN** o admin envia todas as datas e o evento passa a listar a fase atual

#### Scenario: Evento sem indicações
- **WHEN** o admin deixa as duas datas de indicação vazias
- **THEN** o admin envia o evento sem elas

### Requirement: Validação das datas de indicação
O formulário SHALL exigir as duas datas de indicação juntas, com início antes do fim e fim até o início da votação, e SHALL mostrar o erro do servidor quando ele recusar o evento.

#### Scenario: Só uma data de indicação
- **WHEN** o admin preenche só o início das indicações
- **THEN** o formulário mostra um erro e não envia

#### Scenario: Indicações depois da votação
- **WHEN** o fim das indicações é posterior ao início da votação
- **THEN** o formulário mostra um erro e não envia

### Requirement: Fase visível no admin
A lista e o detalhe de eventos no admin SHALL mostrar o `phase` de cada evento.

#### Scenario: Evento em votação
- **WHEN** o evento 2026 está em `voting`
- **THEN** o admin mostra a fase "voting" no evento 2026

### Requirement: Número de indicados por categoria
O formulário de categoria SHALL aceitar `nomineeCount` (padrão 6) e enviá-lo em `POST /v1/awards/admin/category`. O detalhe da categoria SHALL indicar se os indicados já foram finalizados (`nomineesFinalizedAt`).

#### Scenario: Categoria com 5 indicados
- **WHEN** o admin cria uma categoria com `nomineeCount` 5
- **THEN** o admin envia `nomineeCount: 5`

### Requirement: Abertura da Retrospectiva
O admin SHALL oferecer a edição da abertura da Retrospectiva por ano, enviando `PUT /v1/recap/admin/editions/:year` com `opensAt` dentro do ano UTC, e SHALL mostrar a janela retornada.

#### Scenario: Definir a abertura de 2026
- **WHEN** o admin define a abertura de 2026 em 15 nov 2026 00:00 UTC
- **THEN** o admin envia `opensAt` e mostra `opensAt` e `closesAt` retornados

#### Scenario: Data fora do ano
- **WHEN** o admin escolhe uma abertura em 2025 para o ano 2026
- **THEN** o formulário mostra um erro e não envia
