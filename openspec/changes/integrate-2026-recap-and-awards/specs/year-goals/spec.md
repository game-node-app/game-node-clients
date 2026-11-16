# Spec Delta

## Purpose

Permite que o usuário defina, na própria Retrospectiva, uma meta de jogos zerados para o ano seguinte e acompanhe o progresso dessa meta.

## ADDED Requirements

### Requirement: Cartão da meta na Retrospectiva
Na Retrospectiva do ano Y aberta pelo próprio dono logado, a página SHALL mostrar o cartão "Meta para {Y+1}" com um seletor numérico e a ação "Salvar meta". O valor inicial SHALL ser o `target` de `GET /v1/recap/goals/{Y+1}` ou, sem meta, `totalFinishedGames` de Y mais 4. O cartão SHALL não aparecer para visitantes nem na Retrospectiva de outra pessoa.

#### Scenario: Sem meta salva
- **WHEN** a Retrospectiva 2026 tem 14 zerados e a leitura da meta 2027 retorna `target: null`
- **THEN** o seletor começa em 18 e a frase diz "Zerar 18 jogos, 4 a mais que em 2026."

#### Scenario: Meta existente
- **WHEN** a leitura da meta 2027 retorna `target: 20`
- **THEN** o seletor começa em 20

#### Scenario: Retrospectiva de outra pessoa
- **WHEN** um usuário logado abre a Retrospectiva de outro usuário
- **THEN** o cartão da meta não aparece e a leitura da meta não é chamada

### Requirement: Salvar a meta
"Salvar meta" SHALL enviar `PUT /v1/recap/goals/{Y+1}` com um inteiro de 1 a 999, atualizar o cartão com a resposta e exibir a confirmação; em caso de erro, SHALL exibir a notificação de erro e manter o valor anterior salvo.

#### Scenario: Salvar
- **WHEN** o usuário escolhe 18 e salva
- **THEN** o cliente envia `{ "target": 18 }` e o cartão confirma que o lembrete virá em julho

#### Scenario: Limites do seletor
- **WHEN** o seletor está em 1 ou em 999
- **THEN** não é possível diminuir abaixo de 1 nem aumentar acima de 999

### Requirement: Meta só para o ano corrente ou o próximo
O cartão SHALL aparecer só quando Y+1 for o ano UTC corrente ou o seguinte, já que o servidor recusa outros anos.

#### Scenario: Retrospectiva antiga
- **WHEN** em 2026 o dono abre a própria Retrospectiva 2024
- **THEN** o cartão da meta para 2025 não aparece

### Requirement: Progresso da meta
Quando houver meta, o cartão SHALL mostrar o progresso "{finished} de {target} zerados" de `GET /v1/recap/goals/{Y+1}`.

#### Scenario: Progresso durante o ano da meta
- **WHEN** em julho de 2027 a meta 2027 é `{ target: 18, finished: 7 }`
- **THEN** o cartão mostra "7 de 18 zerados"
