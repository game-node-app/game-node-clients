import { useUserId } from "#@/components/auth/hooks/useUserId";
import { getLocalizedCollectionEntryStatusName } from "#@/components/collection/collection-entry/util/getCollectionEntryStatusName";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { useGameAchievementsV2 } from "#@/components/game/achievement/hooks/useGameAchievementsV2";
import { useGame } from "#@/components/game/hooks/useGame";
import { useOwnedPlatformIcons } from "#@/components/game/hooks/useOwnedPlatformIcons";
import {
  type GameShareData,
  getGameCredit,
  getPlaytimeHours,
  pickAchievementProgress,
  roundRatingToHalf,
} from "#@/components/game/share/gameShareModel";
import { usePlaytimeForGame } from "#@/components/playtime/hooks/usePlaytimeForGame";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useReviewForUserIdAndGameId } from "#@/components/review/hooks/useReviewForUserIdAndGameId";
import { useTranslation } from "@repo/locales";
import type { GameRepositoryFindOneDto } from "@repo/wrapper/server";

/**
 * Cover and wide art for the card, platforms and the companies for the credit.
 * Kept local (instead of reusing the game page's DTO) because `GameInfoView`
 * renders the actions that open this screen, and importing it back would make
 * a cycle evaluated at module load.
 */
const GAME_SHARE_DTO: GameRepositoryFindOneDto = {
  relations: {
    cover: true,
    artworks: true,
    screenshots: true,
    platforms: true,
    involvedCompanies: { company: true },
  },
};

/**
 * Gathers what the share card can show for a game.
 *
 * The share screen is open to everyone, so every personal source (profile,
 * review, library entry, playtime, achievements) is disabled while signed out
 * and simply yields `null`. A signed-in viewer who does not own the game, or
 * never reviewed it, gets the same result for the missing parts. Nothing here
 * assumes the viewer has a library entry or a review.
 */
export function useGameShareData(gameId: number): {
  data: GameShareData;
  isLoading: boolean;
  /**
   * A signed-in viewer's own data (review, library entry, playtime,
   * achievements) is still being fetched, so blocks that depend on it may be
   * missing for now. Always `false` while signed out, and settled (success,
   * empty or failed) requests no longer count, so sharing never waits on them.
   */
  isPersonalLoading: boolean;
} {
  const { t } = useTranslation();
  const userId = useUserId();
  const signedIn = !!userId;

  const gameQuery = useGame(gameId, GAME_SHARE_DTO);
  const game = gameQuery.data ?? undefined;

  const profileQuery = useUserProfile(userId, { enabled: signedIn });
  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);
  const entryQuery = useOwnCollectionEntryForGameId(gameId, signedIn);
  const playtimeQuery = usePlaytimeForGame(userId, gameId);
  const achievementsQuery = useGameAchievementsV2(userId, gameId, true, {
    enabled: signedIn,
  });
  const iconsQuery = useOwnedPlatformIcons(
    gameId,
    signedIn ? entryQuery.data : undefined,
  );

  const username = profileQuery.data?.username;
  const rating = reviewQuery.data?.rating;
  const entry = signedIn ? entryQuery.data : undefined;

  const data: GameShareData = {
    game,
    name: game?.name ?? "",
    credit: getGameCredit(game),
    handle: signedIn && username ? `@${username}` : null,
    rating: signedIn && rating != null ? roundRatingToHalf(rating) : null,
    playtimeHours: signedIn ? getPlaytimeHours(playtimeQuery.data) : null,
    achievements: signedIn
      ? pickAchievementProgress(achievementsQuery.data)
      : null,
    platformIcons: signedIn ? (iconsQuery.data ?? []) : [],
    statusLabel: entry
      ? getLocalizedCollectionEntryStatusName(entry.status, t)
      : null,
  };

  const isPersonalLoading =
    signedIn &&
    [
      profileQuery,
      reviewQuery,
      entryQuery,
      playtimeQuery,
      achievementsQuery,
      iconsQuery,
    ].some((query) => query.isLoading);

  return { data, isLoading: gameQuery.isLoading, isPersonalLoading };
}
