import React from "react";
import {
  Box,
  Container,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  BLOG_POST_EDITOR_EXTENSIONS,
  BlogPostTags,
  CenteredLoading,
  POST_EDITOR_EXTENSIONS,
  useBlogPost,
  UserAvatarGroup,
} from "#@/components";
import { IconCalendarMonth, IconTags } from "@tabler/icons-react";
import dayjs from "dayjs";
import { getS3StoredUpload } from "#@/util";
import { EditorContent, useEditor } from "@tiptap/react";

interface Props {
  postId: string;
}

const BlogPostDetailView = ({ postId }: Props) => {
  const postQuery = useBlogPost(postId);

  const post = postQuery.data;

  const presentationImageSrc = post?.image
    ? getS3StoredUpload(`${post.image.filename}.${post.image.extension}`)
    : null;

  const editor = useEditor(
    {
      extensions: BLOG_POST_EDITOR_EXTENSIONS,
      editable: false,
      content: post?.content,
      immediatelyRender: false,
    },
    [post?.content],
  );

  if (postQuery.isLoading || post == undefined) {
    return <CenteredLoading />;
  }

  return (
    <Container className={"flex flex-col items-center"}>
      <Title>{post.title}</Title>
      <Group className={"my-3"}>
        <Box className={"max-w-48"}>
          <UserAvatarGroup userId={post.profileUserId} />
        </Box>
        <Group className={"gap-0"}>
          <IconCalendarMonth size={"1.5rem"} />
          <Text>{dayjs(post.createdAt).format("DD/MM/YYYY")}</Text>
        </Group>
        <BlogPostTags tags={post.tags} />
      </Group>
      {presentationImageSrc && (
        <Image
          className={"rounded-sm"}
          src={presentationImageSrc}
          alt={post.title}
        />
      )}
      {editor && (
        <Box className={"lg:px-3 mt-5"}>
          <EditorContent className={"w-full"} editor={editor} />
        </Box>
      )}
    </Container>
  );
};

export { BlogPostDetailView };
