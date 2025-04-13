import React, { useMemo } from "react";
import {
  AspectRatio,
  Badge,
  Box,
  Card,
  Group,
  Image,
  ImageProps,
  Spoiler,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  ActionConfirm,
  BLOG_POST_EDITOR_EXTENSIONS,
  BlogPostTags,
  EUserRoles,
  ItemDropdown,
  UserAvatarGroup,
  useUserRoles,
} from "#@/components";
import { IconCalendarMonth } from "@tabler/icons-react";
import dayjs from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import { BlogPost, BlogPostService } from "@repo/wrapper/server";
import { getS3StoredUpload } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

interface Props {
  post: BlogPost;
  withActions?: boolean;
  /**
   * Function triggered on image,
   * @param postId
   */
  onClick: (postId: string) => void;
  onEdit?: (postId: string) => void;
  imageProps?: ImageProps;
}

const BlogPostCard = ({
  post,
  onClick,
  onEdit,
  withActions = false,
}: Props) => {
  const queryClient = useQueryClient();
  const [deleteConfirmOpened, deleteConfirmUtils] = useDisclosure();

  const editor = useEditor(
    {
      extensions: BLOG_POST_EDITOR_EXTENSIONS,
      editable: false,
      content: post.content,
      immediatelyRender: false,
    },
    [post.content],
  );

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      return BlogPostService.blogPostControllerDeleteV1(post.id);
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Successfully deleted post!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["blog"],
      });
    },
  });

  const userRoles = useUserRoles();

  const hasEditPermission = useMemo(() => {
    return userRoles.some((role) =>
      [EUserRoles.ADMIN, EUserRoles.MOD, EUserRoles.EDITOR].includes(role),
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
      className="hover:shadow-xl transition-shadow duration-200 bg-paper"
    >
      <ActionConfirm
        onConfirm={() => {
          deletePostMutation.mutate();
          deleteConfirmUtils.close();
        }}
        opened={deleteConfirmOpened}
        onClose={deleteConfirmUtils.close}
      />
      <Card.Section>
        <UnstyledButton onClick={() => onClick(post.id)} className={"w-full"}>
          <AspectRatio ratio={16 / 9}>
            <Image src={imageUrl} alt={post.title} />
          </AspectRatio>
        </UnstyledButton>
      </Card.Section>
      <Card.Section className={"flex flex-start flex-wrap gap-5 px-3 my-2"}>
        <Box className={"max-w-48"}>
          <UserAvatarGroup userId={post.profileUserId} />
        </Box>
        <Group className={"flex-nowrap relative !flex-grow"}>
          <Group className={"gap-0"}>
            <IconCalendarMonth size={"1.5rem"} />
            <Text>{dayjs(post.createdAt).format("DD/MM/YYYY")}</Text>
          </Group>
          <BlogPostTags tags={post.tags} />

          {withActions && hasEditPermission && (
            <Box className={"ml-auto"}>
              <ItemDropdown>
                {onEdit != undefined && (
                  <ItemDropdown.EditButton onClick={() => onEdit(post.id)} />
                )}
                <ItemDropdown.RemoveButton
                  onClick={() => deleteConfirmUtils.open()}
                />
              </ItemDropdown>
            </Box>
          )}
        </Group>
        {post.isDraft && <Badge color={"red"}>Draft</Badge>}
      </Card.Section>
      <Card.Section className={"p-2 min-h-24"}>
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
