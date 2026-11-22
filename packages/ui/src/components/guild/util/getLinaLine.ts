import type { TFunction } from "i18next";

/**
 * A piece of Lina's dialogue. `highlight` marks the gold game names of design
 * D7 (`gameName`/`targetGameName`), so views render them as separate spans
 * instead of injecting HTML.
 */
export type LinaSegment = { text: string; highlight?: boolean };

/**
 * Structural shape of `LinaReceptionDto`; accept/claim responses use the same
 * trigger/pose/context payload.
 */
export interface GuildLinaSource {
  trigger: string;
  pose?: string;
  context?: Record<string, unknown> | null;
}

const SUPPORTED_TRIGGERS = new Set([
  "contract_accepted",
  "contract_claimed",
  "contract_ready_to_claim",
  "returning_after_inactivity",
  "weekly_board_refreshed",
  "stale_backlog_game",
  "default",
]);

const GAME_TRIGGERS = new Set([
  "contract_accepted",
  "contract_ready_to_claim",
  "stale_backlog_game",
]);

const GAME_MARKERS = ["{{gameName}}", "{{targetGameName}}"];

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function sanitizeLine(line: string): string {
  return line
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitOnGameName(line: string, gameName: string): LinaSegment[] {
  const marker = GAME_MARKERS.find((candidate) => line.includes(candidate));
  if (!marker) return [{ text: sanitizeLine(line) }];

  const parts = line.split(marker);
  const segments: LinaSegment[] = [];
  parts.forEach((part, index) => {
    if (index > 0) segments.push({ text: gameName, highlight: true });
    if (part.length > 0) segments.push({ text: part });
  });

  return segments.length > 0 ? segments : [{ text: gameName, highlight: true }];
}

/**
 * Localizes Lina's trigger-driven line into rich segments. Unknown triggers use
 * `guild.lina.default`, and a missing translation of the trigger also falls
 * back to the default line.
 */
export function getLinaLine(
  lina: GuildLinaSource | null | undefined,
  t: TFunction,
): LinaSegment[] {
  const trigger =
    lina?.trigger && SUPPORTED_TRIGGERS.has(lina.trigger)
      ? lina.trigger
      : "default";
  const context = lina?.context ?? {};
  const gameName = GAME_TRIGGERS.has(trigger)
    ? (readString(context.targetGameName) ?? readString(context.gameName))
    : undefined;

  const options: Record<string, unknown> = { ...context };
  delete options.gameName;
  delete options.targetGameName;

  const candidateKeys: string[] = [];
  if (trigger === "contract_accepted" && !gameName) {
    candidateKeys.push("guild.lina.contract_accepted_no_game");
  }
  candidateKeys.push(`guild.lina.${trigger}`);
  candidateKeys.push("guild.lina.default");

  let line: string | undefined;
  for (const key of candidateKeys) {
    const translated = translate(t, key, options);
    if (translated !== key) {
      line = translated;
      break;
    }
  }

  if (!line) return [{ text: "" }];

  if (!gameName) return [{ text: sanitizeLine(line) }];

  return splitOnGameName(line, gameName);
}
