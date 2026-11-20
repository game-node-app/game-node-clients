import {
  AchievementBadge,
  ActivityItemLikes,
  GameRating,
  UserAvatar,
} from "#@/components";
import type { ActivityItemProps } from "#@/components/activity/types";
import { useActivityItemData } from "#@/components/activity/item/useActivityItemData";
import { GAME_COVER_PLACEHOLDER } from "#@/components/game/hooks/useGameCoverImage";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { Link } from "#@/util";
import { Group } from "@mantine/core";
import { AchievementIconDto, Activity } from "@repo/wrapper/server";
import classes from "./XboxActivityItem.module.css";

/**
 * Xbox activity feed row: cover, a one-line title and who did what under it,
 * then the review rating and the same likes action as the default item.
 *
 * Route targets come from the shared `useActivityItemData`: a review row opens
 * the game page focused on that review, exactly like the default `ActivityItem`.
 */
const XboxActivityItem = ({
  activity,
  variant = "default",
}: ActivityItemProps) => {
  const {
    actionText,
    game,
    gameHref,
    gameId,
    profile,
    review,
    unlockedAchievement,
    unlockedTier,
  } = useActivityItemData(activity);

  const isAchievementUnlocked =
    activity.type === Activity.type.ACHIEVEMENT_UNLOCKED;
  const coverUrl =
    getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_SMALL_2X) ??
    GAME_COVER_PLACEHOLDER;
  const gameName = game?.name;

  return (
    <div className={classes.row} data-xbox-activity data-variant={variant}>
      <span className={classes.cover}>
        {isAchievementUnlocked ? (
          <AchievementBadge
            icon={
              unlockedAchievement?.icon as AchievementIconDto | null | undefined
            }
            tier={unlockedTier}
            size={44}
          />
        ) : game ? (
          <img
            className={classes.coverImage}
            src={coverUrl}
            alt={""}
            loading={"lazy"}
          />
        ) : (
          <UserAvatar
            userId={activity.profileUserId}
            profile={activity.profile}
            size={44}
          />
        )}
      </span>

      <div className={classes.body}>
        {isAchievementUnlocked || gameId == null ? (
          <span className={classes.title}>{actionText}</span>
        ) : (
          <Link href={gameHref} className={classes.title}>
            {gameName ?? actionText}
          </Link>
        )}

        <div className={classes.meta}>
          <UserAvatar
            userId={activity.profileUserId}
            profile={activity.profile}
            size={18}
          />
          <Link
            href={`/profile/${activity.profileUserId}`}
            className={classes.user}
          >
            {profile?.username}
          </Link>
          {!isAchievementUnlocked && gameName && (
            <span className={classes.action}>{actionText}</span>
          )}
        </div>
      </div>

      {review && (
        <span className={classes.rating}>
          <GameRating size={"xs"} value={review.rating} />
        </span>
      )}

      <Group className={classes.actions}>
        <ActivityItemLikes activity={activity} />
      </Group>
    </div>
  );
};

export { XboxActivityItem };
