import React from "react";
import { Stack, TextInput, Title } from "@mantine/core";
import { PostEditor } from "@repo/ui";
import { useForm } from "react-hook-form";

const BlogPostCreateForm = () => {
  const form = useForm();

  return (
    <form>
      <Stack>
        <Title order={3}>Create a new blog post</Title>
        <TextInput
          label="Title"
          placeholder="Latest development from GameNode"
        />
        <PostEditor onPublishClick={() => {}} />
      </Stack>
    </form>
  );
};

export { BlogPostCreateForm };
