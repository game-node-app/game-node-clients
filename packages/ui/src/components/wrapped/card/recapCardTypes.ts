import type { RecapCardFormat } from "#@/components/wrapped/card/recapCardFormats";
import type { RecapCustomization } from "#@/components/wrapped/card/recapCustomization";
import type { RecapFigures } from "#@/components/wrapped/util/recapFigures";
import type {
  Game,
  ProfileMetricsSummaryResponseDto,
} from "@repo/wrapper/server";

/** Data every summary template (poster, dash, bento, feed) draws from. */
export interface RecapCardProps {
  format: RecapCardFormat;
  userId: string;
  /** Display name, used as the headline of the poster. */
  username?: string;
  periodText: string;
  /** Rolling window, used for the "in the last 7 days" sentence of Dash. */
  period?: "week" | "month" | "year";
  summary: ProfileMetricsSummaryResponseDto;
  figures: RecapFigures;
  /** Loaded games for `summary.topGames`, in any order. */
  games: Game[];
  /** The user's choices for art, accent and the optional figures. */
  custom?: RecapCustomization;
}

/** The top games in rank order, paired with their loaded `Game`. */
export function getRankedGames(
  summary: ProfileMetricsSummaryResponseDto,
  games: Game[],
) {
  return summary.topGames.map((top) => ({
    game: games.find((game) => game.id === top.gameId),
    seconds: top.totalPlaytimeSeconds,
  }));
}
