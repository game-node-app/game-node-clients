import React from "react";
import { Group, Card, Image, Text, Title, Box, Stack } from "@mantine/core";
import { UserAvatarGroup } from "#@/components";
import { IconCalendarMonth } from "@tabler/icons-react";
import dayjs from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

interface Props {
  post: {
    image: string;
    title: string;
    content: string;
    createdAt: string;
    profileUserId: string;
  };
}

const BlogPostCard = ({ post }: Props) => {
  const editor = useEditor(
    {
      extensions: [StarterKit],
      editable: false,
      content: post.content,
    },
    [post.content],
  );

  if (!editor) return null;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      className="hover:shadow-xl transition-shadow duration-200 bg-transparent"
    >
      <Card.Section>
        <Image src={post.image} alt={post.title} />
      </Card.Section>
      <Card.Section className={"flex flex-start flex-nowrap gap-5 px-4 my-5"}>
        <Box className={"max-w-48"}>
          <UserAvatarGroup userId={post.profileUserId} />
        </Box>
        <Group className={"flex-nowrap gap-1"}>
          <IconCalendarMonth size={"1.5rem"} />
          <Text fz={"md"}>{dayjs(post.createdAt).format("DD/MM/YYYY")}</Text>
        </Group>
      </Card.Section>
      <Card.Section className={"px-4 min-h-24"}>
        <Stack>
          <Title size={"h2"}>{post.title}</Title>
          <Text lineClamp={2}>
            <EditorContent editor={editor} />
          </Text>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export { BlogPostCard };
