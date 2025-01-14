import React, { useMemo, useRef } from "react";
import { Box, BoxComponentProps } from "@mantine/core";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { RichTextEditor, RichTextEditorProps } from "@mantine/tiptap";
import useReviewForUserId from "@/components/review/hooks/useReviewForUserIdAndGameId";
import useUserId from "@/components/auth/hooks/useUserId";
import { Placeholder } from "@tiptap/extension-placeholder";

interface IGameInfoReviewEditorProps extends BoxComponentProps {
    gameId: number;
    onBlur: (html: string) => void;
}

export const DEFAULT_REVIEW_EDITOR_EXTENSIONS = [
    StarterKit,
    Placeholder.configure({
        placeholder: "I had a great time playing this, but...",
    }),
];

const GameInfoReviewEditor = ({ gameId, onBlur }: IGameInfoReviewEditorProps) => {
    const userId = useUserId();
    const reviewQuery = useReviewForUserId(userId, gameId);
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
        },
        [previousContent],
    );

    if (!editor) return null;

    return (
        <RichTextEditor w={"100%"} h={"100%"} mx={0} editor={editor}>
            <RichTextEditor.Toolbar sticky w={"100%"}>
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
            <RichTextEditor.Content w={"100%"} h={"100%"} mih={"35vh"} />
        </RichTextEditor>
    );
};

export default GameInfoReviewEditor;
