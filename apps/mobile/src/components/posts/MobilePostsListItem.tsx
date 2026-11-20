import { Spoiler } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  ActionConfirm,
  CommentEditorView,
  CommentsListView,
  CommentsView,
  GameTitleWithFigure,
  ItemCommentsButton,
  ItemDropdown,
  ItemLikesButton,
  Modal,
  PostImageLightboxContext,
  RelativeDate,
  ReportCreateFormModal,
  UserAvatarGroup,
  usePostsListItem,
  type PostsListItemProps,
} from "@repo/ui";
import {
  CreateReportRequestDto,
  FindAllCommentsDto,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { EditorContent } from "@tiptap/react";

/**
 * Mobile presenter for a post: a bordered card with author, relative date, game chip, the post
 * body and the comment/like actions. State and modals come from `usePostsListItem`, shared with
 * the default web item.
 */
const MobilePostsListItem = ({
  item,
  withUserProfile = true,
  withGameInfo = true,
}: PostsListItemProps) => {
  const { t } = useTranslation();
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
    <article className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-line bg-paper-8 p-4">
      <ReportCreateFormModal
        opened={reportModalOpened}
        onClose={reportModalUtils.close}
        sourceId={item.id}
        sourceType={CreateReportRequestDto.sourceType.POST}
      />
      <ActionConfirm
        onConfirm={() => deletePostMutation.mutate()}
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
        title={t("posts.titles.confirmRemove")}
        message={t("posts.messages.removeWarning")}
      />
      <Modal
        title={t("comment.titles.commentsInPost")}
        opened={commentsOpened}
        onClose={commentsOpenedUtils.close}
        fullScreen
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

      <header className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {withUserProfile && (
            <UserAvatarGroup
              userId={item.profileUserId}
              avatarProps={{ size: "md" }}
              groupProps={{ gap: "xs" }}
              textProps={{ size: "sm", fw: 600 }}
            />
          )}
        </div>
        <RelativeDate
          date={item.createdAt}
          c={"dimmed"}
          fz={"xs"}
          className={"shrink-0"}
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
      </header>

      {withGameInfo && (
        <div className="w-fit max-w-full rounded-full bg-paper-4 py-1 pl-1 pr-3">
          <GameTitleWithFigure gameId={item.gameId} />
        </div>
      )}

      <Spoiler
        hideLabel={t("actions.showLess")}
        showLabel={t("actions.showMore")}
        maxHeight={300}
      >
        <PostImageLightboxContext>
          <EditorContent editor={editor} />
        </PostImageLightboxContext>
      </Spoiler>

      <footer className="flex items-center justify-end gap-2 border-0 border-t border-solid border-line pt-3">
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
      </footer>
    </article>
  );
};

export { MobilePostsListItem };
