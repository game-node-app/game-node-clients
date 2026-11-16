import type { RecapCardFormat } from "#@/components/wrapped/card/recapCardFormats";
import type { RecapCustomization } from "#@/components/wrapped/card/recapCustomization";
import type { RecapFigures } from "#@/components/wrapped/util/recapFigures";
import type {
  Game,
  ProfileMetricsSummaryResponseDto,
} from "@repo/wrapper/server";

/**
 * A photo or clip the user picked to be the card's background, drawn in place
 * of the blurred cover art.
 */
export interface RecapCardMedia {
  /** A photo, as a data URL. */
  photoSrc?: string | null;
  /**
   * The card is the overlay of a video export: the media area is left
   * transparent (the encoder draws the clip underneath) under the overlay.
   */
  video?: boolean;
  /** How dark the overlay over the photo or clip is, from 0 to 1. */
  overlayOpacity?: number;
}

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
  /** Photo or clip that replaces the blurred cover art as the background. */
  media?: RecapCardMedia;
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
