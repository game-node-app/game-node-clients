export interface DailyShareEntry {
  modeLabel: string;
  /** Replaces "<modeLabel> #<number>", e.g. "Challenge of the week #7". */
  title?: string;
  number: number;
  maxAttempts: number;
  /** Server guess results: "correct" | "franchise" | "wrong" | "skipped". */
  results: string[];
  hintUsed?: boolean;
}

const EMOJI: Record<string, string> = { correct: "🟩", franchise: "🟨" };

const toLine = ({
  modeLabel,
  title,
  number,
  maxAttempts,
  results,
  hintUsed,
}: DailyShareEntry) => {
  const used = results.map((result) => EMOJI[result] ?? "🟥");
  if (hintUsed) used.push("💡");
  const unused = "⬜".repeat(Math.max(maxAttempts - used.length, 0));
  const label = title ?? `${modeLabel} #${number}`;
  return `${label} ${used.join("")}${unused}`;
};

/** One line per mode, so the same text works for one mode or the whole day. */
export const DAILY_SHARE_URL = "https://gamenode.app/daily";

export function buildDailyShareText(entries: DailyShareEntry[], url: string) {
  return ["🕹️ GameNode Daily", ...entries.map(toLine), url].join("\n");
}
