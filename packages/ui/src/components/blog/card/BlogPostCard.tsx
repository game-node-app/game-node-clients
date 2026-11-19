import {
  BlogPostCategoryLabel,
  BlogPostDate,
  UserAvatarGroup,
} from "#@/components";
import { Link } from "#@/util";
import {
  AspectRatio,
  Box,
  Card,
  Group,
  Image,
  ImageProps,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { BlogArticleDto } from "@repo/wrapper/server";
import type { ReactNode } from "react";

interface Props {
  post: BlogArticleDto;
  imageProps?: ImageProps;
  blogRoutePrefix: string;
  categoryId?: string;
  details?: ReactNode;
}

/**
 * Editorial card: rounded cover, left-aligned headline, muted two-line excerpt and a single meta
 * row (author on the left, date on the right). References: Perplexity Discover, Google News.
 */
const BlogPostCard = ({
  post,
  blogRoutePrefix,
  categoryId,
  details,
}: Props) => {
  const imageUrl = post.cover.url;

  return (
    <Card
      radius="lg"
      padding="sm"
      className="relative bg-paper-1 w-full h-full transition-colors duration-200 [@media(hover:hover)]:hover:bg-paper-4 active:!bg-paper-6"
    >
      {/* The link's ::after covers the whole card, so all of it opens the post. The author row
          stays outside the link (its avatar is a profile link: no <a> inside <a>) and sits above
          that overlay. */}
      <Link
        href={`${blogRoutePrefix}/post/${post.id}`}
        className={
          "flex flex-col gap-3 w-full after:absolute after:inset-0 after:content-['']"
        }
      >
        <AspectRatio ratio={16 / 10}>
          <Image src={imageUrl} alt={post.cover.alt} radius="md" />
        </AspectRatio>
        <Stack className={"gap-1.5 px-1"}>
          <BlogPostCategoryLabel tags={post.tags} categoryId={categoryId} />
          <Title
            lineClamp={2}
            order={3}
            className={
              "text-left text-white text-xl leading-snug font-bold [overflow-wrap:anywhere]"
            }
          >
            {post.title}
          </Title>
          <Text
            lineClamp={2}
            size="sm"
            c="dimmed"
            className={"text-left [overflow-wrap:anywhere]"}
          >
            {post.excerpt}
          </Text>
        </Stack>
      </Link>
      {details && <Box className="px-1 pt-3">{details}</Box>}
      <Group
        justify="space-between"
        gap="xs"
        className="mt-auto px-1 pt-3 pb-0.5"
      >
        <Box className="relative z-10 min-w-0 max-w-full">
          <UserAvatarGroup
            avatarProps={{
              size: "sm",
            }}
            groupProps={{
              gap: 6,
              wrap: "nowrap",
              className: "min-w-0",
            }}
            textProps={{ className: "min-w-0 [overflow-wrap:anywhere]" }}
            userId={post.profileUserId}
          />
        </Box>
        <BlogPostDate
          publishedAt={post.publishedAt}
          className="ml-auto shrink-0"
        />
      </Group>
    </Card>
  );
};

export { BlogPostCard };
