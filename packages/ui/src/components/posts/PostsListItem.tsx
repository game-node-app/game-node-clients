import {
  CommentEditorView,
  CommentsListView,
  GameTitleWithFigure,
  ItemCommentsButton,
  ItemDropdown,
  ItemLikesButton,
  PostImageLightboxContext,
  ReportCreateFormModal,
  useOnMobile,
  UserAvatarGroup,
  usePostsListItem,
} from "#@/components";
import { CommentsView } from "#@/components/comment/view/CommentsView.tsx";
import { ActionConfirm } from "#@/components/general/ActionConfirm.tsx";
import { RelativeDate } from "#@/components/general/RelativeDate.tsx";
import { buildPresenterComponent } from "#@/context";
import { Modal } from "#@/util";
import { Box, Divider, Group, Spoiler, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CreateReportRequestDto,
  FindAllCommentsDto,
  Post,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { EditorContent } from "@tiptap/react";

export interface PostsListItemProps {
  item: Post;
  withUserProfile?: boolean;
  withGameInfo?: boolean;
}

const DEFAULT_PostsListItem = ({
  item,
  withUserProfile = true,
  withGameInfo = true,
}: PostsListItemProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const {
    editor,
    commentsOpened,
    commentsOpenedUtils,
    reportModalOpened,
    reportModalUtils,
    removeModalOpened,
    removeModalUtils,
    deletePostMutation,
    isOwnPost,
  } = usePostsListItem(item);

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
        title={t("comment.titles.commentsInPost")}
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

      <Box className={withUserProfile ? "hidden lg:block lg:w-2/12" : "hidden"}>
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
          "bg-paper mobile:bg-paper-2 w-full lg:lg:w-10/12 p-2 lg:p-4 flex-grow overflow-auto"
        }
      >
        <Group className={"w-full px-2 flex-nowrap"}>
          {onMobile ? (
            <Group className={"w-10/12 flex-nowrap"}>
              {withGameInfo && (
                <GameTitleWithFigure gameId={item.gameId} withTitle={false} />
              )}
              <Box className={withUserProfile ? "max-w-fit" : "hidden"}>
                <UserAvatarGroup userId={item.profileUserId} />
              </Box>
            </Group>
          ) : (
            <Group className={"w-10/12"}>
              {withGameInfo && <GameTitleWithFigure gameId={item.gameId} />}
            </Group>
          )}

          <Box className={"ms-auto"}>
            <ActionConfirm
              onConfirm={() => deletePostMutation.mutate()}
              opened={removeModalOpened}
              onClose={removeModalUtils.close}
              title={t("posts.titles.confirmRemove")}
              message={t("posts.messages.removeWarning")}
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
          hideLabel={t("actions.showLess")}
          showLabel={t("actions.showMore")}
          maxHeight={300}
        >
          <PostImageLightboxContext>
            <EditorContent editor={editor} />
          </PostImageLightboxContext>
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
            sourceId={item.id}
            sourceType={StatisticsSourceRequestDto.sourceType.POST}
          />
        </Group>
      </Stack>
    </Group>
  );
};

const PostsListItem = buildPresenterComponent(
  "PostsListItem",
  DEFAULT_PostsListItem,
);

export { PostsListItem };
