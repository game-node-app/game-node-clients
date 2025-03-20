import React, { useState } from "react";
import { RichTextEditor, RichTextEditorProps } from "@mantine/tiptap";
import { EditorOptions, useEditor } from "@tiptap/react";

import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  StackProps,
} from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { PostsService } from "@repo/wrapper/server";
import { getS3StoredUpload } from "#@/util";
import { notifications } from "@mantine/notifications";
import {
  GameSearchSelectModal,
  POST_EDITOR_PUBLISH_MUTATION_KEY,
  useInfinitePostsFeed,
  useUserId,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { createErrorNotification } from "#@/util/createErrorNotification.ts";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";

interface Props {
  wrapperProps?: StackProps;
  editorProps?: Omit<Partial<RichTextEditorProps>, "editor" | "children">;
  editorOptions?: Omit<
    Partial<EditorOptions>,
    "onUpdate" | "onDrop" | "onPaste" | "extensions"
  >;
  onPublish?: () => void;
}

const PostEditor = ({
  wrapperProps,
  editorProps,
  editorOptions,
  onPublish,
}: Props) => {
  const userId = useUserId();
  const [showActions, setShowActions] = useState(false);
  const [content, setContent] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(
    undefined,
  );

  const [gameSelectModalOpened, gameSelectModalUtils] = useDisclosure();

  const postsFeedQuery = useInfinitePostsFeed({});

  const editor = useEditor({
    ...editorOptions,
    extensions: POST_EDITOR_EXTENSIONS,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },

    onDrop: async (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;

      if (!files) {
        return;
      }

      if (files.length > 0 && files[0].type.indexOf("image") === 0) {
        uploadMutation.mutate(files[0]);
      }
    },
    onPaste: async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadMutation.mutate(file);
            break;
          }
        }
      }
    },
  });

  const resetEditor = () => {
    editor?.commands.clearContent();
  };

  const uploadMutation = useMutation({
    gcTime: 0,
    retry: 2,
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await PostsService.postsControllerUploadPostImageV1({
        file: file,
      });

      const { filename } = response;

      // Insert the image at current cursor position
      editor
        ?.chain()
        .focus()
        .setImage({
          src: getS3StoredUpload(filename),
          alt: "User provided image",
        } as never)
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
      /**
       * Uploaded images that are still present in the editor.
       */
      const validUploadedImages: number[] = [];

      editor?.state.doc.descendants((node) => {
        if (node.type.name === "image") {
          const imgId: number = node.attrs.id;
          console.log("Found image id: ", imgId);
          if (imgId) {
            validUploadedImages.push(imgId);
          }
        }
      });

      return PostsService.postsControllerCreateV1({
        gameId: selectedGameId,
        content,
        associatedImageIds: validUploadedImages,
      });
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Successfully published post!",
      });
      postsFeedQuery.invalidate();
      resetEditor();
      if (onPublish) onPublish();
    },
    onError: createErrorNotification,
  });

  if (!editor || !userId) {
    return null;
  }

  return (
    <Stack className="space-y-4 mb-8 gap-2" {...wrapperProps}>
      <GameSearchSelectModal
        onSelected={(gameId) => {
          setSelectedGameId(gameId);
          gameSelectModalUtils.close();
          publishPostMutation.mutate();
        }}
        opened={gameSelectModalOpened}
        onClose={gameSelectModalUtils.close}
      />
      <Paper className="relative overflow-hidden shadow-sm" withBorder p={0}>
        <RichTextEditor
          mih={{
            base: showActions ? "35vh" : "20vh",
            lg: showActions ? "25vh" : "15vh",
          }}
          {...editorProps}
          editor={editor}
          onClick={(evt) => {
            setShowActions(true);
            if (editorProps?.onClick) {
              editorProps.onClick(evt);
            }
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

          <RichTextEditor.Content w={"100%"} h={"100%"} />

          <LoadingOverlay
            visible={uploadMutation.isPending || publishPostMutation.isPending}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 1 }}
          />
        </RichTextEditor>
      </Paper>
      {showActions && (
        <Group>
          <FileButton
            accept="image/png,image/jpeg,image/gif"
            onChange={(payload) => {
              if (payload) {
                uploadMutation.mutate(payload);
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
            onClick={gameSelectModalUtils.open}
          >
            Publish
          </Button>
        </Group>
      )}
    </Stack>
  );
};

export { PostEditor };
