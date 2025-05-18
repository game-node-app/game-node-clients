import React from "react";
import { Box, Divider, Group, Spoiler, Stack } from "@mantine/core";
import {
  CreateReportRequestDto,
  FindAllCommentsDto,
  FindOneStatisticsDto,
  Post,
  PostsService,
} from "@repo/wrapper/server";
import { EditorContent, useEditor } from "@tiptap/react";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";
import {
  CommentEditorView,
  CommentsListView,
  GameTitleWithFigure,
  ItemCommentsButton,
  ItemDropdown,
  ItemLikesButton,
  ReportCreateFormModal,
  useOnMobile,
  UserAvatarGroup,
  useUserId,
} from "#@/components";
import { RelativeDate } from "#@/components/general/RelativeDate.tsx";
import { useDisclosure } from "@mantine/hooks";
import { createErrorNotification, Modal } from "#@/util";
import { CommentsView } from "#@/components/comment/view/CommentsView.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionConfirm } from "#@/components/general/ActionConfirm.tsx";

interface Props {
  item: Post;
}

const PostsListItem = ({ item }: Props) => {
  const userId = useUserId();
  const onMobile = useOnMobile();
  const queryClient = useQueryClient();
  const [commentsOpened, commentsOpenedUtils] = useDisclosure();
  const [reportModalOpened, reportModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();

  const editor = useEditor(
    {
      extensions: POST_EDITOR_EXTENSIONS,
      immediatelyRender: window != undefined,
      content: item.content,
      editable: false,
    },
    [item.content],
  );

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      return PostsService.postsControllerDeleteV1(item.id);
    },
    onError: createErrorNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", "feed"],
      });
    },
  });

  const isOwnPost = userId === item.profileUserId;

  if (!editor) return null;

  return (
    <Group className={"w-full"} wrap={"nowrap"} align={"start"} gap={0}>
      <ReportCreateFormModal
        opened={reportModalOpened}
        onClose={reportModalUtils.close}
        sourceId={item.id}
        sourceType={CreateReportRequestDto.sourceType.POST}
      />
      <Modal
        title={"Comments in this post"}
        opened={commentsOpened}
        onClose={commentsOpenedUtils.close}
        fullScreen={onMobile}
        size={"xl"}
        initialBreakpoint={1}
        breakpoints={[0.5, 0.75, 0.85, 1]}
        classNames={{
          body: "flex flex-col min-h-[92vh]",
        }}
      >
        <CommentsView>
          <CommentsListView
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
          />
          <CommentEditorView
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
          />
        </CommentsView>
      </Modal>

      <Box className={"hidden lg:block lg:w-2/12"}>
        <UserAvatarGroup
          avatarProps={{
            size: onMobile ? "lg" : "xl",
          }}
          userId={item.profileUserId}
          groupProps={{
            justify: "center",
          }}
          textProps={{
            display: onMobile ? "none" : undefined,
          }}
          withHorizontalBreak
        />
      </Box>

      <Stack
        className={
          "bg-[#161616] w-full lg:lg:w-10/12 p-2 lg:p-4 flex-grow overflow-auto"
        }
      >
        <Group className={"w-full px-2 flex-nowrap"}>
          {onMobile ? (
            <Group className={"w-10/12 flex-nowrap"}>
              <GameTitleWithFigure gameId={item.gameId} withTitle={false} />
              <Box className={"max-w-fit"}>
                <UserAvatarGroup userId={item.profileUserId} />
              </Box>
            </Group>
          ) : (
            <Group className={"w-10/12"}>
              <GameTitleWithFigure gameId={item.gameId} />
            </Group>
          )}

          <Box className={"ms-auto"}>
            <ActionConfirm
              onConfirm={() => deletePostMutation.mutate()}
              opened={removeModalOpened}
              onClose={removeModalUtils.close}
              title={"Confirm post removal"}
              message={
                "This post will be deleted permanently, and this action cannot be undone. Are you sure?"
              }
            />
            <ItemDropdown>
              <ItemDropdown.ReportButton
                onClick={reportModalUtils.open}
                disabled={isOwnPost}
              />
              {isOwnPost && (
                <ItemDropdown.RemoveButton onClick={removeModalUtils.open} />
              )}
            </ItemDropdown>
          </Box>
        </Group>
        <Divider className={"w-full"} />
        <Spoiler
          hideLabel={"Show less"}
          showLabel={"Show more"}
          maxHeight={300}
        >
          <EditorContent editor={editor} />
        </Spoiler>
        <Group className={"w-full flex-nowrap"}>
          <RelativeDate
            date={item.createdAt}
            c={"dimmed"}
            fz={"sm"}
            className={"me-auto"}
          />
          <ItemCommentsButton
            onClick={() => {
              commentsOpenedUtils.toggle();
            }}
            sourceId={item.id}
            sourceType={FindAllCommentsDto.sourceType.POST}
          />
          <ItemLikesButton
            targetUserId={item.profileUserId}
            sourceId={item.id}
            sourceType={FindOneStatisticsDto.sourceType.POST}
          />
        </Group>
      </Stack>
    </Group>
  );
};

export { PostsListItem };
