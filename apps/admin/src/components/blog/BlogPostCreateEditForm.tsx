import React, { useEffect, useRef } from "react";
import {
  ActionIcon,
  Button,
  Checkbox,
  FileButton,
  FileInput,
  Group,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  BLOG_POST_EDITOR_EXTENSIONS,
  createErrorNotification,
  useBlogPost,
  useBlogPostTags,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RichTextEditor } from "@mantine/tiptap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { Editor } from "@tiptap/core";
import { useRouter } from "next/router";
import { BlogPostEditor } from "@/components/blog/editor/BlogPostEditor.tsx";
import { IconPhoto } from "@tabler/icons-react";

const BlogPostCreateSchema = z.object({
  content: z.string().min(10, "Your post must not be empty."),
  title: z.string().min(1, "Your post must have a title."),
  tags: z
    .array(z.string())
    .min(1, "You must specify at least one tag.")
    .max(3, "You can only specify up to 3 tags."),
  image: z.instanceof(File, { message: "Must be a valid file." }).optional(),
  isDraft: z.boolean().default(true),
  targetPostId: z.string().optional(),
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

  const postTagsQuery = useBlogPostTags();
  const editingPostQuery = useBlogPost(editingPostId);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogPostCreateFormValues>({
    mode: "onSubmit",
    resolver: zodResolver(BlogPostCreateSchema),
    defaultValues: {
      tags: [],
      isDraft: true,
    },
  });

  const isDraft = watch("isDraft");

  const availableTags = postTagsQuery.data?.map((tag) => tag.name) || [];

  const postCreateMutation = useMutation({
    mutationFn: async (data: BlogPostCreateFormValues) => {
      await BlogPostService.blogPostControllerCreateV1({
        ...data,
        postId: data.targetPostId,
      });
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: `Post ${editingPostId ? "updated" : "saved"} successfully.`,
      });
      router.push("/dashboard/blog");
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
    if (editingPostId && editingPostQuery.data) {
      setValue("targetPostId", editingPostId);
      const { title, tags, content, isDraft } = editingPostQuery.data;
      setValue("title", title);
      setValue("content", content);
      editorRef.current?.commands.setContent(content);
      setValue(
        "tags",
        tags.map((tag) => tag.name),
      );
      setValue("isDraft", isDraft);
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
        onChange={(file) => {
          if (file) {
            setValue("image", file);
          }
        }}
      />
      <Checkbox
        {...register("isDraft")}
        checked={watch("isDraft")}
        onChange={(evt) => setValue("isDraft", evt.target.checked)}
        label="Draft"
        description={"Save as draft first."}
      />
      <Title size={"h5"}>Content</Title>
      <Text className={"text-dimmed text-sm"}>
        Make sure to keep your post saved.
      </Text>
      <BlogPostEditor
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
