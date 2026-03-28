import React, { useMemo } from "react";
import { Box, Group, Stack, Text } from "@mantine/core";
import {
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  ObtainedAchievementActivityContent,
  useCollection,
  useCollectionEntry,
  useGame,
  useObtainedGameAchievementActivity,
  usePost,
  UserAvatar,
  useReview,
  useUserProfile,
} from "#@/components";
import { Activity } from "@repo/wrapper/server";
import { match } from "ts-pattern";
import { buildPresenterComponent } from "#@/context";
import { Link } from "#@/util";

const DEFAULT_ActivityItem = ({ activity }: ActivityItemProps) => {
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const postQuery = usePost(activity.postId);
  const profileQuery = useUserProfile(activity.profileUserId);
  const gameAchievementActivityQuery = useObtainedGameAchievementActivity(
    activity.obtainedGameAchievementActivityId,
  );

  const gameId =
    collectionEntryQuery.data?.gameId ||
    reviewQuery.data?.gameId ||
    postQuery.data?.gameId ||
    gameAchievementActivityQuery.data?.externalGame.gameId;

  const actionText = useMemo(() => {
    return match(activity.type)
      .with(Activity.type.COLLECTION_ENTRY, () => {
        return <>Added to {collectionQuery.data?.name}</>;
      })
      .with(Activity.type.REVIEW, () => {
        return <>Reviewed</>;
      })
      .with(Activity.type.POST, () => {
        return <>Posted about</>;
      })
      .with(Activity.type.FOLLOW, () => {
        return <>Followed</>;
      })
      .with(Activity.type.OBTAINED_GAME_ACHIEVEMENT, () => (
        <ObtainedAchievementActivityContent
          activity={gameAchievementActivityQuery.data}
        />
      ))
      .otherwise(() => {
        return "Performed an action which is not yet mapped. This will be updated soon.";
      });
  }, [
    activity.type,
    collectionQuery.data?.name,
    gameAchievementActivityQuery.data,
  ]);

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

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
              <Text className={"text-xs text-[#808080] line-clamp-2"}>
                {profileQuery.data?.username}
              </Text>
            </Link>

            <Text className={"text-xs font-bold"}>{actionText}</Text>
          </Stack>
        </Box>
        <Link
          href={
            reviewQuery.data
              ? `/game/${gameId}?reviewId=${reviewQuery.data.id}`
              : `/game/${gameId}`
          }
          className={"flex flex-col w-fit items-center ms-auto"}
        >
          <Text className={"font-bold text-sm text-center max-w-20 text-wrap"}>
            {gameQuery.data?.name}
          </Text>
          {reviewQuery.data && (
            <GameRating size={"sm"} value={reviewQuery.data.rating} />
          )}
        </Link>

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
