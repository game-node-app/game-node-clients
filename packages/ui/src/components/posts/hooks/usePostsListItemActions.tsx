import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CommentEditorView } from "#@/components/comment/editor/CommentEditorView";
import { CommentsListView } from "#@/components/comment/view/CommentsListView";
import { CommentsView } from "#@/components/comment/view/CommentsView";
import { ActionConfirm } from "#@/components/general/ActionConfirm";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants";
import { ReportCreateFormModal } from "#@/components/report/modal/ReportCreateFormModal";
import { createErrorNotification } from "#@/util/createErrorNotification";
import { Modal } from "#@/util/modal";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  CreateReportRequestDto,
  FindAllCommentsDto,
  Post,
  PostsService,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, type Editor } from "@tiptap/react";
import type { ReactNode } from "react";

export interface PostsListItemActions {
  /** Read-only editor with the post content, or null while Tiptap mounts. */
  editor: Editor | null;
  isOwnPost: boolean;
  /** Report and remove dialogs (the comments modal is included as well). */
  dialogs: ReactNode;
  openComments: () => void;
  openReport: () => void;
  openRemove: () => void;
}

/**
 * Every action and dialog a feed item owns: the read-only post editor, comment
 * modal, report form, own-post removal confirmation and its mutation.
 *
 * The default `PostsListItem` and the Xbox screen pack's item share this hook,
 * so a themed item keeps the same permissions, endpoints, cache invalidation
 * and injected modal as the default one.
 */
export function usePostsListItemActions(item: Post): PostsListItemActions {
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
      immediatelyRender: typeof window !== "undefined",
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

  const dialogs = (
    <>
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
      <ActionConfirm
        onConfirm={() => deletePostMutation.mutate()}
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
        title={t("posts.titles.confirmRemove")}
        message={t("posts.messages.removeWarning")}
      />
    </>
  );

  return {
    editor,
    isOwnPost,
    dialogs,
    openComments: () => commentsOpenedUtils.toggle(),
    openReport: () => reportModalUtils.open(),
    openRemove: () => removeModalUtils.open(),
  };
}
