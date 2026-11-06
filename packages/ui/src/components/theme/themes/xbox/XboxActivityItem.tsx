import {
  AchievementBadge,
  ActivityItemComments,
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  UserAvatar,
} from "#@/components";
import { useActivityItemData } from "#@/components/activity/item/useActivityItemData";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { Link } from "#@/util";
import { Group } from "@mantine/core";
import { Activity } from "@repo/wrapper/server";

/** Xbox feed row: cover, one-line title, who/what underneath; styled in xbox/theme.css. */
const XboxActivityItem = ({ activity }: ActivityItemProps) => {
  const {
    actionText,
    gameId,
    gameQuery,
    gameHref,
    reviewQuery,
    profileQuery,
    unlockedAchievement,
    unlockedTier,
  } = useActivityItemData(activity);

  const isAchievement = activity.type === Activity.type.ACHIEVEMENT_UNLOCKED;
  const gameName = gameId ? gameQuery.data?.name : undefined;

  return (
    <div className={"gn-activity"}>
      <span className={"gn-activity-cover"}>
        {isAchievement ? (
          <AchievementBadge
            icon={unlockedAchievement?.icon}
            tier={unlockedTier}
            size={44}
          />
        ) : gameId ? (
          <img
            src={
              getSizedImageUrl(
                getCoverUrl(gameQuery.data),
                ImageSize.COVER_SMALL_2X,
              ) ?? "/img/game_placeholder.jpeg"
            }
            alt={""}
            loading={"lazy"}
          />
        ) : (
          <UserAvatar userId={activity.profileUserId} size={44} />
        )}
      </span>
      <div className={"gn-activity-body"}>
        {gameName ? (
          <Link href={gameHref} className={"gn-activity-title"}>
            {gameName}
          </Link>
        ) : (
          <span className={"gn-activity-title"}>{actionText}</span>
        )}
        <div className={"gn-activity-meta"}>
          <UserAvatar userId={activity.profileUserId} size={18} />
          <Link
            href={`/profile/${activity.profileUserId}`}
            className={"gn-activity-user"}
          >
            {profileQuery.data?.username}
          </Link>
          {gameName && (
            <span className={"gn-activity-action"}>{actionText}</span>
          )}
        </div>
      </div>
      {reviewQuery.data && (
        <GameRating size={"xs"} value={reviewQuery.data.rating} />
      )}
      <Group className={"gn-activity-actions"}>
        {isAchievement && <ActivityItemComments activity={activity} />}
        <ActivityItemLikes activity={activity} />
      </Group>
    </div>
  );
};

export { XboxActivityItem };
