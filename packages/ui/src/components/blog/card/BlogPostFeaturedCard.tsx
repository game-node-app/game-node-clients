import { BlogPostCategoryLabel, UserAvatarGroup } from "#@/components";
import { Link } from "#@/util";
import { Box, Group, Image, Stack, Text, Title } from "@mantine/core";
import { BlogArticleDto } from "@repo/wrapper/server";
import dayjs from "dayjs";

interface Props {
  post: BlogArticleDto;
}

/**
 * Hero card: tall cover on phones (so the text has room), wide from `lg`. A strong bottom
 * gradient keeps the headline and excerpt legible on any cover.
 */
const BlogPostFeaturedCard = ({ post }: Props) => {
  const imageUrl = post.cover.url;

  if (imageUrl == undefined) return null;

  return (
    <Box
      className={
        "relative w-full overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
      }
    >
      <Image
        src={imageUrl}
        alt={post.cover.alt}
        className={"!absolute inset-0 !w-full !h-full object-cover"}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_25%,_rgba(10,10,10,0.78)_62%,_rgba(0,0,0,0.96)_100%)]"
      />
      <Stack className={"absolute inset-x-0 bottom-0 gap-2 p-4 text-gray-100"}>
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
            className={"text-white text-2xl leading-tight font-extrabold"}
          >
            {post.title}
          </Title>
        </Link>
        <Text lineClamp={2} size="sm" className={"text-gray-300"}>
          {post.excerpt}
        </Text>
        <Group className={"mt-1 flex-nowrap gap-3"}>
          <Box className={"relative z-10 min-w-0 max-w-40 lg:max-w-48"}>
            <UserAvatarGroup
              avatarProps={{ size: "sm" }}
              userId={post.profileUserId}
            />
          </Box>
          <Text size="xs" className={"shrink-0 text-gray-400"}>
            {dayjs(post.publishedAt).format("DD/MM/YYYY")}
          </Text>
        </Group>
      </Stack>
    </Box>
  );
};

export { BlogPostFeaturedCard };
