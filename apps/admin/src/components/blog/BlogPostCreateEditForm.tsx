import React, { useEffect, useRef } from "react";
import {
  Checkbox,
  FileInput,
  Stack,
  TagsInput,
  TextInput,
  Title,
} from "@mantine/core";
import {
  BLOG_POST_EDITOR_EXTENSIONS,
  createErrorNotification,
  PostEditor,
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

const BlogPostCreateSchema = z.object({
  content: z.string().min(10, "Your post must not be empty."),
  title: z.string().min(1, "Your post must have a title."),
  tags: z
    .array(z.string())
    .min(1, "You must specify at least one tag.")
    .max(3, "You can only specify up to 3 tags."),
  image: z.instanceof(File, { message: "Must be a valid file." }).optional(),
  isDraft: z.boolean().default(true),
});

type BlogPostCreateFormValues = z.infer<typeof BlogPostCreateSchema>;

interface Props {
  editingPostId?: string;
}

const BlogPostCreateEditForm = ({ editingPostId }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const editor = useRef<Editor>(null);
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
      isDraft: false,
    },
  });

  const availableTags = postTagsQuery.data?.map((tag) => tag.name) || [];

  const postCreateMutation = useMutation({
    mutationFn: async (data: BlogPostCreateFormValues) => {
      console.log("Sent data: ", data);
      await BlogPostService.blogPostControllerCreateV1({
        ...data,
        // Necessary because multipart/form-data can't parse booleans directly.
        isDraft: String(data.isDraft) as unknown as boolean,
        postId: editingPostId,
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
        queryKey: ["blog", "posts"],
      });
    },
    onError: createErrorNotification,
  });

  // Updates form to match current editing post
  useEffect(() => {
    if (editingPostId && editingPostQuery.data) {
      const { title, tags, content, isDraft } = editingPostQuery.data;
      setValue("title", title);
      setValue("content", content);
      editor.current?.commands.setContent(content);
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
        console.log(data);
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
        description={
          "Save as draft first. This option is temporarily unavailable."
        }
        disabled={true}
      />
      <Title size={"h5"}>Content</Title>
      <PostEditor
        extensions={BLOG_POST_EDITOR_EXTENSIONS}
        isPublishPending={postCreateMutation.isPending}
        onPublishClick={() => {
          formRef.current?.requestSubmit();
        }}
        editorOptions={{
          onCreate: (editorCreateProps) => {
            editor.current = editorCreateProps.editor;
          },
          onUpdate: ({ editor }) => {
            setValue("content", editor.getHTML());
          },
        }}
        toolbarProps={{
          sticky: true,
          stickyOffset: 85,
        }}
        controls={
          <>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Code />
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

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>
          </>
        }
      />
    </form>
  );
};

export { BlogPostCreateEditForm };
