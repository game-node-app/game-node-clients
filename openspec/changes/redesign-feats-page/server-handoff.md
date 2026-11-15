# Hand-off: pendências de servidor para a página de Feitos

> **Status: implementado (2026-11-14).** Entregue no branch `feature/achievement-code-limits` de `game-node-server` (commit `3e239e4`), verificado com `achievements.service.integration.spec.ts` (7 testes passando, incluindo níveis 1–2 com datas, `[]` sem nível, resgate `{ achievementId, tier: 1 }` e código expirado `400`). `AchievementProgressDto.obtainedTiers` é preenchido em `GET /v2/achievements/progress/:userId` com as linhas de `obtained_achievement` do usuário (a consulta existente passou a trazer `createdAt`), ordenado por nível e `[]` quando não há nível. `RedeemAchievementCodeResponseDto` foi criado, o handler anotado e `consume` retorna `{ achievementId, tier: 1 }`. Única diferença em relação ao pedido: para responder igual quando o usuário já tinha o nível, `consume` checa `hasObtainedTier` antes de conceder — sem isso o grant manual lançava `400 User already has this achievement.`; os erros `404 Code not found` e `400 Code has expired.` não mudaram. `server_swagger.json` regerado e copiado para `packages/wrapper/input/server_swagger.json` (idêntico ao do servidor); wrapper regenerado e `yarn type-check` passando.

Destino: `game-node-server`, módulo `src/achievements`.
Origem: change `redesign-feats-page` em `game-node-clients` (Figma `ikcThguwowTdynGz0L2YkS`, nó `5342:19790`). Os dois itens são aditivos e independentes; cada um pode virar um PR próprio. Os clientes só leem os campos novos de forma opcional, mas o servidor deve sair antes do release de `web` e `mobile`.

## Estado atual (referência)

- `obtained_achievement` guarda uma linha por nível (`@Unique(["achievementId", "profile", "tier"])`) com `createdAt`.
- `AchievementProgressDto` (`dto/achievement-v2.dto.ts`) expõe só `achievementId`, `value`, `tier` (maior nível) e `nextThreshold`.
- `AchievementsCodeController.consume` (`GET /v1/achievements/code/consume/:code`) chama `AchievementsCodeService.consume`, que concede o nível 1 via `achievementsService.grantAchievement` → `achievementsProgressService.grantTiers(userId, definition, [1], "manual")` e não retorna nada (Swagger: `200` sem `content`).

## 1. Datas por nível no progresso

- Adicionar a `AchievementProgressDto`:
  ```ts
  /** Obtained tiers of the user, ordered by level. Empty when tier is 0. */
  obtainedTiers: AchievementObtainedTierDto[]; // { level: number; obtainedAt: Date }
  ```
- Preencher em `GET /v2/achievements/progress/:userId` a partir das linhas de `obtained_achievement` do usuário (uma consulta para todos os feitos, agrupada por `achievementId`), `obtainedAt = createdAt`.
- Testes: usuário com níveis 1 e 2 de um feito recebe os dois níveis com datas; feito sem nível recebe `[]`.

## 2. Resultado do resgate de código

- Criar `RedeemAchievementCodeResponseDto { achievementId: string; tier: number }` e anotar o handler com `@ApiOkResponse({ type: RedeemAchievementCodeResponseDto })`.
- `consume` retorna `{ achievementId: possibleCode.achievementId, tier: 1 }` depois de conceder (o nível concedido hoje). Se o usuário já tinha o nível, responder igual (o cliente mostra o feito do mesmo jeito).
- Erros atuais (`404 Code not found`, `400 Code has expired.`) não mudam.
- Testes: consumo válido retorna o corpo acima; código expirado continua `400`.

## Depois

Gerar o `server_swagger.json` (`yarn start`) e copiar para `game-node-clients/packages/wrapper/input/server_swagger.json`. Atualizar o status no topo deste arquivo com as diferenças em relação ao pedido.
