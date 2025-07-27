import React from "react";
import {
  BLOG_POST_EDITOR_EXTENSIONS,
  createErrorNotification,
  getS3StoredUpload,
  PostImageLightboxContext,
} from "@repo/ui";
import { RichTextEditor } from "@mantine/tiptap";
import { LoadingOverlay } from "@mantine/core";
import { EditorOptions, useEditor } from "@tiptap/react";
import { useMutation } from "@tanstack/react-query";
import { PostsService } from "@repo/wrapper/server";

interface Props
  extends Partial<
    Omit<EditorOptions, "editor" | "extensions" | "onDrop" | "onPaste">
  > {
  isPending: boolean;
}

const BlogPostEditor = ({ isPending, ...editorOptions }: Props) => {
  const editor = useEditor(
    {
      ...editorOptions,
      extensions: BLOG_POST_EDITOR_EXTENSIONS,
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
    },
    [editorOptions.content],
  );

  const uploadImageMutation = useMutation({
    gcTime: 0,
    retry: 2,
    mutationFn: async (file: File) => {
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
        })
        .createParagraphNear()
        .run();

      return response;
    },
    onError: createErrorNotification,
  });

  return (
    <PostImageLightboxContext>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={80}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content
          w={"100%"}
          h={"100%"}
          mih={{
            base: "20vh",
            lg: "25vh",
          }}
        />

        <LoadingOverlay
          visible={uploadImageMutation.isPending || isPending}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 1 }}
        />
      </RichTextEditor>
    </PostImageLightboxContext>
  );
};

export { BlogPostEditor };
