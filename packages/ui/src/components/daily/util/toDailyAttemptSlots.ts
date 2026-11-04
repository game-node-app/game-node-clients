export type DailyAttemptSlot =
  | "correct"
  | "franchise"
  | "wrong"
  | "skipped"
  | "hint"
  | "empty";

/**
 * One slot per attempt, in the same order as the share text: the guesses, then
 * the hint (it costs an attempt), then the unused attempts.
 */
export function toDailyAttemptSlots(
  results: string[],
  maxAttempts: number,
  hintUsed = false,
): DailyAttemptSlot[] {
  const used: DailyAttemptSlot[] = results.map((result) =>
    result === "correct" || result === "franchise" || result === "skipped"
      ? result
      : "wrong",
  );
  if (hintUsed) used.push("hint");
  const unused = Array<DailyAttemptSlot>(Math.max(maxAttempts - used.length, 0));
  return [...used, ...unused.fill("empty")];
}
