import React, { useMemo } from "react";
import {
  AspectRatio,
  Badge,
  Box,
  Card,
  Group,
  Image,
  ImageProps,
  Text,
  Title,
} from "@mantine/core";
import {
  ActionConfirm,
  BLOG_POST_EDITOR_EXTENSIONS,
  EUserRoles,
  ItemDropdown,
  UserAvatarGroup,
  useUserRoles,
} from "#@/components";
import dayjs from "dayjs";
import { useEditor } from "@tiptap/react";
import { BlogPost, BlogPostService } from "@repo/wrapper/server";
import { getS3StoredUpload, Link } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

interface Props {
  post: BlogPost;
  withActions?: boolean;
  onEdit?: (postId: string) => void;
  imageProps?: ImageProps;
  blogRoutePrefix: string;
}

const BlogPostCard = ({
  post,
  blogRoutePrefix,
  onEdit,
  withActions = false,
}: Props) => {
  const queryClient = useQueryClient();
  const [deleteConfirmOpened, deleteConfirmUtils] = useDisclosure();

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

  return (
    <Card
      shadow="sm"
      radius="md"
      className="hover:shadow-xl transition-shadow duration-200 bg-paper w-full h-full"
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
        <AspectRatio ratio={37 / 28}>
          <Image src={imageUrl} alt={post.title} />
        </AspectRatio>
      </Card.Section>
      <Card.Section className={"px-3 my-3"}>
        <Link href={`${blogRoutePrefix}/post/${post.id}`} className={"w-full"}>
          <Title lineClamp={2} size={"h3"} className={"text-center text-white"}>
            {post.title}
          </Title>
        </Link>
      </Card.Section>
      <Card.Section
        className={"flex justify-between flex-nowrap gap-5 px-3 my-2 mt-auto"}
      >
        <Box className={"max-w-40 lg:max-w-48"}>
          <UserAvatarGroup
            avatarProps={{
              size: "sm",
            }}
            groupProps={{
              gap: 3,
            }}
            userId={post.profileUserId}
          />
        </Box>
        <Group className={"relative items-baseline"}>
          {post.isDraft && <Badge color={"red"}>Draft</Badge>}
          <Text>{dayjs(post.createdAt).format("DD/MM/YYYY")}</Text>

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
      </Card.Section>
    </Card>
  );
};

export { BlogPostCard };
