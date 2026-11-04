/** Opening a puzzle saves an in-progress play with no attempts; that still counts as not played. */
export const startedDailyResult = <
  T extends { status: string; attempts: number },
>(
  result?: T,
) =>
  result?.status === "in_progress" && result.attempts === 0
    ? undefined
    : result;
