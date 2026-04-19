import {
  CenteredLoading,
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameRating,
  IGameAddFormProps,
  TGameAddOrUpdateValues,
  useReviewForUserIdAndGameId,
  useUserId,
} from "#@/components";
import { Input, Stack } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useTranslation } from "@repo/locales";
import { useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

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
      setValue(
        "review",
        {
          rating: reviewQuery.data.rating,
          content: reviewQuery.data.content,
        },
        {
          shouldTouch: true,
          shouldDirty: true,
        },
      );
      console.log("Review data loaded into form", reviewQuery.data);
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
