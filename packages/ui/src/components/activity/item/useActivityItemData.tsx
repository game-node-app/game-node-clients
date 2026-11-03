import {
  ObtainedAchievementActivityContent,
  useAchievementsV2,
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

/**
 * Everything an activity row shows (who, what, which game), shared by the default ActivityItem and theme presenters.
 */
export function useActivityItemData(activity: Activity) {
  const { t } = useTranslation();
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const postQuery = usePost(activity.postId);
  const profileQuery = useUserProfile(activity.profileUserId);
  const gameAchievementActivityQuery = useObtainedGameAchievementActivity(
    activity.obtainedGameAchievementActivityId,
  );

  const unlockedTier = activity.obtainedAchievement?.tier ?? 0;
  const achievementsQuery = useAchievementsV2(activity.profileUserId);
  const unlockedAchievement = achievementsQuery.data?.find(
    (a) => a.id === activity.obtainedAchievement?.achievementId,
  );

  const gameId =
    collectionEntryQuery.data?.gameId ||
    reviewQuery.data?.gameId ||
    postQuery.data?.gameId ||
    gameAchievementActivityQuery.data?.externalGame.gameId;

  const actionText = useMemo(() => {
    return match(activity.type)
      .with(Activity.type.COLLECTION_ENTRY, () => {
        return (
          <>
            {t("activity.items.addedTo", {
              collection: collectionQuery.data?.name ?? "",
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
          activity={gameAchievementActivityQuery.data}
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
    collectionQuery.data?.name,
    gameAchievementActivityQuery.data,
    unlockedAchievement,
    unlockedTier,
    t,
  ]);

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const gameHref = reviewQuery.data
    ? `/game/${gameId}?reviewId=${reviewQuery.data.id}`
    : `/game/${gameId}`;

  return {
    actionText,
    gameId,
    gameQuery,
    gameHref,
    reviewQuery,
    profileQuery,
    unlockedAchievement,
    unlockedTier,
  };
}
