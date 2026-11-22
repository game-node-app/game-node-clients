import {
  BlogPostCategoryLabel,
  BlogPostDate,
  UserAvatarGroup,
} from "#@/components";
import { Link } from "#@/util";
import { Box, Group, Image, Stack, Text, Title } from "@mantine/core";
import { BlogArticleDto } from "@repo/wrapper/server";

interface Props {
  post: BlogArticleDto;
}

/**
 * Hero card: tall cover on phones (so the text has room), wide from `lg`.
 */
const BlogPostFeaturedCard = ({ post }: Props) => {
  const imageUrl = post.cover.url;

  if (imageUrl == undefined) return null;

  return (
    <Box
      className={
        "relative w-full overflow-hidden rounded-2xl bg-media-fade aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
      }
    >
      <Image
        src={imageUrl}
        alt={post.cover.alt}
        className={"!absolute inset-0 !w-full !h-full object-cover"}
      />
      <Stack className="absolute inset-0" justify="flex-end">
        <Stack
          gap={8}
          className="media-ink bg-media-content-scrim p-4 shadow-[0_-8px_16px_var(--gn-media-content-scrim)]"
        >
          <BlogPostCategoryLabel tags={post.tags} />
          {/* The title link's ::after covers the whole card, so all of it opens the post. The
            author avatar is a profile link, so it sits above that overlay instead. */}
          <Link
            href={`/blog/post/${post.id}`}
            className={"after:absolute after:inset-0 after:content-['']"}
          >
            <Title
              order={2}
              lineClamp={3}
              className={"text-media text-2xl leading-tight font-extrabold"}
            >
              {post.title}
            </Title>
          </Link>
          <Text lineClamp={2} size="sm" c="dimmed">
            {post.excerpt}
          </Text>
          <Group className={"mt-1 flex-nowrap gap-3"}>
            <Box className={"relative z-10 min-w-0 max-w-40 lg:max-w-48"}>
              <UserAvatarGroup
                avatarProps={{ size: "sm" }}
                userId={post.profileUserId}
                textProps={{ c: "var(--gn-media-text)" }}
              />
            </Box>
            <BlogPostDate
              publishedAt={post.publishedAt}
              className={"shrink-0"}
            />
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};

export { BlogPostFeaturedCard };
