import React, { useMemo } from "react";
import {
  ActivityItemProps,
  CommentEditorView,
  CommentsListView,
  CommentsView,
  GameRating,
  Modal,
  useCollection,
  useCollectionEntry,
  useGame,
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
const MobileActivityItem = ({ activity }: ActivityItemProps) => {
  const router = useRouter();

  const [menuOpened, menuUtils] = useDisclosure();
  const [commentsOpened, commentsUtils] = useDisclosure();
  const bind = useLongPress(() => {
    menuUtils.open();
  });
  const collectionEntryQuery = useCollectionEntry(activity.collectionEntryId);
  const collectionQuery = useCollection(activity.collectionId);
  const reviewQuery = useReview(activity.reviewId);
  const postQuery = usePost(activity.postId);
  const profileQuery = useUserProfile(activity.profileUserId);

  const gameId =
    collectionEntryQuery.data?.gameId ||
    reviewQuery.data?.gameId ||
    postQuery.data?.gameId;

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
      .exhaustive();
  }, [activity.type, collectionQuery.data?.name]);

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
            className={
              "bg-[#1D1D1D] w-full items-center flex-nowrap p-2 relative ion-activatable rounded"
            }
            onClick={() => {
              router.push(
                reviewQuery.data
                  ? `/game/${gameId}?reviewId=${reviewQuery.data.id}`
                  : `/game/${gameId}`,
              );
            }}
          >
            <IonRippleEffect />
            <Group className={"w-2/4 items-center flex-nowrap"}>
              <UserAvatar userId={activity.profileUserId} size={"lg"} />
              <Stack className={"gap-xs"}>
                <Text className={"text-xs text-[#808080] line-clamp-2"}>
                  {profileQuery.data?.username}
                </Text>
                <Text className={"text-xs font-bold line-clamp-2"}>
                  {actionText}
                </Text>
              </Stack>
            </Group>
            <Group className={"ms-auto flex-nowrap"}>
              <Stack className={"gap-xs w-36 items-center"}>
                <Text className={"font-bold text-sm text-center"}>
                  {gameQuery.data?.name}
                </Text>
                {reviewQuery.data && (
                  <GameRating value={reviewQuery.data.rating} size={"sm"} />
                )}
              </Stack>
            </Group>
          </Group>
        </Menu.Target>
      </Box>
    </Menu>
  );
};

export { MobileActivityItem };
