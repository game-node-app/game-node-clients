import React, { useState } from "react";
import {
  GameSearchSelectModal,
  POST_EDITOR_EXTENSIONS,
  POST_EDITOR_PUBLISH_MUTATION_KEY,
  PostImageLightboxContext,
  useInfinitePostsFeed,
} from "#@/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostsService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { createErrorNotification, getS3StoredUpload } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  LoadingOverlay,
  Stack,
} from "@mantine/core";
import { RichTextEditor, RichTextEditorContentProps } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { IconPhoto } from "@tabler/icons-react";

interface GamePostEditorProps {
  /**
   * If provided, game select modal will be skipped and post will be added with this game as target.
   */
  gameId?: number;
  editorProps?: RichTextEditorContentProps;
  onPublish?: () => void;
}

const GamePostEditor = (props: GamePostEditorProps) => {
  const editor = useEditor({
    extensions: POST_EDITOR_EXTENSIONS,
    onDrop: async (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;

      if (!files) {
        return;
      }

      for (const file of files) {
        if (file.type.includes("image")) {
          uploadImageMutation.mutate(file);
        }
      }
    },
    onPaste: async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.includes("image")) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadImageMutation.mutate(file);
          }
        }
      }
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const queryClient = useQueryClient();

  const [showActions, setShowActions] = useState(false);
  const [content, setContent] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(
    props.gameId,
  );

  const [gameSelectModalOpened, gameSelectModalUtils] = useDisclosure();
  const postsFeedQuery = useInfinitePostsFeed({});

  const resetEditor = () => {
    editor?.commands.clearContent();
  };

  const uploadImageMutation = useMutation({
    gcTime: 0,
    retry: 2,
    mutationFn: async (file: File) => {
      const response = await PostsService.postsControllerUploadPostImageV1({
        file: file,
      });

      const { filename } = response;

      // Insert the image at the current cursor position
      editor
        ?.chain()
        .focus()
        .setImage({
          src: getS3StoredUpload(filename),
          alt: "User provided image",
        })
        .createParagraphNear()
        .run();

      return response;
    },
    onError: createErrorNotification,
  });

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
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
    onError: createErrorNotification,
  });

  return (
    <PostImageLightboxContext>
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
        <RichTextEditor
          editor={editor}
          onClick={() => {
            setShowActions(true);
          }}
        >
          <RichTextEditor.Toolbar sticky stickyOffset={0}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content
            w={"100%"}
            h={"100%"}
            mih={{
              base: "30vh",
              lg: "25vh",
            }}
            {...props.editorProps}
          />

          <LoadingOverlay
            visible={
              uploadImageMutation.isPending || publishPostMutation.isPending
            }
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 1 }}
          />
        </RichTextEditor>
        {showActions && (
          <Group className={"justify-between"}>
            <FileButton
              accept="image/png,image/jpeg,image/gif"
              multiple
              onChange={(payload) => {
                for (const file of payload) {
                  uploadImageMutation.mutate(file);
                }
              }}
            >
              {(props) => (
                <ActionIcon {...props} variant={"default"} size={"lg"}>
                  <IconPhoto />
                </ActionIcon>
              )}
            </FileButton>
            <Button
              className={"ms-auto"}
              type={"button"}
              onClick={() => {
                if (selectedGameId == undefined) {
                  gameSelectModalUtils.open();
                  return;
                }

                publishPostMutation.mutate();
              }}
            >
              Publish
            </Button>
          </Group>
        )}
      </Stack>
    </PostImageLightboxContext>
  );
};

export { GamePostEditor };
