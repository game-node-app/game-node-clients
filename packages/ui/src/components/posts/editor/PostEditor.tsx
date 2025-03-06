import React, { useState } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";

import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { PostsService, UploadPostImageResponseDto } from "@repo/wrapper/server";
import { getServerStoredUpload } from "#@/util";
import { notifications } from "@mantine/notifications";
import {
  GameSearchSelectModal,
  GameTitleWithFigure,
  POST_EDITOR_PUBLISH_MUTATION_KEY,
  useInfinitePostsFeed,
  useOnMobile,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { createErrorNotification } from "#@/util/createErrorNotification.ts";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";

const PostEditor = () => {
  const onMobile = useOnMobile();
  const [showActions, setShowActions] = useState(false);
  const [content, setContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState<
    UploadPostImageResponseDto[]
  >([]);
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(
    undefined,
  );

  const [gameSelectModalOpened, gameSelectModalUtils] = useDisclosure();

  const postsFeedQuery = useInfinitePostsFeed({});

  const editor = useEditor({
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
    setUploadedImages([]);
    editor?.commands.clearContent();
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await PostsService.postsControllerUploadPostImageV1({
        file: file,
      });

      const { filename } = response;

      console.log("Inserting new image: ", response);

      // Insert the image at current cursor position
      editor
        ?.chain()
        .focus()
        .setImage({ src: getServerStoredUpload(filename) })
        .run();

      return response;
    },
    onSuccess: (response) => {
      setUploadedImages([...uploadedImages, response]);
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
      const validUploadedImages: UploadPostImageResponseDto[] = [];

      editor?.state.doc.descendants((node) => {
        if (node.type.name === "image") {
          const imgSrc: string = node.attrs.src;
          const relatedUploadImage = uploadedImages.find((image) =>
            imgSrc.includes(image.filename),
          );

          if (relatedUploadImage) {
            validUploadedImages.push(relatedUploadImage);
          }
        }
      });

      const uploadedImageIds = validUploadedImages.map((image) => image.id);

      return PostsService.postsControllerCreateV1({
        gameId: selectedGameId,
        content,
        associatedImageIds: uploadedImageIds,
      });
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Successfully published post!",
      });
      postsFeedQuery.invalidate();
      resetEditor();
    },
    onError: createErrorNotification,
  });

  if (!editor) {
    return null;
  }

  return (
    <Stack className="space-y-4 mb-8 gap-2">
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
        <RichTextEditor editor={editor} onClick={() => setShowActions(true)}>
          <RichTextEditor.Toolbar sticky stickyOffset={0}>
            {!onMobile && (
              <UnstyledButton onClick={gameSelectModalUtils.open}>
                {selectedGameId ? (
                  <GameTitleWithFigure
                    gameId={selectedGameId}
                    onClick={(evt) => evt.preventDefault()}
                  />
                ) : (
                  <Text className={"underline cursor-pointer"}>
                    Select Game
                  </Text>
                )}
              </UnstyledButton>
            )}

            <RichTextEditor.ControlsGroup className={"lg:ms-auto"}>
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
              base: showActions ? "35vh" : "20vh",
              lg: showActions ? "25vh" : "15vh",
            }}
          />

          <LoadingOverlay
            visible={uploadMutation.isPending}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 1 }}
          />
        </RichTextEditor>
      </Paper>
      {showActions && (
        <Group>
          <FileButton
            accept="image/png,image/jpeg"
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
