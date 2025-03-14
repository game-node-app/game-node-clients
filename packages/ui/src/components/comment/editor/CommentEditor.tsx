import React from "react";
import { BubbleMenu, EditorOptions, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import { Placeholder } from "@tiptap/extension-placeholder";

interface Props extends Partial<EditorOptions> {
  onClick?: () => void;
}

export const COMMENT_EDITOR_EXTENSIONS = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Write a comment about this...",
  }),
];

const CommentEditor = ({ onClick, ...editorOptions }: Props) => {
  const editor = useEditor(
    {
      ...editorOptions,
      extensions: COMMENT_EDITOR_EXTENSIONS,
      immediatelyRender: window != undefined,
    },
    [editorOptions.content],
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
