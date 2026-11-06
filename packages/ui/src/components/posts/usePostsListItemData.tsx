import {
  CommentEditorView,
  CommentsListView,
  ReportCreateFormModal,
  useOnMobile,
  useUserId,
} from "#@/components";
import { CommentsView } from "#@/components/comment/view/CommentsView.tsx";
import { ActionConfirm } from "#@/components/general/ActionConfirm.tsx";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";
import { createErrorNotification, Modal } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  CreateReportRequestDto,
  FindAllCommentsDto,
  Post,
  PostsService,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor } from "@tiptap/react";

/** What every post card needs: the read-only content editor, removal and the comments/report/remove dialogs. */
export function usePostsListItemData(item: Post) {
  const { t } = useTranslation();
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
      // every posts list: the feeds and the per-profile/per-game lists
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  const dialogs = (
    <>
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
    </>
  );

  return {
    editor,
    isOwnPost: userId === item.profileUserId,
    dialogs,
    toggleComments: commentsOpenedUtils.toggle,
    openReport: reportModalUtils.open,
    openRemove: removeModalUtils.open,
  };
}
