import React, { MutableRefObject, useEffect, useMemo } from "react";
import { Box, BoxComponentProps, Menu } from "@mantine/core";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { RichTextEditor, RichTextEditorProps } from "@mantine/tiptap";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Editor } from "@tiptap/core";
import { useUserId, useReviewForUserIdAndGameId } from "#@/components";

interface IGameInfoReviewEditorProps
  extends Partial<Omit<RichTextEditorProps, "onBlur" | "editor">> {
  editorRef?: MutableRefObject<Editor | null>;
  gameId: number;
  onBlur: (html: string) => void;
  stickyOffset?: number;
}

export const DEFAULT_REVIEW_EDITOR_EXTENSIONS = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Review content. Leave empty to create a score-only review.",
  }),
];

const GameInfoReviewEditor = ({
  editorRef,
  gameId,
  onBlur,
  stickyOffset = 65,
  ...others
}: IGameInfoReviewEditorProps) => {
  const userId = useUserId();
  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);
  const previousContent = useMemo(() => {
    return reviewQuery.data?.content || "";
  }, [reviewQuery.data]);

  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      content: previousContent,
      onBlur: (e) => {
        const html = e.editor.getHTML();
        onBlur(html ?? "");
      },
      immediatelyRender: window != undefined,
    },
    [previousContent],
  );

  useEffect(() => {
    if (editor != null && editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  if (!editor) return null;

  return (
    <Box p={0} mx={0} w={"100%"}>
      <RichTextEditor w={"100%"} mx={0} editor={editor} {...others}>
        <RichTextEditor.Toolbar sticky stickyOffset={stickyOffset} w={"100%"}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
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
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content
          w={"100%"}
          h={"100%"}
          mih={{ base: "35vh", lg: "25vh" }}
        />
      </RichTextEditor>
    </Box>
  );
};

export { GameInfoReviewEditor };
