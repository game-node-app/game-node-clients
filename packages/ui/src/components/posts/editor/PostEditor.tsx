import React, { ComponentProps, useMemo, useState } from "react";
import {
  RichTextEditor,
  RichTextEditorContentProps,
  RichTextEditorProps,
  RichTextEditorToolbarProps,
} from "@mantine/tiptap";
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
import { useUserId } from "#@/components";
import { createErrorNotification } from "#@/util/createErrorNotification.ts";
import { POST_EDITOR_EXTENSIONS } from "#@/components/posts/editor/constants.ts";

export interface PostEditorProps {
  wrapperProps?: StackProps;
  editorProps?: RichTextEditorContentProps;
  editorOptions?: Omit<
    Partial<EditorOptions>,
    "onDrop" | "onPaste" | "extensions"
  >;
  isPublishPending: boolean;
  onPublishClick: () => Promise<void> | void;
  toolbarProps?: RichTextEditorToolbarProps;
  // RichTextEditor.staticComponents members.
  // Rendered at the top of the editor to provide functionality.
  controls?: React.ReactNode;
  // Custom extensions to be used instead of the default ones for Posts.
  extensions?: EditorOptions["extensions"];
}

const PostEditor = ({
  wrapperProps,
  editorProps,
  editorOptions,
  isPublishPending,
  onPublishClick,
  extensions = POST_EDITOR_EXTENSIONS,
  toolbarProps,
  controls,
}: PostEditorProps) => {
  const userId = useUserId();
  const [showActions, setShowActions] = useState(false);

  const editor = useEditor({
    ...editorOptions,
    extensions,
    onDrop: async (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;

      if (!files) {
        return;
      }

      if (files.length > 0 && files[0].type.indexOf("image") === 0) {
        uploadImageMutation.mutate(files[0]);
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
            uploadImageMutation.mutate(file);
            break;
          }
        }
      }
    },
  });

  const uploadImageMutation = useMutation({
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

  const renderedControls = useMemo(() => {
    if (controls != undefined) {
      return controls;
    }

    return (
      <>
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
      </>
    );
  }, [controls]);

  if (!editor || !userId) {
    return null;
  }

  return (
    <>
      <RichTextEditor
        editor={editor}
        onClick={(evt) => {
          setShowActions(true);
          if (editorProps?.onClick) {
            editorProps.onClick(evt);
          }
        }}
      >
        <RichTextEditor.Toolbar {...toolbarProps}>
          {renderedControls}
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content w={"100%"} h={"100%"} {...editorProps} />

        <LoadingOverlay
          visible={uploadImageMutation.isPending || isPublishPending}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 1 }}
        />
      </RichTextEditor>
      {showActions && (
        <Group className={"justify-between"}>
          <FileButton
            accept="image/png,image/jpeg,image/gif"
            onChange={(payload) => {
              if (payload) {
                uploadImageMutation.mutate(payload);
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
            onClick={async () => {
              await onPublishClick?.();
            }}
          >
            Publish
          </Button>
        </Group>
      )}
    </>
  );
};

export { PostEditor };
