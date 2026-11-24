# Design

## Context

- Motivation and scope: see `proposal.md`. API contract: `reference/server-handoff.md` (copied from `game-node-server` PR #270, change `add-adventurers-guild`). Every endpoint, field, enum, status and error code there is authoritative.
- Visual source: Figma `rvZfYT3eR8ktZAW6g3HO8C`. Frames: `6:2` desktop hall, `8:268` mobile hall, `9:387` "Pedido aceito" state, `10:409` Lina sheet + animation table, page `2:62` components/sprites. Reference renders live in `reference/` (`desktop-6-2.png`, `mobile-8-268.png`, `accepted-9-387.png`, `lina-poses-5-185.png`). Pixel measurements below come from Figma `get_design_context`; implementers do not have Figma access, so this document is the visual contract.
- Clients: shared UI in `@repo/ui` (`packages/ui`), web = Next.js pages router, mobile = Ionic/Vite. Pages are thin; views live in `packages/ui/src/components/<feature>`. Colors must come from `--gn-*` tokens; literal colors are only allowed with a `theme-exempt` comment (artwork). Apps are dark-only.
- `@repo/wrapper` is generated from `packages/wrapper/input/server_swagger.json`; the server worktree's `server_swagger.json` (`/home/cassi/.t3/worktrees/game-node-server/t3-280662c7-f2da079f954e9d24/server_swagger.json`) differs from the client copy only by the Guild routes/DTOs.
- Figma SVG exports, fonts and screenshots were downloaded to `/tmp/claude-1000/-home-cassi--t3-worktrees-game-node-clients-t3-efd382f7-805af650136dd512/f82d53d1-6154-41b1-8253-34657e700927/scratchpad/figma/{svg,fonts}` (temporary staging; tasks copy them into the apps).

## Goals / Non-Goals

**Goals:**
- Pixel-faithful Guild Hall on desktop and mobile widths, shared by web and mobile, including every animation in the Figma animation table and the "Pedido aceito" sequence.
- Server-driven early-access gate (no client release needed to go public).
- Complete player flow: see board → accept (with target game) → contract in progress → turn in → celebration → equip cosmetic.

**Non-Goals:**
- Admin UI for events/rewards; Guild cosmetics on profile pages; push notifications beyond the existing inbox; any server change.
- A canvas/game engine: the scene is DOM + SVG + CSS.

## Decisions

### D1. Feature layout in `@repo/ui`
`packages/ui/src/components/guild/` with:
- `hooks/` — one hook per resource (React Query): `useGuildAccess` (`["guild","access",userId|null]`, `staleTime` 60 s, `refetchOnWindowFocus: true`), `useGuildOverview` (`["guild","overview",userId]`), `useGuildBoard(quick)` (`["guild","board",userId,{quick}]`), `useGuildContracts(tab)` (infinite, `["guild","contracts",userId,tab]`), `useGuildRewards` (`["guild","rewards",userId]`); mutations `useAcceptGuildContract`, `useClaimGuildContract`, `useAbandonGuildContract`, `useMarkGuildBoardSeen`, `useUpdateGuildCosmetics`. All Guild queries set `staleTime: 30_000` and `refetchOnMount: true` (web defaults to `Infinity`). Queries return `ExtendedUseQueryResult` with `invalidate()`. A shared `guildKeys` builder and `invalidateGuild(queryClient)` refresh overview/board/contracts/rewards after every mutation. Every player query is `enabled` only when access is `hasAccess: true`.
- `util/` — `isGuildEarlyAccessError(err)` (HTTP 403 + `body.code === "guild_early_access_required"`), `getGuildErrorCode(err)`, `formatLicenseNumber(n)` (`Nº 0047`), `getRankProgress(license)`, `getQuestCopy(quest, t, locale)` (template key → `guild.templates.<key>.title/description`; events → translation for `en`/`pt-BR` by current locale, fallback base), `getRewardLabel(reward, t)` (`guild.rewards.<key>`, unknown → `guild.rewards.generic.<kind>`), `getLinaLine(lina, t)` returning rich segments `{ text, highlight? }[]` so game names render in gold, `formatTimeLeft(iso)`.
- `view/` — `GuildView` (entry, takes `supporterHref: string` and `initialTab?`), `GuildEarlyAccess`, `GuildSignInPrompt`, `GuildHall`, `GuildHeader`, `GuildLicenseCard`, `GuildActiveContracts`, `GuildTabs`, `GuildBoard`, `GuildQuestCard`, `GuildContractList`, `GuildContractRow`, `GuildAcceptedState`, `GuildClaimCelebration`, `GuildRewardsPanel`, `GuildTargetGamePicker`.
- `scene/` — `GuildScene` (desktop/mobile variants), `LinaSprite`, `LinaDialogue`, `useTypewriter`, `GuildProp`, `GuildIcon`, `RankStamp`, `CategoryTag`, `GameChip`, `PixelButton`.
- `guild.module.css` — palette, fonts, keyframes (D3/D5).
- Export through barrels (`pnpm --filter @repo/ui barrels:generate`).

Alternative considered: separate web/mobile implementations. Rejected: AGENTS.md requires shared views; the layout difference is a responsive breakpoint, not a platform difference.

### D2. Access gate flow
`GuildView` reads `useUserId()` and `useGuildAccess()`. While loading → skeleton in Guild colors. `hasAccess:false` → guest: `GuildSignInPrompt` (reuses the app's sign-in route `/auth`); signed-in: `GuildEarlyAccess` (Lina happy-neutral sprite on the counter, pixel dialogue box: "A Guilda está em acesso antecipado para apoiadores…", primary `PixelButton` linking to `supporterHref`). The player hooks wrap `onError`: `isGuildEarlyAccessError` → `queryClient.setQueryData(access key, {mode, hasAccess:false})` then invalidate access once; Guild hooks do not use `createErrorNotification` for that code. Mutations use `createErrorNotification` for other errors but map known codes to translated messages. `supporterHref`: web `/premium`, mobile `/preferences/supporter`, passed by each app's page (no registry change needed).

Navigation: web adds a `guild` dock item (`labelKey: "navigation.guild"`, href `/guild`, icon `NavGuildIcon` — new 24 px shield glyph built from the Figma "Escudo" path, using `currentColor`) in the Discover group next to Daily; badge `"earlyAccess"` while `useGuildAccess().data?.mode === "supporters"`. Mobile sidebar adds `MobileSidebarButton` with `IconShield` (tabler) + badge label `t("guild.earlyAccess.badge")`. The access query is public, so it can run for guests too.

### D3. Colors and fonts
Guild-only artwork palette is defined once as CSS custom properties on the Guild root class in `guild.module.css` under `/* theme-exempt: Adventurers Guild pixel-art palette from Figma rvZfYT3eR8ktZAW6g3HO8C */`:

| Variable | Value | Use |
| --- | --- | --- |
| `--guild-wall` | `#1c1411` | scene background |
| `--guild-wall-dark` | `#0d0907` | planks, wainscot |
| `--guild-wood-dark` | `#2e1c10` | beam, cork board, joints, shelf brackets |
| `--guild-wood` | `#5a3820` | counter front, board frame |
| `--guild-wood-light` | `#8a5a36` | counter top, shelf |
| `--guild-outline` | `#1f120d` | outlines |
| `--guild-parchment` | `#efe0b5` | quest cards, contract |
| `--guild-parchment-shade` | `#c4ad78` | card border, chips, icon tile |
| `--guild-ink` | `#2b1a10` | text on parchment, weekly tag |
| `--guild-stamp` | `#c7362a` | rank stamp, ACEITO, pins on wall papers |
| `--guild-gold` | `#ffcc4d` | highlighted names, PEDIDOS sign, XP chip |
| `--guild-dialog-bg` | `#0d0a09` | dialogue box |
| `--guild-dialog-border` | `#e8d7a8` | dialogue border |
| `--guild-dialog-text` | `#f4ead2` | dialogue text |
| `--guild-dialog-dim` | `#b9ad94` | unfocused options, separator |
| `--guild-shadow` | `rgba(0,0,0,.45)` | card drop shadow |

Everything else maps to theme tokens so it follows the active theme: brand accent `var(--gn-brand)`, brand tint `var(--gn-brand-tint)`, accent text `var(--gn-accent-text)`, accent contrast `var(--gn-accent-contrast)`, primary-button 3 px bottom shadow and card XP text `var(--gn-brand-9)`, wall paper "Pedido 3" `var(--gn-brand-3)`, surfaces `--gn-background`/`--gn-surface`/`--gn-paper-1`/`--gn-paper-2`, lines `--gn-line`/`--gn-line-strong`, text `--gn-text`/`--gn-text-color`/`--gn-text-muted`, event tag `--gn-premium-soft` bg + `--gn-premium-text` text, gamenode tag `--gn-state-played-tint` + `--gn-state-played`, year-goal bar `--gn-success`. Implementers verify each name in `packages/ui/src/theme/generated/themes.css`. Tailwind utilities may be used for layout; no arbitrary color utilities.

Fonts (SIL OFL), self-hosted per app under `public/font/`: `PixelifySans-Variable.ttf` (400–700) and `Silkscreen-Regular.ttf`/`Silkscreen-Bold.ttf`. A `GuildFonts` component (same pattern as `RecapCardFonts`) injects `@font-face` for `'Guild Pixel'` (Pixelify Sans) and `'Guild Stamp'` (Silkscreen) and the module exposes `.pixel` / `.stamp` classes. Body text stays Roboto (app font).

Typography tokens: Pixel/Title 22 (600, lh 26), Pixel/Card title 17 (600, lh 20), Pixel/Dialog 16 (400, lh 23; mobile 15/21), Pixel/Label 13 (700, lh 16), Pixel/Overline 12 (500, lh 14, letter-spacing 0.96 px, uppercase), Stamp rank 18 bold / "RANK" 7 px regular tracking .56, ACEITO 30 bold tracking 1.8, Body 13 regular lh 19, Body/Medium 13 lh 18, Caption 12 lh 16, Caption/Medium 11 lh 14.

### D4. Assets
SVGs exported from Figma are copied verbatim to `apps/web/public/img/guild/` and `apps/mobile/public/img/guild/` (identical sets, like `img/awards`) and referenced as `/img/guild/<name>.svg` through one `GUILD_ASSETS` map in `scene/assets.ts`. They are artwork (theme-exempt by being static files). Names: sprites `lina-body`, `lina-braids`, `lina-eyes-closed`, `lina-mouth-open`, `lina-eyes-happy`, `lina-smile` (192×204, one 32×34 sprite at 6×; rendered at 160×170 on mobile); props `lantern` 48×66, `lantern-glow` 220×220, `accepted-glow` 300×300, `alert-bubble` 42×66, `ledger` 96×60, `inkpot` 48×60, `stamp` 42×42, `milk` 36×60, `bell` 48×48, `mug` 54×48, `plant` 48×48; icons `book` 30×27, `scroll` 30×27, `hourglass` 24×27, `trophy` 30×30, `quill` 24×27, `chest` 30×24, `coin` 16×14, `star` 28×28, `alert-icon` 14×22, `shield` 22×24, `silhouette` 30×36, `cursor` 10×12, `pin` / `pin-highlight` 12×12 (rendered at `inset:-16.67%`). Never change an SVG's intrinsic width/height; every `<img>` sets explicit width/height and `style="image-rendering: pixelated"`, `alt=""` (decorative) except Lina (`alt` = "Lina").

Quest icon by category/template: `library` → book (`deep_dive` also book), `event` → hourglass, `weekly` → trophy, `gamenode` → quill, `weekly_chest` reward → chest, unknown → scroll.

### D5. Animations (CSS only)
No new dependency (no `motion`/framer). Keyframes in `guild.module.css`; pixel motions use `steps()`/hold keyframes so the sprite stays on the pixel grid. All are disabled under `@media (prefers-reduced-motion: reduce)` and the typewriter shows full text immediately (`useReducedMotion` from `@mantine/hooks`).

| Animation | Target | Spec |
| --- | --- | --- |
| Breathing | Lina wrapper | `translateY(0)` ↔ `translateY(-6px)` (desktop; `-5px` mobile = 1 sprite px), hold steps, 1.2 s loop (`steps(1,end)`, 0–50 % at 0, 50–100 % up) |
| Braids | braids layer | same keyframes, `animation-delay: 100ms`, plus Figma secondary bob (+6/−6 px alternating short holds) is optional; minimum is the delayed breath |
| Blink | closed-eyes layer | opacity 0 → 1 for 120 ms every ~3.5 s (keyframes 0–96.5 % = 0, 96.6–99.9 % = 1), `steps(1)`; only in neutral pose and not while talking |
| Talk | open-mouth layer | toggles every 140 ms (`steps(1)` 280 ms loop) only while `isTyping`; stops (hidden) when the line ends |
| Typewriter | dialogue text | `useTypewriter(segments, 35 cps)` reveals characters; the full text is laid out invisibly to reserve height (`visibility:hidden` for unrevealed chars) to avoid reflow; click/Enter/Space completes; starts 400 ms after mount (1000 ms in accepted state) |
| `!` balloon | alert bubble | `translateY(0 → -6px → 0)`, 0.8 s, `ease-in-out`, infinite; only when `hasUnseenBoard` |
| Lantern | lantern glow | opacity 1 → .7 → 1, 1.6 s, linear, infinite |
| Wall papers | 6 papers on the wall board | rotate ±0.6–1°, 6 s ease-in-out infinite, alternate signs per paper |
| `▼` next | indicator | visible/hidden every 0.5 s (`steps(1)`), only after typing ends |
| Cursor | option cursor | `translateX(0 ↔ 2px)` every 0.5 s, hold |
| Cards enter | quest cards | from `opacity:0; translateY(16px)` to rest, 340 ms ease-out, delay `index * 60ms`; replays when the board data changes (key by week/quick) |
| Accepted stamp | ACEITO | starts 300 ms after open: `scale(2.2)`/opacity 0 → `scale(.94)` opacity 1 at 200 ms (ease-in) → `scale(1)` at 260 ms (ease-out-back `cubic-bezier(.34,1.56,.64,1)`); keeps its `rotate(12deg)` |
| Contract shake | contract | at stamp impact (~500 ms): x `0,3,-3,2,-1,0` px and y `0,2,0` over 300 ms, once |
| Happy hop | Lina (accepted) | at impact: 4 quick −6 px hops (200 ms each) then breathing |
| Sparkles | 4 stars around Lina | from 550 ms, staggered 120 ms: scale .4 → 1 (`cubic-bezier(.45,1.45,.8,1)`, 300 ms) + opacity 0 → 1, then twinkle opacity 1 → .2 → 1 → .3 → 1 over ~2.6 s, infinite |
| XP chip | "+250 XP ao concluir" | at 750 ms: opacity 0 → 1, `translateY(14px → 0)` with back ease, 350 ms |
| Claim celebration | XP counter + rewards | count-up of `xpAwarded` over 800 ms, reward rows entering like cards; rank-up banner uses the stamp keyframe |

### D6. Layout and the scene
Breakpoint: `md` (Mantine `48em`): below → mobile layout (frame `8:268`); at/above → desktop (`6:2`). The hall root has `max-width: 1280px`, centered, `border-radius: var(--gn-radius)` (lg 12 px), 1 px `--gn-line` border, `overflow:hidden`, background `--gn-background`.

**Header (desktop)**: `--gn-surface`, bottom border, padding 14×24, space-between. Left: 40 px tall crest tile (bg brand tint, 1 px brand border, radius 8, shield 22×24 centered, ~8 px side padding) + title "Guilda dos Aventureiros" (Pixel/Title 22) and subtitle (Caption 12 muted) "Quadro de pedidos renovado toda segunda · próxima rodada em {timeLeft}". Right (gap 12): rank badge (brand bg, padding 4×8, radius 4, shadow `0 3px 0 var(--gn-brand-9)`, Silkscreen bold 12 "RANK C", accent-contrast text) + 240 px XP block: row (title Caption/Medium 11 body color, "1.240 / 2.000 XP" muted) above an 8 px bar (bg paper-2, 1 px line-strong border, radius 2, fill brand). **Mobile header**: padding 14/16/12, column gap 10: row [shield + title 19 px] [rank badge padding 3×7] ; row [title, XP]; full-width bar.

**Scene (desktop, 360 px tall)**: full-width background `--guild-wall`; layers that span the width use `width:100%`; positioned art lives in a 1280 px wide stage anchored with `left: max(calc((100% - 1280px) / 2), -56px)` and no transform. When the hall is wider than 1280 px the stage centers; below that the left crop is capped at 56 px so Lina, the lantern and the counter stay fully visible at md widths instead of cropping ~170 px per side (`right` is intentionally allowed to crop). The dialogue box stays positioned relative to the scene container, not the stage, anchored to the right (`right: 40px`, `width: min(560px, 46%)`), so it never overlaps the capped-left art. Coordinates (stage px, top-left):
- Vertical planks: 4×268 `--guild-wall-dark` every 168 px from x=0 (repeating background is fine).
- Beam: y 28, h 14, `--guild-wood-dark`, full width. Wainscot: y 200, h 68, `--guild-wall-dark`; wainscot rail: y 196, h 6, `--guild-wood-dark`.
- Lantern glow 220×220 at (−30, 20); lantern 48×66 at (56, 70).
- Wall quest board 228×150 at (400, 56): bg `--guild-wood`, 6 px `--guild-outline` border. Sign "PEDIDOS" at (72, −20) inside: `--guild-wood-dark` bg, 3 px outline border, padding 2×10, Pixelify bold 13 gold. Six papers (parchment; #3 uses `--gn-brand-3`) with three ink lines (3 px tall, at y 12/21/30, x 8, widths decreasing by 6) and a 6×6 `--guild-stamp` tack at top center: P1 52×60 at (6,10) rot 4°; P2 56×46 at (74,3) rot −3°; P3 60×70 at (140,14) rot 2°; P4 60×48 at (18,78) rot −2°; P5 44×64 at (87,64) rot 3°; P6 58×40 at (144,86) rot −4°.
- Shelf 300×10 `--guild-wood-light` at (690,110); brackets 8×18 `--guild-wood-dark` at (710,120) and (962,120). On shelf: mug (700,62), milk (770,50), milk (812,50), plant (870,62), mug (930,62).
- Lina 192×204 at (170, 82). `!` balloon 42×66 at (336, 44).
- Counter (y 264, h 96, full width): front `--guild-wood` from y+18 h 78; joints 4×72 `--guild-wood-dark` every 80 px starting x 60, y+24; top `--guild-wood-light` h 18; edge `--guild-outline` y+18 h 6; outline top h 3.
- Counter props: bell (40,216), ledger (400,204), inkpot (504,204), stamp (470,222), milk (540,204), milk (580,204).
- Dialogue box: top 150, right 40, padding 24/20/16, bg `--guild-dialog-bg`, 3 px `--guild-dialog-border`, shadow `0 9px 0 rgba(0,0,0,.4)`, column gap 10. Name plate at (11, −19): brand bg, 3 px dialog-bg border, padding 3×10, Pixelify bold 13 accent-contrast, "Lina · Recepcionista da Guilda". Text Pixel/Dialog 16 `--guild-dialog-text`, game names gold. Options block: 2 px dashed `--guild-dialog-dim` top border, padding-top 8, gap 2; each option row gap 6: cursor 10×12 (or 10 px spacer), label Pixelify 15 lh 23 (focused `--gn-text`, others `--guild-dialog-dim`). `▼` Pixelify bold 13 brand color at bottom-right (right 27, bottom 19).

**Scene (mobile, 280 px tall, 390 px reference width; scale positions by `100%/390` horizontally where needed, or center a 390 px stage)**: planks every 110 px from x 40 (h 200); beam y 22 h 12; wainscot y 150 h 60, rail y 146 h 6; lantern glow 170×170 at (230,0); lantern (292,44); shelf 140×8 at (236,120); milk (250,60); plant (310,72); Lina 160×170 at (48,52); `!` (196,22); counter y 214 h 80 (front from +16 h 64, joints every 72 px from 40 h 58, top h 16, edge h 5, outline h 3); bell (6,166); ledger (226,154); stamp (336,172). The dialogue box is **below** the scene inside the content (padding 24/16): padding 22/16/14, shadow `0 8px 0 rgba(0,0,0,.4)`, name plate "Lina · Recepcionista" at (9, −19), text 15/21, option rows `py 6`, gap 8.

**Content (desktop)**: padding 24/24/32, row gap 24. Sidebar 340 px, column gap 20:
- License card: `--gn-surface`, 1 px line, radius 8, padding 14/16/16, gap 14. Row 1: "LICENÇA DA GUILDA" / "Nº 0047" (Pixel/Overline muted). Row 2 (gap 12): 56 px avatar tile (paper-2, 1 px line-strong, radius 8; user avatar if available else silhouette 30×36; when `equippedFrameKey` is set, draw a 2 px gold/brand frame variant per key) + name block (equipped title or rank title, Pixelify 600 17 lh 20 text; "Membro da guilda desde 2024" Caption muted) + rank stamp ~52 px. Row 3: three stat tiles (paper-1, radius 4, padding 8×10; number Pixel/Title 22; label Caption muted): Zerados / No backlog / Reviews. Row 4: "Próximo rank: B" (Caption/Medium body) + "faltam 760 XP" (accent text) above an 8 px bar.
- Active contracts: overline "CONTRATOS ATIVOS" + 1 px line filler; rows (paper-1, 1 px line, radius 8, padding 10×12, gap 6): title "Relíquia Esquecida · Hollow Knight" (Body/Medium 13 text) + right value (Caption/Medium 11 muted: `62%` / `9 / 12` / `1 / 3`), 8 px bar (brand; year goal `--gn-success`), caption muted ("Aceito há 5 dias · 18h de 29h", "Faltam 3 jogos até 31/12", template description). `ready_to_claim` rows get a brand border and a "Entregar" small primary button, and Lina's happy pose.
- Board column (flex 1, gap 16): tabs row (bottom 1 px line; tabs padding 8/12/10, Body 13; active text `--gn-text` + 2 px brand bottom border + count pill brand tint/accent text; inactive muted + pill paper-2/body; pill radius 10, padding 1×6, Caption/Medium 11) and right "⌛ Renova em 3d 14h" (hourglass 24 px + Caption muted).
- Cork board: `--guild-wood-dark`, 6 px `--guild-wood` border, radius 8, padding 32/24/28, wrap with gap 32 (row) × 20 (col); cards are `calc(50% - 10px)` (388 px at 1280).

**Quest card** (parchment, 1 px parchment-shade border, radius 4, `filter: drop-shadow(0 6px 0 var(--guild-shadow))`, padding 20/16/14, gap 12): header row gap 12: 48 px icon tile (parchment-shade bg, radius 4, icon 32) · title block (tag, then Pixelify 600 17 ink title) · rank stamp (46 px circle, 2 px stamp border, stamp color, "RANK" Silkscreen 7 + letter Silkscreen bold 18, rotated 8°). Description Body 13 ink. Chips (parchment-shade bg, radius 4, padding 3/8/3/3, gap 6): 16×20 cover (radius 2, real game cover via existing cover util / `coverUrl`) + name (Medium 12 ink) + meta (11 ink, "desde 2023" / "~4h"). Footer: 1 px dashed parchment-shade top border, padding-top 12, gap 10: rewards column (coin 20 + "+250 XP" Pixelify bold 13 `--gn-brand-9`; reward label Caption ink) · actions gap 6: ghost "Agora não" (1 px ink border, radius 8, padding 7×12, Medium 13 ink) and primary "Aceitar" (brand bg, radius 8, padding 7×12, Medium 13 accent-contrast, `filter: drop-shadow(0 3px 0 var(--gn-brand-9))`, pressed: translateY(2px) and shadow 1 px). Pin 12 px centered at top 4 px. Recommended (`isRecommended`): 2 px brand border, highlighted pin, seal "★ Lina recomenda" at (10, −18) rotated −2° (brand bg, 2 px outline border, padding 3×8, Pixelify bold 12 accent-contrast).

Category tags (padding 2×7, radius 4, Caption/Medium 11): library "Da sua biblioteca" brand tint/accent text; event "Evento curado · N dias" premium; weekly "Semanal" ink bg/parchment text; gamenode "Uso do GameNode" played tint/played; year goal "Meta" played tint/success text.

**Mobile content**: dialogue, active contracts (no license card in a column — the License card is rendered after the active contracts in a collapsible "Licença" section, still visible), tabs "Pedidos / Aceitos / Concluídos" (padding 8/10/10), cork board with 4 px border, padding 28/12/20, cards full width, gap 28.

**Accepted state** (`9:387`, 640×520 at desktop; rendered as the Guild `Modal` — `ModalComponentProps` so mobile shows `ion-modal` — with the scene and dialogue inside; full-screen on mobile): scene 640×330: planks at x 60/228/396/564 (h 250); beam y 26 h 12; wainscot y 190 h 60, rail y 186 h 6; `accepted-glow` 300×300 at (20,−20); happy Lina 192×204 at (60,66) (body + braids + happy eyes + smile); stars at (44,70) 32, (236,52) 28, (258,140) 24, (30,170) 24; counter y 252 h 80 (front +16 h 64, joints every 80 from 50 h 58, top 16, edge 5, outline 3); contract 290 px wide at (320,60) rotated −2°: parchment, 2 px parchment-shade border, drop shadow, padding 18×20, gap 6: "CONTRATO DE PEDIDO" overline ink, title Pixel/Title 22 ink, rows space-between (label Caption 12 / value Body/Medium 13): Aventureiro → equipped title or username, Alvo → target game name (row hidden without target), Rank → "B · +250 XP"; signature block padding-top 14: 1 px ink line + "Assinatura da recepção — Lina" caption. Stamp "ACEITO" at (391,196) rotated 12°: 4 px stamp border, radius 4, padding 4×12, Silkscreen bold 30 tracking 1.8, opacity .92. XP chip at (210,24): dialog-bg, 2 px gold border, radius 4, padding 4/10/4/8, gap 6, coin 20 + "+250 XP ao concluir" Pixelify bold 13 gold. Dialogue below (left 19, top 355, width 600): padding 24/20/16, gap 14, text Lina accept line with gold target name, actions right-aligned gap 8: ghost on dark ("Voltar ao quadro": 1 px line-strong border, muted text) and primary "Ver contratos ativos" (switches to the Accepted tab). Name plate "Lina".

### D7. Copy
All strings under `guild.*` in `en.json`/`pt-BR.json` (pt-BR from Figma, en translated): header, tabs, license labels, card buttons, tags, Lina options, early access, errors, accepted state, claim celebration, rewards panel, `guild.templates.<key>.{title,description}` (6 keys, table 11.1 of the handoff, pt-BR text from Figma where it differs: forgotten_relic "Zere um jogo que está no seu backlog há mais de um ano sem ser tocado.", short_caravan "Termine um jogo com menos de 8 horas de duração média.", captains_log "Escreva uma review de um jogo que você zerou este mês. Os outros aventureiros agradecem!", on_duty_critic "Escreva 3 reviews esta semana"), `guild.lina.<trigger>` (warmer Figma lines: weekly_board_refreshed "Bom dia! O leite tá fresquinho e o quadro de pedidos também.", stale_backlog_game "Que bom te ver de novo por aqui! Reparei que {{gameName}} está parado no seu backlog desde {{sinceYear}}…", returning_after_inactivity "Olha só quem voltou! A guilda estava quieta sem você por aqui.", contract_claimed "Você zerou! Deixa eu carimbar isso aqui… pronto, a recompensa é sua.", contract_accepted "Contrato assinado! Quando zerar {{gameName}}, volta aqui no balcão — vou deixar sua recompensa separadinha." with a no-game variant, contract_ready_to_claim, default), `guild.rank.<E..S>`, `guild.rewards.<key>` + generic per kind, `navigation.guild`, notification text. Interpolated game names are passed as separate segments for gold highlight (use i18next interpolation markers split by a helper, not HTML).

### D8. Notifications
`getNotificationContent` handles `guild.contract-ready` (leading = game cover when `preview.game`, else the Guild shield icon) and `navigateToNotificationTarget` routes `target.type === "guild"` to `/guild?tab=accepted`. Web page reads `?tab=` in `getServerSideProps`; mobile reads it via `useSearchParameters`.

### D9b. Component contracts (so parallel implementers agree)
All paths under `packages/ui/src/components/guild/`. DTO names are whatever `pnpm wrapper:generate` produces for the Guild schemas (read `packages/wrapper/src/server/models/*Guild*`).
- `util/getLinaLine.ts`: `export type LinaSegment = { text: string; highlight?: boolean }`; `getLinaLine(lina: { trigger: string; pose?: string; context?: Record<string, unknown> } | null | undefined, t): LinaSegment[]`. Gold highlight for `gameName`/`targetGameName`.
- `scene/assets.ts`: `export const GUILD_ASSETS = { lantern: { src: "/img/guild/lantern.svg", width: 48, height: 66 }, … } as const; export type GuildAssetName = keyof typeof GUILD_ASSETS`.
- `scene/GuildIcon.tsx`: `GuildIcon({ name: GuildAssetName; size?: number /* scales keeping ratio */; className?; alt? })`.
- `scene/PixelButton.tsx`: `PixelButton({ variant: "primary" | "ghost" | "ghost-dark"; size?: "sm" | "md"; …Mantine ButtonProps / polymorphic component })`.
- `scene/RankStamp.tsx`: `RankStamp({ rank: string; size?: number /* default 46 */ })`; `scene/CategoryTag.tsx`: `CategoryTag({ category: "library" | "event" | "weekly" | "gamenode" | "goal"; children })`; `scene/GameChip.tsx`: `GameChip({ gameId?: number; name: string; coverUrl?: string | null; meta?: string })`.
- `scene/GuildFonts.tsx`: `GuildFonts()` renders the `@font-face` `<style>`. `guild.module.css` exports `.root` (palette variables + `font-family` scopes), `.pixel`, `.stamp`, and keyframe classes.
- `scene/useTypewriter.ts`: `useTypewriter(segments: LinaSegment[], { cps?: number; startDelayMs?: number }) → { revealed: number; total: number; isTyping: boolean; complete(): void }` (respects reduced motion).
- `scene/LinaSprite.tsx`: `LinaSprite({ pose: "neutral" | "happy"; isTalking: boolean; scale: 5 | 6; hop?: boolean })`.
- `scene/LinaDialogue.tsx`: `LinaDialogue({ speaker: string; segments: LinaSegment[]; options?: { id: string; label: string; onSelect(): void }[]; actions?: ReactNode; variant: "desktop" | "mobile" | "modal"; startDelayMs?: number; onTypingChange?(typing: boolean): void; collapsed?: boolean; onExpand?(): void })`.
- `scene/GuildScene.tsx`: `GuildScene({ variant: "desktop" | "mobile"; pose; isTalking; showAlert: boolean; dialogue?: ReactNode /* desktop overlay, positioned per D6 */ })`.
- `view/GuildAcceptedState.tsx`: `GuildAcceptedState({ opened: boolean; onClose(): void; contract: <contract DTO>; lina: <lina DTO> | null; onViewContracts(): void })`.
- `view/GuildClaimCelebration.tsx`: `GuildClaimCelebration({ opened: boolean; onClose(): void; result: <claim response DTO> | null })`.
- `view/GuildContractList.tsx`: `GuildContractList({ tab: "accepted" | "completed" })` (owns claim/abandon + celebration). `view/GuildRewardsPanel.tsx`: `GuildRewardsPanel()`.
- `view/GuildView.tsx`: `GuildView({ supporterHref: string; signInHref?: string /* default: the auth path hook from `context/UIProvider.tsx` (`authPath ?? "/auth"`) */; initialTab?: "board" | "accepted" | "completed" })`, exported from `@repo/ui`.
- `view/GuildEarlyAccess.tsx`: `GuildEarlyAccess({ supporterHref: string })`; `view/GuildSignInPrompt.tsx`: `GuildSignInPrompt({ signInHref: string })`.

### D9. Testing
`apps/mobile` vitest (jsdom) tests: hooks (keys, `enabled` gating, early-access 403 handling switching access), `getQuestCopy`/`getLinaLine`/`formatLicenseNumber`/rank progress utils, `GuildView` states (guest, no access, hall), quest card accept with target picker body, accepted state render, notification content/navigation for `guild.contract-ready`, reduced-motion typewriter. Final acceptance is the integrated-browser walkthrough (task group 8).

### D10. Hand-off revision (2026-11-22)
The server hand-off (`reference/server-handoff.md`) was revised after PR #270 review. Client impact:
- Wrapper: `GuildBoardQuestDto.contractDurationDays` (number | null) and `ClaimGuildContractResponseDto.globalXpAwarded`; regenerate from `/home/cassi/.t3/worktrees/game-node-server/t3-280662c7-f2da079f954e9d24/server_swagger.json`.
- Deadlines: a board quest's `expiresAt` is the accept deadline; a contract's `expiresAt` is its own deadline (`acceptedAt` + 21 d library / 7 d weekly and gamenode; event `endsAt`). Quest cards show `contractDurationDays` for non-event quests (`guild.board.duration`, pluralized `{{count}}`); active contract rows show time left until the contract `expiresAt` (`guild.contracts.deadline`, reuse `formatTimeLeft`), never for `ready_to_claim`.
- Claim: `xpAwarded` is Guild XP; `globalXpAwarded` is account XP. The celebration counter stays on Guild XP (`guild.claim.xp` becomes "+{{xp}} Guild XP"), with a separate line `guild.claim.accountXp` hidden at `0`. Lina's `contract_claimed` copy keeps not naming numbers.
- Templates: `double_feature` (weekly, C, `targetCount: 2`, never a target) and `quick_take` (gamenode, E) get `guild.templates.*` copy (pt-BR from table 11.1). The accept flow already opens the picker only for `requiresTargetGame`; additionally never send `targetGameId` when `targetCount > 1`.
- Progress copy (7.6): `guild.board.rules.review` ("Only reviews of 80+ characters count") on `write_review` cards and `guild.board.rules.finish` ("Only games you mark as finished after accepting count; imports and re-finishes don't") on `finish_game` cards (caption line under the description) and on active `finish_game` rows with `progressCurrent === 0`.
- Review composer hint: `view/GuildReviewLengthHint.tsx` (`GuildReviewLengthHint({ length: number })`, exported) reads `useGuildAccess` + `useGuildContracts("accepted")` (`GET /v1/guild/contracts?tab=accepted`, already cached by the Accepted tab; queries stay gated on `hasAccess`) and renders only when the flattened pages contain an `active` `write_review` contract: `{{count}}/80` plus `guild.reviewHint.short` / `guild.reviewHint.ok`. It must not call `GET /v1/guild` (the overview lazily creates the profile, runs the contract evaluator and updates `lastVisitedAt`, which would register a Guild visit and swallow Lina's `returning_after_inactivity` greeting). `GameInfoReviewEditorView` and `CollectionEntryFormReviewPanel` mount it with the trimmed plain-text length of the editor HTML (strip tags, decode entities through a detached element or `DOMParser`).
- Cosmetics: labels for `title_relic_hunter`, `title_night_owl`, `title_completionist`, `frame_ember_rune`, `frame_moonlit_ivy`, `frame_gilded_compass` (table 11.4). `GuildLicenseCard` maps each of the five frame keys to its own class; the three new frame classes live in the theme-exempt palette block of `guild.module.css` (ember: warm orange/red, moonlit ivy: pale green/silver, gilded compass: gold) like the existing two.
- Notifications: `guild.contract-expiring` renders like `guild.contract-ready` with `notifications.guild.contractExpiring` / `contractExpiringGame`; navigation already routes `target.type === "guild"`.
- Admin endpoints (`guild_reward_identity_locked`, event `endsAt` propagation) stay out of scope: there is no Guild admin UI in the clients.

## Risks / Trade-offs

- [Scene absolute layout at intermediate widths] → 1280 px stage with capped-left anchoring (at most 56 px cropped on the left) and the dialogue anchored to the right edge; below `md` switch to the mobile composition.
- [Talk/typewriter timers leaking or re-rendering the whole hall] → keep typewriter state local to `LinaDialogue`; expose `isTyping` to `LinaSprite` via props only; clear intervals on unmount.
- [Supporter lapses mid-session] → global 403 mapping in Guild hooks (spec guild-access).
- [Server copy vs. client copy drift] → client renders by keys; unknown keys degrade to generic labels.
- [Web `staleTime: Infinity`] → explicit Guild `staleTime`/`refetchOnMount` and invalidation after every mutation.
- [Fonts add ~140 KB] → loaded only on Guild screens via `GuildFonts` with `font-display: swap`.

## Migration Plan

Ship clients after the server PR #270 is deployed. Launch with `GUILD_ACCESS_MODE=supporters`; going public is a server env change only. Rollback: hide the nav entries (the route keeps working behind the access gate).
