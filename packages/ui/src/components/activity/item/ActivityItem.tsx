import React, { ReactElement, useMemo } from "react";
import { Box, Flex, Group, Text } from "@mantine/core";
import {
  ActivityItemComments,
  ActivityItemLikes,
  ActivityItemProps,
  GameRating,
  ObtainedAchievementActivityContent,
  TextLink,
  useCollection,
  useCollectionEntry,
  useGame,
  useObtainedGameAchievementActivity,
  usePost,
  UserAvatar,
  UserAvatarGroup,
  useReview,
  useUserFollow,
  useUserProfile,
} from "#@/components";
import { Activity } from "@repo/wrapper/server";
import { match } from "ts-pattern";
import { buildPresenterComponent } from "#@/context";
import { Link } from "#@/util";

const DEFAULT_ActivityItem = ({
  activity,
  withUserAvatar = true,
}: ActivityItemProps) => {
  const profileQuery = useUserProfile(activity.profileUserId);
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const userFollowQuery = useUserFollow(activity.userFollowId!);
  const followedProfileQuery = useUserProfile(
    userFollowQuery.data?.followedUserId,
  );
  const postQuery = usePost(activity.postId);
  const obtainedGameAchievementActivityQuery =
    useObtainedGameAchievementActivity(
      activity.obtainedGameAchievementActivityId,
    );

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
    console.log("Rendering content for activity", activity);

    return match<Activity.type, ReactElement>(activity.type)
      .with(Activity.type.POST, () => (
        <>
          <Text span>posted about </Text>
          <TextLink
            href={`/posts?postId=${activity.postId}`}
            className={"font-bold text-white no-underline"}
          >
            {gameQuery.data?.name}
          </TextLink>
        </>
      ))
      .with(Activity.type.COLLECTION_ENTRY, () => (
        <>
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
        </>
      ))
      .with(Activity.type.REVIEW, () => (
        <>
          <Text span>reviewed </Text>
          <TextLink
            href={`/game/${gameId}?reviewId=${activity.reviewId}`}
            className={"font-bold text-white no-underline"}
          >
            {gameQuery.data?.name}
          </TextLink>
          <Text span> with </Text>
          <GameRating size={"sm"} value={reviewQuery.data?.rating} />
        </>
      ))
      .with(Activity.type.FOLLOW, () => (
        <>
          <Text span>Started following </Text>
          <TextLink
            href={`/profile/${userFollowQuery.data?.followedUserId}`}
            className={"font-bold text-white no-underline"}
          >
            {followedProfileQuery.data?.username}
          </TextLink>
        </>
      ))
      .with(Activity.type.OBTAINED_GAME_ACHIEVEMENT, () => (
        <ObtainedAchievementActivityContent
          activity={obtainedGameAchievementActivityQuery.data}
        />
      ))
      .otherwise(() => (
        <Text span>
          performed an action which is not yet mapped. This will be updated
          soon.
        </Text>
      ));
  }, [
    activity,
    collectionQuery.data?.name,
    followedProfileQuery.data?.username,
    gameId,
    gameQuery.data?.name,
    obtainedGameAchievementActivityQuery.data,
    reviewQuery.data?.rating,
    userFollowQuery.data?.followedUserId,
  ]);

  return (
    <Group className={"flex-nowrap gap-2 lg:items-center "}>
      {withUserAvatar && (
        <Link
          href={`/profile/${activity.profileUserId}`}
          className={"max-w-fit"}
        >
          <UserAvatar userId={activity.profileUserId} size={"md"} />
        </Link>
      )}

      <Text className={"w-10/12"}>
        <Link
          className={"font-bold truncate max-w-[25%] me-1"}
          href={`/profile/${activity.profileUserId}`}
        >
          {profileQuery.data?.username}
        </Link>
        {content}
      </Text>

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
