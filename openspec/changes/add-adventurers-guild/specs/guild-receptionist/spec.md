# Spec Delta

## Purpose

Bring Lina, the Guild receptionist NPC, to life: her dialogue chosen from server triggers, her poses and the animated pixel-art hall scene, with a reduced-motion fallback.

## ADDED Requirements

### Requirement: Trigger-driven dialogue
Lina's dialogue SHALL be chosen from `lina.trigger` of `GET /v1/guild` (and of accept/claim responses), localized on the client from stable keys, and interpolate the trigger context: `stale_backlog_game` names `gameName` and `sinceYear`, `contract_ready_to_claim`/`contract_accepted` name `targetGameName` (falling back to the contract's target game), `returning_after_inactivity` may use `inactiveDays`, and `contract_claimed` uses `xpAwarded` and the rank change. Game names inside the dialogue SHALL be highlighted in the Guild gold color. Unknown triggers SHALL use the `default` line.

#### Scenario: Stale backlog greeting
- **WHEN** the overview returns `lina: { trigger: "stale_backlog_game", context: { gameName: "Hollow Knight", sinceYear: 2023 } }`
- **THEN** Lina says (pt-BR) that Hollow Knight has been in the backlog since 2023, with "Hollow Knight" highlighted

#### Scenario: Ready contract greeting
- **WHEN** the trigger is `contract_ready_to_claim`
- **THEN** Lina uses the happy pose and her line invites the user to turn in the contract

### Requirement: Dialogue options
The dialogue box SHALL offer three options navigable by pointer and keyboard (arrow keys + Enter) with a pixel cursor on the focused option: "Show me the quest board" scrolls to and focuses the board tab, "Any quicker quest?" switches the board to quick quests, and "See you, Lina" closes the dialogue to a compact name plate that reopens it. Activating the board option or opening the board SHALL call `POST /v1/guild/board/seen` once when `hasUnseenBoard` is true, which hides the `!` balloon.

#### Scenario: Board seen
- **WHEN** `hasUnseenBoard` is true and the user chooses "Show me the quest board"
- **THEN** `POST /v1/guild/board/seen` is called once and the `!` balloon disappears

### Requirement: Poses and sprite
Lina SHALL be rendered from the layered pixel-art sprite (body, braids, closed eyes, open mouth, happy eyes, smile) at an integer scale (6× desktop, 5× mobile) with `image-rendering: pixelated`. Pose SHALL follow `lina.pose`: `neutral` uses the base face and `happy` adds happy eyes and smile. The `!` balloon SHALL appear only when `hasUnseenBoard` is true.

#### Scenario: Happy pose
- **WHEN** the reception pose is `happy`
- **THEN** the happy-eyes and smile layers are visible and the blink/talk layers are not used

### Requirement: Scene and dialogue animations
The client SHALL implement the Figma animation table: breathing (whole sprite moves 1 sprite pixel up and back in hold steps, 1.2 s loop), braids (same, 100 ms later), blink (closed-eyes layer for 120 ms about every 3.5 s), talk (open-mouth layer alternating every 140 ms only while the text types), typewriter (~35 characters/s), `!` balloon (rises 6 px and back, 0.8 s, ease in-out), lantern glow (opacity 100 → 70 → 100 %, 1.6 s, linear), `▼` next indicator (blinks every 0.5 s once typing ends), quest cards entering (rise 16 px with fade, 60 ms stagger, ease out) and the accepted stamp (scale 2.2 → 1 in 260 ms, ease-out-back, with a 2 px shake of the contract). Pressing the dialogue or Enter while typing SHALL complete the text at once.

#### Scenario: Typing then idle
- **WHEN** a new Lina line starts
- **THEN** characters appear at about 35 per second, the mouth alternates every 140 ms, and when the line ends the mouth closes and `▼` starts blinking

#### Scenario: Accepted stamp
- **WHEN** the accepted state opens
- **THEN** the `ACEITO` stamp scales from 2.2 to 1 in about 260 ms and the contract shakes by 2 px once

### Requirement: Reduced motion
When `prefers-reduced-motion: reduce` is set, breathing, braids, shake, card entrance, balloon bob, sparkles and lantern flicker SHALL NOT animate, and every dialogue line SHALL appear complete immediately.

#### Scenario: Reduced motion
- **WHEN** the user has reduced motion enabled and opens the Guild
- **THEN** Lina is static, the text is shown in full immediately and the cards appear without entrance animation
