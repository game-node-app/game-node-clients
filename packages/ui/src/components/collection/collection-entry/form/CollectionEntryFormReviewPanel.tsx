import React, { useEffect } from "react";
import {
  CenteredLoading,
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameInfoReviewEditor,
  GameRating,
  IGameAddFormProps,
  TGameAddOrUpdateValues,
  useReview,
  useReviewForUserIdAndGameId,
  useUserId,
} from "#@/components";
import { Input, InputLabel, Stack } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

const CollectionEntryFormReviewPanel = ({
  gameId,
}: Pick<IGameAddFormProps, "gameId">) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TGameAddOrUpdateValues>();

  const userId = useUserId();

  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);

  const rating = watch("review.rating");

  const quickReviewEditor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      content: reviewQuery.data?.content,
      immediatelyRender: false,
      onBlur: ({ editor }) => {
        const html = editor.getHTML();
        setValue("review.content", html);
      },
    },
    [reviewQuery.data?.content],
  );

  useEffect(() => {
    if (reviewQuery.data) {
      setValue("review", reviewQuery.data);
    }
  }, [reviewQuery.data, setValue]);

  if (reviewQuery.isLoading) {
    return <CenteredLoading />;
  }

  return (
    <Stack>
      <Input.Wrapper
        label={"Leave a quick review"}
        description={"You can always edit it later."}
        error={errors.review?.message}
      >
        <GameRating
          readOnly={false}
          className={"mt-2"}
          value={rating ?? undefined}
          size={"lg"}
          onChange={(v) => setValue("review.rating", v)}
        />
      </Input.Wrapper>
      {rating != undefined && (
        <Input.Wrapper
          description={"Optional. Leave empty to create a score-only review."}
        >
          <RichTextEditor editor={quickReviewEditor}>
            <RichTextEditor.Content mih={"20vh"} />
          </RichTextEditor>
        </Input.Wrapper>
      )}
    </Stack>
  );
};

export { CollectionEntryFormReviewPanel };
