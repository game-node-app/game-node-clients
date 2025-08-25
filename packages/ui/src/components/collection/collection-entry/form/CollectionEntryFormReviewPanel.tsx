import React, { useEffect } from "react";
import {
  CenteredLoading,
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameRating,
  IGameAddFormProps,
  TGameAddOrUpdateValues,
  useReviewForUserIdAndGameId,
  useUserId,
} from "#@/components";
import { Input, ScrollArea, Stack } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";

const CollectionEntryFormReviewPanel = ({
  gameId,
}: Pick<IGameAddFormProps, "gameId">) => {
  const {
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
        setValue("review.content", html, {
          shouldTouch: true,
        });
      },
    },
    [reviewQuery.data?.content],
  );

  useEffect(() => {
    if (reviewQuery.data) {
      setValue("review", reviewQuery.data, {
        shouldTouch: false,
        shouldDirty: false,
      });
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
          onChange={(v) =>
            setValue("review.rating", v, {
              shouldTouch: true,
            })
          }
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
