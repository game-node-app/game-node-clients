import React, { useRef, useState } from "react";
import {
  GameSearchSelectModal,
  POST_EDITOR_PUBLISH_MUTATION_KEY,
  PostEditor,
  PostEditorProps,
  useInfinitePostsFeed,
} from "#@/components";
import { useMutation } from "@tanstack/react-query";
import { PostsService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { createErrorNotification } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { Stack } from "@mantine/core";
import { Editor } from "@tiptap/core";

interface GamePostEditorProps
  extends Omit<PostEditorProps, "onPublishClick" | "isPublishPending"> {
  onPublish?: () => void;
}

const GamePostEditor = (props: GamePostEditorProps) => {
  const editor = useRef<Editor>(null);
  const [content, setContent] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(
    undefined,
  );

  const [gameSelectModalOpened, gameSelectModalUtils] = useDisclosure();
  const postsFeedQuery = useInfinitePostsFeed({});

  const resetEditor = () => {
    editor.current?.commands.clearContent();
  };

  const publishPostMutation = useMutation({
    mutationKey: POST_EDITOR_PUBLISH_MUTATION_KEY,
    mutationFn: async () => {
      if (selectedGameId == undefined) {
        throw new Error("An associated game must be set.");
      }

      return PostsService.postsControllerCreateV1({
        gameId: selectedGameId,
        content,
      });
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Successfully published post!",
      });
      postsFeedQuery.invalidate();
      props.onPublish?.();
      resetEditor();
    },
    onError: createErrorNotification,
  });

  return (
    <Stack>
      <GameSearchSelectModal
        onSelected={(gameId) => {
          setSelectedGameId(gameId);
          gameSelectModalUtils.close();
          publishPostMutation.mutate();
        }}
        opened={gameSelectModalOpened}
        onClose={gameSelectModalUtils.close}
      />
      <PostEditor
        {...props}
        editorOptions={{
          ...props.editorOptions,
          onCreate: (editorCreateProps) => {
            editor.current = editorCreateProps.editor;
            if (props.editorOptions?.onCreate) {
              props.editorOptions.onCreate(editorCreateProps);
            }
          },
          onUpdate: (editorUpdateProps) => {
            setContent(editorUpdateProps.editor.getHTML());
            if (props.editorOptions?.onUpdate) {
              props.editorOptions.onUpdate(editorUpdateProps);
            }
          },
        }}
        isPublishPending={publishPostMutation.isPending}
        onPublishClick={gameSelectModalUtils.open}
      />
    </Stack>
  );
};

export { GamePostEditor };
