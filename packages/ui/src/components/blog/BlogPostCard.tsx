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
  EUserRoles,
  ItemDropdown,
  POST_EDITOR_EXTENSIONS,
  UserAvatarGroup,
  useUserRoles,
} from "#@/components";
import { IconCalendarMonth } from "@tabler/icons-react";
import dayjs from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import { BlogPost } from "@repo/wrapper/server";
import { getS3StoredUpload } from "#@/util";

interface Props {
  post: BlogPost;
  /**
   * Function triggered on image,
   * @param postId
   */
  onClick: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const BlogPostCard = ({ post, onClick, onEdit, onDelete }: Props) => {
  const editor = useEditor(
    {
      extensions: POST_EDITOR_EXTENSIONS,
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

          {post.isDraft && <Badge color={"red"}>Draft</Badge>}
          <Box className={"ml-auto"}>
            <ItemDropdown>
              {hasEditPermission && onEdit != undefined && (
                <ItemDropdown.EditButton onClick={() => onEdit(post.id)} />
              )}
              {hasEditPermission && onDelete != undefined && (
                <ItemDropdown.RemoveButton onClick={() => onDelete(post.id)} />
              )}
              <ItemDropdown.ShareButton onClick={() => {}} disabled={true} />
            </ItemDropdown>
          </Box>
        </Group>
      </Card.Section>
      <Card.Section className={"px-4 min-h-24"}>
        <Stack>
          <Title size={"h2"}>{post.title}</Title>
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
