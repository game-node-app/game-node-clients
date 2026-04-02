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
import { useTranslation } from "@repo/locales";

const CollectionEntryFormReviewPanel = ({
  gameId,
}: Pick<IGameAddFormProps, "gameId">) => {
  const { t } = useTranslation();
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
        label={t("collectionEntry.review.quickLabel")}
        description={t("collectionEntry.review.quickDescription")}
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
          description={t("collectionEntry.review.optionalDescription")}
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
