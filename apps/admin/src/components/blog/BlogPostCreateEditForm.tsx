import React, { useEffect, useRef } from "react";
import {
  Button,
  Checkbox,
  FileInput,
  Group,
  Input,
  NumberInput,
  TagsInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  CenteredLoading,
  createErrorNotification,
  GameRating,
  GameSearchSelectModal,
  useBlogPost,
  useBlogPostTags,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { Editor } from "@tiptap/core";
import { useRouter } from "next/router";
import { BlogPostEditor } from "@/components/blog/editor/BlogPostEditor.tsx";
import { useDisclosure } from "@mantine/hooks";

const BlogPostCreateSchema = z
  .object({
    content: z.string().min(10, "Your post must not be empty."),
    title: z.string().min(1, "Your post must have a title."),
    tags: z
      .array(z.string())
      .min(1, "You must specify at least one tag.")
      .max(3, "You can only specify up to 3 tags."),
    image: z.instanceof(File, { message: "Must be a valid file." }).optional(),
    isDraft: z.boolean(),
    isGameReview: z.boolean(),
    reviewInfo: z
      .object({
        gameId: z.number({ message: "Associated game must be set." }).min(0),
        rating: z.number({ message: "A rating is required." }).min(0).max(5),
      })
      .optional(),
  })
  .refine((data) => !(data.isGameReview && data.reviewInfo == undefined), {
    message: "Review info must be provided for game reviews.",
    path: ["reviewInfo"],
  });

type BlogPostCreateFormValues = z.infer<typeof BlogPostCreateSchema>;

interface Props {
  editingPostId?: string;
}

const BlogPostCreateEditForm = ({ editingPostId }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const editorRef = useRef<Editor>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [gameSelectModalOpened, gameSelectModalUtils] = useDisclosure();

  const postTagsQuery = useBlogPostTags();
  const editingPostQuery = useBlogPost(editingPostId);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<BlogPostCreateFormValues>({
    mode: "onSubmit",
    resolver: zodResolver(BlogPostCreateSchema),
    defaultValues: {
      tags: [],
      isDraft: true,
      isGameReview: false,
    },
  });

  const isDraft = watch("isDraft");
  const isGameReview = watch("isGameReview");

  const availableTags = postTagsQuery.data?.map((tag) => tag.name) || [];

  const postCreateMutation = useMutation({
    mutationFn: async (data: BlogPostCreateFormValues) => {
      await BlogPostService.blogPostControllerCreateV1({
        ...data,
        reviewInfo: data.isGameReview ? data.reviewInfo : undefined,
        postId: editingPostId,
      });
    },
    onSuccess: async () => {
      notifications.show({
        color: "green",
        message: `Post ${editingPostId ? "updated" : "saved"} successfully.`,
      });

      // Waits for invalidation before routing
      await queryClient.invalidateQueries({
        queryKey: ["blog"],
      });

      await router.push("/dashboard/blog");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["blog"],
      });
    },
    onError: createErrorNotification,
  });

  // Updates form to match current editing post
  useEffect(() => {
    if (editingPostQuery.data) {
      const { title, tags, content, isDraft, review } = editingPostQuery.data;
      setValue("title", title);
      setValue("content", content);
      setValue(
        "tags",
        tags.map((tag) => tag.name),
      );
      setValue("isDraft", isDraft);
      if (review) {
        setValue("isGameReview", true);
        setValue("reviewInfo", {
          rating: review.rating,
          gameId: review.gameId,
        });
      }
    }
  }, [editingPostId, editingPostQuery.data, setValue]);

  return (
    <form
      className={"flex flex-col gap-3"}
      ref={formRef}
      onSubmit={handleSubmit((data) => {
        postCreateMutation.mutate(data);
      })}
    >
      <GameSearchSelectModal
        onSelected={(gameId) => {
          setValue("reviewInfo.gameId", gameId);
          gameSelectModalUtils.close();
        }}
        opened={gameSelectModalOpened}
        onClose={gameSelectModalUtils.close}
      />
      <TextInput
        label="Title"
        placeholder="Latest development from GameNode"
        error={errors.title?.message}
        {...register("title")}
        withAsterisk
      />
      <TagsInput
        {...register("tags")}
        value={watch("tags")}
        data={availableTags}
        label="Tags"
        description="Type and press Enter to submit a new tag. Created tags will also be selectable in the future."
        placeholder="game, development"
        error={errors.tags?.message}
        onChange={(tags) => setValue("tags", tags)}
        withAsterisk
        clearable
      />
      <FileInput
        label={"Presentation image"}
        description={
          editingPostId
            ? "Replace image. Leave empty to keep the current one."
            : "Upload image"
        }
        withAsterisk={editingPostId == undefined}
        onChange={(file) => {
          if (file) {
            setValue("image", file);
          }
        }}
      />
      <Checkbox
        {...register("isDraft")}
        checked={isDraft}
        onChange={(evt) => setValue("isDraft", evt.target.checked)}
        label="Draft"
        description={"Save as draft first."}
      />
      <Checkbox
        {...register("isGameReview")}
        checked={isGameReview}
        onChange={(evt) => setValue("isGameReview", evt.target.checked)}
        label="Game review"
        description={"If this is a game review. This will enable more options."}
        error={errors.isGameReview?.message}
      />
      {isGameReview && (
        <>
          <NumberInput
            label={"Associated game"}
            description={"The game this review is related to."}
            withAsterisk
            value={watch("reviewInfo.gameId")}
            onClick={gameSelectModalUtils.open}
            error={
              errors.reviewInfo?.gameId?.message ||
              errors.reviewInfo?.rating?.message
            }
          />
          <Input.Wrapper
            label={"Rating"}
            withAsterisk
            error={errors.reviewInfo?.rating?.message}
          >
            <GameRating
              readOnly={false}
              value={watch("reviewInfo.rating")}
              onChange={(v) => setValue("reviewInfo.rating", v)}
            />
          </Input.Wrapper>
        </>
      )}
      <Title size={"h5"} className={"mt-5"}>
        Content
      </Title>
      <Text className={"text-dimmed text-sm"}>
        Make sure to keep your post saved.
      </Text>
      <BlogPostEditor
        editingPostId={editingPostId}
        onCreate={({ editor }) => {
          editorRef.current = editor;
        }}
        onUpdate={({ editor }) => setValue("content", editor.getHTML())}
        isPending={postCreateMutation.isPending}
      />
      <Group className={"justify-end"}>
        <Button type={"submit"} bg={isDraft ? "blue" : "brand"}>
          {isDraft ? "Save" : "Publish"}
        </Button>
      </Group>
    </form>
  );
};

export { BlogPostCreateEditForm };
