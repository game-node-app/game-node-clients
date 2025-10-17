import React, { ReactElement, useMemo } from "react";
import { Box, Group, Text } from "@mantine/core";
import {
  ActivityItemComments,
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  TextLink,
  useCollection,
  useCollectionEntry,
  useGame,
  usePost,
  UserAvatarGroup,
  useReview,
  useUserFollow,
  useUserProfile,
} from "#@/components";
import { Activity } from "@repo/wrapper/server";
import { match } from "ts-pattern";
import { buildPresenterComponent } from "#@/context";

const DEFAULT_ActivityItem = ({
  activity,
  withUserAvatar = true,
}: ActivityItemProps) => {
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const userFollowQuery = useUserFollow(activity.userFollowId!);
  const followedProfileQuery = useUserProfile(
    userFollowQuery.data?.followedUserId,
  );
  const postQuery = usePost(activity.postId);

  const gameId =
    collectionEntryQuery.data?.gameId ||
    reviewQuery.data?.gameId ||
    postQuery.data?.gameId;

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const content = useMemo(() => {
    return match<Activity.type, ReactElement>(activity.type)
      .with(Activity.type.POST, () => (
        <Text>
          <Text span>Posted about </Text>
          <TextLink
            href={`/posts?postId=${activity.postId}`}
            className={"font-bold text-white no-underline"}
          >
            {gameQuery.data?.name}
          </TextLink>
        </Text>
      ))
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
      .with(Activity.type.FOLLOW, () => (
        <Text>
          <Text span>Started following </Text>
          <TextLink
            href={`/profile/${userFollowQuery.data?.followedUserId}`}
            className={"font-bold text-white no-underline"}
          >
            {followedProfileQuery.data?.username}
          </TextLink>
        </Text>
      ))
      .exhaustive();
  }, [
    activity.collectionId,
    activity.postId,
    activity.profileUserId,
    activity.reviewId,
    activity.type,
    collectionQuery.data?.name,
    followedProfileQuery.data?.username,
    gameId,
    gameQuery.data?.name,
    reviewQuery.data?.rating,
    userFollowQuery.data?.followedUserId,
  ]);

  return (
    <Group className={"flex-nowrap gap-2.5 items-center"}>
      {withUserAvatar && (
        <Box className={"max-w-fit w-4/12"}>
          <UserAvatarGroup
            userId={activity.profileUserId}
            avatarProps={{
              size: "md",
            }}
            groupProps={{
              gap: "xs",
              className: "max-w-fit flex-nowrap",
            }}
            textProps={{
              lineClamp: 2,
              className: "text-sm lg:text-md",
            }}
          />
        </Box>
      )}
      <Box className={"flex-grow"}>{content}</Box>
      <Group className={"flex-nowrap ms-auto gap-1 lg:gap-2 items-start"}>
        <ActivityItemLikes activity={activity} />
        <ActivityItemComments activity={activity} />
      </Group>
    </Group>
  );
};

const ActivityItem = buildPresenterComponent(
  "ActivityItem",
  DEFAULT_ActivityItem,
);

export { ActivityItem };
