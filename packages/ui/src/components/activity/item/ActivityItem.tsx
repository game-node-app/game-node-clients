import {
  AchievementBadge,
  ActivityItemComments,
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  UserAvatar,
} from "#@/components";
import { useActivityItemData } from "#@/components/activity/item/useActivityItemData";
import { buildPresenterComponent } from "#@/context";
import { Link } from "#@/util";
import { Box, Group, Stack, Text } from "@mantine/core";
import { Activity } from "@repo/wrapper/server";

const DEFAULT_ActivityItem = ({ activity }: ActivityItemProps) => {
  const {
    actionText,
    gameQuery,
    gameHref,
    reviewQuery,
    profileQuery,
    unlockedAchievement,
    unlockedTier,
  } = useActivityItemData(activity);

  return (
    <Box className={"w-full"}>
      <Group
        className={
          "w-full items-center flex-nowrap p-2 relative ion-activatable rounded bg-paper-2"
        }
      >
        <Box className={"flex max-w-96 items-center flex-nowrap gap-2"}>
          <UserAvatar userId={activity.profileUserId} size={"md"} />
          <Stack className={"gap-1"}>
            <Link href={`/profile/${activity.profileUserId}`}>
              <Text className={"text-xs text-dimmed line-clamp-2"}>
                {profileQuery.data?.username}
              </Text>
            </Link>

            <Text className={"text-xs font-bold"}>{actionText}</Text>
          </Stack>
        </Box>
        {activity.type === Activity.type.ACHIEVEMENT_UNLOCKED ? (
          <Box className={"ms-auto"}>
            <AchievementBadge
              icon={unlockedAchievement?.icon}
              tier={unlockedTier}
            />
          </Box>
        ) : (
          <Link
            href={gameHref}
            className={"flex flex-col w-fit items-center ms-auto"}
          >
            <Text
              className={"font-bold text-sm text-center max-w-20 text-wrap"}
            >
              {gameQuery.data?.name}
            </Text>
            {reviewQuery.data && (
              <GameRating size={"sm"} value={reviewQuery.data.rating} />
            )}
          </Link>
        )}

        <Group className={"flex-nowrap gap-1 items-start"}>
          {activity.type === Activity.type.ACHIEVEMENT_UNLOCKED && (
            <ActivityItemComments activity={activity} />
          )}
          <ActivityItemLikes activity={activity} />
        </Group>
      </Group>
    </Box>
  );
};

const ActivityItem = buildPresenterComponent(
  "ActivityItem",
  DEFAULT_ActivityItem,
);

export { ActivityItem };
