import React, { useMemo } from "react";
import {
  Group,
  Card,
  Image,
  Text,
  Title,
  Box,
  Stack,
  Badge,
  Spoiler,
  UnstyledButton,
} from "@mantine/core";
import {
  BLOG_POST_EDITOR_EXTENSIONS,
  BlogPostTags,
  EUserRoles,
  ItemDropdown,
  POST_EDITOR_EXTENSIONS,
  UserAvatarGroup,
  useUserRoles,
} from "#@/components";
import { IconCalendarMonth, IconTags } from "@tabler/icons-react";
import dayjs from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import { BlogPost } from "@repo/wrapper/server";
import { getCapitalizedText, getS3StoredUpload, Link } from "#@/util";

interface Props {
  post: BlogPost;
  withActions?: boolean;
  /**
   * Function triggered on image,
   * @param postId
   */
  onClick: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const BlogPostCard = ({
  post,
  onClick,
  onEdit,
  onDelete,
  withActions = false,
}: Props) => {
  const editor = useEditor(
    {
      extensions: BLOG_POST_EDITOR_EXTENSIONS,
      editable: false,
      content: post.content,
      immediatelyRender: false,
    },
    [post.content],
  );

  const userRoles = useUserRoles();

  const hasEditPermission = useMemo(() => {
    console.log(userRoles);
    return userRoles.some((role) =>
      [EUserRoles.ADMIN.valueOf(), EUserRoles.MOD.valueOf()].includes(role),
    );
  }, [userRoles]);

  const imageUrl = useMemo(() => {
    if (!post.image) return null;

    return getS3StoredUpload(`${post.image.filename}.${post.image.extension}`);
  }, [post.image]);

  if (!editor) return null;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      className="hover:shadow-xl transition-shadow duration-200 bg-transparent"
    >
      <Card.Section>
        <UnstyledButton onClick={() => onClick(post.id)}>
          <Image src={imageUrl} alt={post.title} />
        </UnstyledButton>
      </Card.Section>
      <Card.Section className={"flex flex-start flex-nowrap gap-5 px-2 my-2"}>
        <Box className={"max-w-48"}>
          <UserAvatarGroup userId={post.profileUserId} />
        </Box>
        <Group className={"flex-nowrap relative !flex-grow"}>
          <Group className={"gap-0"}>
            <IconCalendarMonth size={"1.5rem"} />
            <Text>{dayjs(post.createdAt).format("DD/MM/YYYY")}</Text>
          </Group>
          <BlogPostTags tags={post.tags} />

          {post.isDraft && <Badge color={"red"}>Draft</Badge>}
          {withActions && hasEditPermission && (
            <Box className={"ml-auto"}>
              <ItemDropdown>
                {onEdit != undefined && (
                  <ItemDropdown.EditButton onClick={() => onEdit(post.id)} />
                )}
                {onDelete != undefined && (
                  <ItemDropdown.RemoveButton
                    onClick={() => onDelete(post.id)}
                  />
                )}
              </ItemDropdown>
            </Box>
          )}
        </Group>
      </Card.Section>
      <Card.Section className={"px-1 min-h-24"}>
        <Stack>
          <UnstyledButton component={"a"} onClick={() => onClick(post.id)}>
            <Title size={"h2"}>{post.title}</Title>
          </UnstyledButton>

          <Spoiler
            expanded={false}
            hideLabel={""}
            showLabel={"Read more..."}
            maxHeight={80}
            onExpandedChange={() => onClick(post.id)}
            className={"w-full"}
          >
            <EditorContent className={"w-full"} editor={editor} />
          </Spoiler>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export { BlogPostCard };
