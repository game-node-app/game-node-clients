import React, { ReactElement, useMemo } from "react";
import { Box, Group, Text } from "@mantine/core";
import {
  ActivityItemComments,
  ActivityItemLikes,
  GameRating,
  TextLink,
  useCollection,
  useCollectionEntry,
  useGame,
  UserAvatarGroup,
  useReview,
  useUserFollow,
} from "#@/components";
import { Activity } from "@repo/wrapper/server";
import { match } from "ts-pattern";

interface Props {
  activity: Activity;
}

const ActivityItem = ({ activity }: Props) => {
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const userFollowQuery = useUserFollow(activity.userFollowId!);

  const gameId = collectionEntryQuery.data?.gameId || reviewQuery.data?.gameId;

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const content = useMemo(() => {
    return match<Activity.type, ReactElement>(activity.type)
      .with(Activity.type.POST, () => <div />)
      .with(Activity.type.COLLECTION_ENTRY, () => (
        <Text className={""}>
          <Text span>added </Text>
          <TextLink
            href={`/game/${gameId}`}
            className={"font-bold text-white no-underline"}
          >
            {gameQuery.data?.name}
          </TextLink>
          <Text span> to </Text>
          <TextLink
            href={`/library/${activity.profileUserId}/collection/${activity.collectionId}`}
            className={"font-bold text-white no-underline"}
          >
            {collectionQuery.data?.name}
          </TextLink>
        </Text>
      ))
      .with(Activity.type.REVIEW, () => (
        <Group className={"gap-1"}>
          <Text className={""}>
            <Text span>reviewed </Text>
            <TextLink
              href={`/game/${gameId}?reviewId=${activity.reviewId}`}
              className={"font-bold text-white no-underline"}
            >
              {gameQuery.data?.name}
            </TextLink>
            <Text span> with </Text>
          </Text>

          <GameRating size={"sm"} value={reviewQuery.data?.rating} />
        </Group>
      ))
      .with(Activity.type.FOLLOW, () => <div />)
      .exhaustive();
  }, [
    activity.collectionId,
    activity.profileUserId,
    activity.type,
    collectionQuery.data?.name,
    gameId,
    gameQuery.data?.name,
    reviewQuery.data?.rating,
  ]);

  return (
    <Group className={"flex-nowrap gap-2 items-start"}>
      <Box className={"max-w-28"}>
        <UserAvatarGroup
          userId={activity.profileUserId}
          avatarProps={{
            size: "sm",
          }}
          groupProps={{
            gap: "xs",
            className: "max-w-fit flex-nowrap",
          }}
          textProps={{
            lineClamp: 1,
            className: "text-sm lg:text-md",
          }}
        />
      </Box>
      <Box className={"flex-grow"}>{content}</Box>
      <Group className={"flex-nowrap ms-auto gap-1 lg:gap-2 items-start"}>
        <ActivityItemLikes activity={activity} />
        <ActivityItemComments activity={activity} />
      </Group>
    </Group>
  );
};

export { ActivityItem };
