import React, { useMemo } from "react";
import {
  ActivityItemComments,
  ActivityItemLikes,
  ActivityItemProps,
  cn,
  CommentEditorView,
  CommentsListView,
  CommentsView,
  GameRating,
  Link,
  Modal,
  useCollection,
  useCollectionEntry,
  useGame,
  useObtainedGameAchievementActivity,
  usePost,
  UserAvatar,
  useReview,
  useRouter,
  useUserProfile,
} from "@repo/ui";
import { match } from "ts-pattern";
import { Activity, FindAllCommentsDto } from "@repo/wrapper/server";
import { Box, Group, Menu, Stack, Text } from "@mantine/core";
import { useLongPress } from "use-long-press";
import { IonRippleEffect } from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import { ActivityItemMenu } from "@/components/activity/ActivityItemMenu.tsx";

/**
 * Variant of the ActivityItem component for mobile.
 * @constructor
 */
const MobileActivityItem = ({
  activity,
  variant = "default",
}: ActivityItemProps) => {
  const router = useRouter();

  const [menuOpened, menuUtils] = useDisclosure();
  const [commentsOpened, commentsUtils] = useDisclosure();
  const bind = useLongPress(() => {
    if (variant !== "card") return;
    menuUtils.open();
  });
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
        return `Added to ${collectionQuery.data?.name}`;
      })
      .with(Activity.type.REVIEW, () => {
        return "Reviewed";
      })
      .with(Activity.type.POST, () => {
        return "Posted about";
      })
      .with(Activity.type.FOLLOW, () => {
        return "Followed";
      })
      .with(Activity.type.OBTAINED_GAME_ACHIEVEMENT, () => {
        const totalObtained =
          gameAchievementActivityQuery.data?.totalObtained || 0;
        const hasCompleted =
          gameAchievementActivityQuery.data?.hasCompletedAllAchievements ||
          false;
        const hasPlatinum =
          gameAchievementActivityQuery.data?.hasObtainedPlatinumTrophy || false;

        if (hasCompleted && hasPlatinum) {
          return `Obtained platinum trophy and completed all achievements`;
        } else if (hasCompleted) {
          return `Completed all achievements`;
        } else if (hasPlatinum) {
          return `Obtained platinum trophy`;
        } else {
          return `Obtained ${totalObtained} achievement${totalObtained > 1 ? "s" : ""}`;
        }
      })
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
    <Menu opened={menuOpened} onClose={menuUtils.close} position={"bottom-end"}>
      <Box className={"w-full"} {...bind()}>
        <Modal
          title={"Comments in this activity"}
          opened={commentsOpened}
          onClose={commentsUtils.close}
          classNames={{
            body: "flex flex-col min-h-[92vh]",
          }}
          breakpoints={[0.5, 0.75, 0.85, 1]}
          initialBreakpoint={1}
        >
          <CommentsView>
            <CommentsListView
              enabled={commentsOpened}
              sourceId={activity.id}
              sourceType={FindAllCommentsDto.sourceType.ACTIVITY}
            />
            <CommentEditorView
              sourceType={FindAllCommentsDto.sourceType.ACTIVITY}
              sourceId={activity.id}
            />
          </CommentsView>
        </Modal>
        <Menu.Dropdown>
          <ActivityItemMenu
            activity={activity}
            onCommentsClick={commentsUtils.open}
            onGameClick={() => {
              router.push(
                reviewQuery.data
                  ? `/game/${gameId}?reviewId=${reviewQuery.data.id}`
                  : `/game/${gameId}`,
              );
            }}
            onProfileClick={() => {
              router.push(`/profile/${activity.profileUserId}`);
            }}
            onPostClick={() => {
              router.push(`/posts?postId=${postQuery.data?.id}`);
            }}
          />
        </Menu.Dropdown>
        <Menu.Target>
          <Group
            className={cn(
              "w-full items-center flex-nowrap p-2 relative ion-activatable rounded",
              {
                "bg-paper-2": variant === "card",
              },
            )}
          >
            {variant === "card" && <IonRippleEffect />}
            <Link
              href={`/profile/${activity.profileUserId}`}
              className={"flex w-28 items-center flex-nowrap gap-2"}
            >
              <UserAvatar userId={activity.profileUserId} size={"md"} />
              <Stack className={"gap-xs"}>
                <Text
                  className={cn({
                    "text-xs text-[#808080] line-clamp-2": variant === "card",
                    "font-bold text-sm": variant === "default",
                  })}
                >
                  {profileQuery.data?.username}
                </Text>
                {variant === "card" && (
                  <Text className={"text-xs font-bold"}>{actionText}</Text>
                )}
              </Stack>
            </Link>
            <Link
              href={
                reviewQuery.data
                  ? `/game/${gameId}?reviewId=${reviewQuery.data.id}`
                  : `/game/${gameId}`
              }
              className={cn("flex flex-col w-fit items-center", {
                "mx-auto gap-1": variant === "default",
                "ms-auto items-center": variant === "card",
              })}
            >
              {variant === "default" && (
                <Text className={"text-xs text-dimmed text-center"}>
                  {actionText}
                </Text>
              )}
              <Text className={"font-bold text-sm text-center line-clamp-2"}>
                {gameQuery.data?.name}
              </Text>
              {variant === "card" && reviewQuery.data && (
                <GameRating size={"sm"} value={reviewQuery.data.rating} />
              )}
            </Link>

            <Group className={"flex-nowrap gap-1 items-start"}>
              {variant === "default" && (
                <ActivityItemComments activity={activity} />
              )}
              <ActivityItemLikes activity={activity} />
            </Group>
          </Group>
        </Menu.Target>
      </Box>
    </Menu>
  );
};

export { MobileActivityItem };
