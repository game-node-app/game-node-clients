import {
  AchievementBadge,
  ActivityItemLikes,
  ActivityItemProps,
  GameFigureImage,
  GameRating,
  UserAvatar,
} from "#@/components";
import { useActivityItemData } from "#@/components/activity/item/useActivityItemData";
import { buildPresenterComponent } from "#@/context";
import { Link } from "#@/util";
import { Box, Group, Stack, Text } from "@mantine/core";
import { Activity, AchievementIconDto } from "@repo/wrapper/server";

const DEFAULT_ActivityItem = ({
  activity,
  variant = "default",
}: ActivityItemProps) => {
  const {
    actionText,
    game,
    gameHref,
    profile,
    review,
    unlockedAchievement,
    unlockedTier,
  } = useActivityItemData(activity);

  if (variant === "card") {
    const isAchievementUnlocked =
      activity.type === Activity.type.ACHIEVEMENT_UNLOCKED;
    return (
      <Stack className={"w-full h-full gap-2 p-3 rounded-lg bg-paper-2"}>
        <Group className={"w-full flex-nowrap justify-between gap-2"}>
          <Group className={"min-w-0 flex-nowrap gap-2"}>
            <UserAvatar
              userId={activity.profileUserId}
              profile={activity.profile}
              size={"sm"}
            />
            <Link
              href={`/profile/${activity.profileUserId}`}
              className={"min-w-0"}
            >
              <Text className={"text-xs text-dimmed font-medium truncate"}>
                {profile?.username}
              </Text>
            </Link>
          </Group>
          <ActivityItemLikes activity={activity} />
        </Group>
        <Group className={"w-full flex-nowrap items-center gap-3"}>
          {isAchievementUnlocked && (
            <Box className={"w-12 min-w-12"}>
              <AchievementBadge
                icon={
                  unlockedAchievement?.icon as
                    | AchievementIconDto
                    | null
                    | undefined
                }
                tier={unlockedTier}
              />
            </Box>
          )}
          {!isAchievementUnlocked && game && (
            <Box className={"w-12 min-w-12"}>
              <GameFigureImage game={{ ...game, href: gameHref }} />
            </Box>
          )}
          <Stack className={"min-w-0 flex-1 gap-0.5"}>
            <Text className={"text-xs text-dimmed line-clamp-2"}>
              {actionText}
            </Text>
            {!isAchievementUnlocked && game && (
              <Link href={gameHref} className={"min-w-0"}>
                <Text className={"text-sm font-bold line-clamp-1"}>
                  {game?.name}
                </Text>
              </Link>
            )}
            {review && <GameRating size={"xs"} value={review.rating} />}
          </Stack>
        </Group>
      </Stack>
    );
  }

  return (
    <Box className={"w-full"}>
      <Group
        className={
          "w-full items-center flex-nowrap p-2 relative ion-activatable rounded bg-paper-2"
        }
      >
        <Box className={"flex max-w-96 items-center flex-nowrap gap-2"}>
          <UserAvatar
            userId={activity.profileUserId}
            profile={activity.profile}
            size={"md"}
          />
          <Stack className={"gap-1"}>
            <Link href={`/profile/${activity.profileUserId}`}>
              <Text className={"text-xs text-dimmed-1 line-clamp-2"}>
                {profile?.username}
              </Text>
            </Link>

            <Text className={"text-xs font-bold"}>{actionText}</Text>
          </Stack>
        </Box>
        {activity.type === Activity.type.ACHIEVEMENT_UNLOCKED ? (
          <Box className={"ms-auto"}>
            <AchievementBadge
              icon={
                unlockedAchievement?.icon as
                  | AchievementIconDto
                  | null
                  | undefined
              }
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
              {game?.name}
            </Text>
            {review && <GameRating size={"sm"} value={review.rating} />}
          </Link>
        )}

        <Group className={"flex-nowrap gap-1 items-start"}>
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
