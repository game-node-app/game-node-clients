import { useUserId } from "#@/components/auth/hooks/useUserId";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";
import { createErrorNotification } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { Post, PostsService } from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor } from "@tiptap/react";

/**
 * State shared by every presentation of a post list item: read-only editor, comments/report/remove
 * modal toggles and the delete mutation.
 */
export function usePostsListItem(item: Post) {
  const userId = useUserId();
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

  return {
    editor,
    commentsOpened,
    commentsOpenedUtils,
    reportModalOpened,
    reportModalUtils,
    removeModalOpened,
    removeModalUtils,
    deletePostMutation,
    isOwnPost,
  };
}
