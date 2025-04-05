import React, { useRef } from "react";
import {
  Checkbox,
  FileInput,
  Stack,
  TagsInput,
  TextInput,
  Title,
} from "@mantine/core";
import { createErrorNotification, PostEditor } from "@repo/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RichTextEditor } from "@mantine/tiptap";
import { useMutation } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { Editor } from "@tiptap/core";

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

const BlogPostCreateForm = () => {
  const editor = useRef<Editor>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlogPostCreateFormValues>({
    mode: "onSubmit",
    resolver: zodResolver(BlogPostCreateSchema),
    defaultValues: {
      tags: [],
    },
  });

  const postCreateMutation = useMutation({
    mutationFn: async (data: BlogPostCreateFormValues) => {
      await BlogPostService.blogPostControllerCreateV1(data);
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Post saved successfully.",
      });
      editor.current?.commands.clearContent();
      reset();
    },
    onError: createErrorNotification,
  });

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit((data) => {
        console.log(data);
        postCreateMutation.mutate(data);
      })}
    >
      <Stack>
        <TextInput
          label="Title"
          placeholder="Latest development from GameNode"
          error={errors.title?.message}
          {...register("title")}
          withAsterisk
        />
        <TagsInput
          label="Tags"
          description="Type and press Enter to submit a new tag. Created tags will be selectable in the future."
          placeholder="game, development"
          data={["game", "development", "news", "gamedev", "gamedev news"]}
          error={errors.tags?.message}
          {...register("tags")}
          onChange={(tags) => setValue("tags", tags)}
          withAsterisk
          clearable
        />
        <FileInput
          label={"Presentation image"}
          description={"Optional. Greatly improves visibility."}
          onChange={(file) => {
            if (file) {
              setValue("image", file);
            }
          }}
        />
        <Checkbox
          {...register("isDraft")}
          label="Draft"
          description={"Save as draft first. You can publish it later."}
        />
        <Title size={"h5"}>Content</Title>
        <PostEditor
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
      </Stack>
    </form>
  );
};

export { BlogPostCreateForm };
