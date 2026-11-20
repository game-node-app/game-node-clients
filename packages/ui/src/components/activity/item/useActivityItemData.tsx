import {
  ObtainedAchievementActivityContent,
  useCollection,
  useCollectionEntry,
  useGame,
  useObtainedGameAchievementActivity,
  usePost,
  useReview,
  useUserProfile,
} from "#@/components";
import { useTranslation } from "@repo/locales";
import { Activity } from "@repo/wrapper/server";
import { useMemo } from "react";
import { match } from "ts-pattern";
import type { ActivityItemData } from "../types";

/**
 * Everything an activity row shows (who, what, which game), shared by the
 * default `ActivityItem` and theme presenters such as `XboxActivityItem`.
 *
 * Relations embedded in `ActivityResponseDto` are used as-is; the matching
 * query is only enabled when the field is absent, so theme rows fetch exactly
 * what the default row fetches.
 */
export function useActivityItemData(activity: ActivityItemData) {
  const { t } = useTranslation();

  const hasEmbeddedProfile = activity.profile !== undefined;
  const hasEmbeddedCollectionEntry = activity.collectionEntry !== undefined;
  const hasEmbeddedCollection = activity.collection !== undefined;
  const hasEmbeddedReview = activity.review !== undefined;
  const hasEmbeddedPost = activity.post !== undefined;
  const hasEmbeddedGameAchievementActivity =
    activity.obtainedGameAchievementActivity !== undefined;
  const hasEmbeddedGame = activity.game !== undefined;

  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId, {
    enabled: !hasEmbeddedCollectionEntry,
  });
  const collectionQuery = useCollection(activity.collectionId, {
    enabled: !hasEmbeddedCollection,
  });
  const reviewQuery = useReview(activity.reviewId, {
    enabled: !hasEmbeddedReview,
  });
  const postQuery = usePost(activity.postId, {
    enabled: !hasEmbeddedPost,
  });
  const profileQuery = useUserProfile(activity.profileUserId, {
    enabled: !hasEmbeddedProfile,
  });
  const gameAchievementActivityQuery = useObtainedGameAchievementActivity(
    activity.obtainedGameAchievementActivityId,
    { enabled: !hasEmbeddedGameAchievementActivity },
  );

  const profile = hasEmbeddedProfile ? activity.profile : profileQuery.data;
  const collectionEntry = hasEmbeddedCollectionEntry
    ? activity.collectionEntry
    : collectionEntryQuery.data;
  const collection = hasEmbeddedCollection
    ? activity.collection
    : collectionQuery.data;
  const review = hasEmbeddedReview ? activity.review : reviewQuery.data;
  const post = hasEmbeddedPost ? activity.post : postQuery.data;
  const gameAchievementActivity = hasEmbeddedGameAchievementActivity
    ? activity.obtainedGameAchievementActivity
    : gameAchievementActivityQuery.data;

  const unlockedTier = activity.obtainedAchievement?.tier ?? 0;
  const unlockedAchievement = activity.obtainedAchievement?.definition;

  const gameId =
    collectionEntry?.gameId ||
    review?.gameId ||
    post?.gameId ||
    gameAchievementActivity?.externalGame?.gameId ||
    activity.game?.id;

  const actionText = useMemo(() => {
    return match(activity.type)
      .with(Activity.type.COLLECTION_ENTRY, () => {
        return (
          <>
            {t("activity.items.addedTo", {
              collection: collection?.name ?? "",
            })}
          </>
        );
      })
      .with(Activity.type.REVIEW, () => {
        return <>{t("activity.items.reviewed")}</>;
      })
      .with(Activity.type.POST, () => {
        return <>{t("activity.items.postedAbout")}</>;
      })
      .with(Activity.type.FOLLOW, () => {
        return <>{t("activity.items.followed")}</>;
      })
      .with(Activity.type.OBTAINED_GAME_ACHIEVEMENT, () => (
        <ObtainedAchievementActivityContent
          activity={gameAchievementActivity ?? undefined}
          hasEmbeddedGame={hasEmbeddedGame}
        />
      ))
      .with(Activity.type.ACHIEVEMENT_UNLOCKED, () =>
        unlockedAchievement
          ? t("activity.items.achievementUnlocked", {
              name: unlockedAchievement.name ?? "",
              tier: unlockedTier,
            })
          : t("activity.items.unknown"),
      )
      .otherwise(() => {
        return t("activity.items.unknown");
      });
  }, [
    activity.type,
    collection?.name,
    gameAchievementActivity,
    hasEmbeddedGame,
    unlockedAchievement,
    unlockedTier,
    t,
  ]);

  const gameQuery = useGame(
    gameId,
    {
      relations: {
        cover: true,
      },
    },
    "off",
    { enabled: !hasEmbeddedGame },
  );

  const game = hasEmbeddedGame ? activity.game : gameQuery.data;

  // A review activity opens the game page focused on that review.
  const gameHref = review
    ? `/game/${gameId}?reviewId=${review.id}`
    : `/game/${gameId}`;

  return {
    actionText,
    game,
    gameHref,
    gameId,
    profile,
    review,
    unlockedAchievement,
    unlockedTier,
  };
}
