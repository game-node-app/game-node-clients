import type { ProfileMetricsSummaryResponseDto } from "@repo/wrapper/server";

export type RecapFigures = {
  /** Hours played in the period, rounded to one decimal. */
  hours: number;
  /** Games with playtime in the period. */
  games: number;
  /**
   * Change in time played against the previous period, in whole percent.
   * `null` when the previous period has no playtime (nothing to compare to).
   */
  changePercent: number | null;
  /** `false` when nothing was played, so the card should not be shared. */
  hasActivity: boolean;
};

const roundHours = (seconds: number) => Math.round((seconds / 3600) * 10) / 10;

/** "+82%", "-15%", "0%", or "-" when there is no previous period to compare to. */
export function formatRecapChange(changePercent: number | null): string {
  if (changePercent == null) return "-";
  return `${changePercent > 0 ? "+" : ""}${changePercent}%`;
}

export function getRecapFigures(
  summary: Pick<ProfileMetricsSummaryResponseDto, "current" | "previous">,
): RecapFigures {
  const { current, previous } = summary;

  return {
    hours: roundHours(current.totalPlaytimeSeconds),
    games: current.totalGames,
    changePercent:
      previous.totalPlaytimeSeconds > 0
        ? Math.round(
            ((current.totalPlaytimeSeconds - previous.totalPlaytimeSeconds) /
              previous.totalPlaytimeSeconds) *
              100,
          )
        : null,
    hasActivity: current.totalPlaytimeSeconds > 0,
  };
}
