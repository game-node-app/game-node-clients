import React from "react";
import { EditorOptions, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import { Placeholder } from "@tiptap/extension-placeholder";
import { BubbleMenu } from "@tiptap/react/menus";
import { useTranslation } from "@repo/locales";

interface Props extends Partial<EditorOptions> {
  onClick?: () => void;
}

const createCommentEditorExtensions = (placeholder: string) => [
  StarterKit,
  Placeholder.configure({
    placeholder,
  }),
];

const CommentEditor = ({ onClick, ...editorOptions }: Props) => {
  const { t } = useTranslation();

  const COMMENT_EDITOR_EXTENSIONS = createCommentEditorExtensions(
    t("comment.placeholders.writeComment"),
  );

  const editor = useEditor(
    {
      ...editorOptions,
      extensions: COMMENT_EDITOR_EXTENSIONS,
      immediatelyRender: window != undefined,
    },
    [editorOptions.content, COMMENT_EDITOR_EXTENSIONS],
  );

  if (!editor) return null;

  return (
    <RichTextEditor
      editor={editor}
      className={"w-full h-full"}
      onClick={onClick}
    >
      {editor && (
        <BubbleMenu editor={editor}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
          </RichTextEditor.ControlsGroup>
        </BubbleMenu>
      )}
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export { CommentEditor };
export { createCommentEditorExtensions };
