import { BlogPostCategoryLabel, UserAvatarGroup } from "#@/components";
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
import dayjs from "dayjs";

interface Props {
  post: BlogArticleDto;
  imageProps?: ImageProps;
  blogRoutePrefix: string;
}

/**
 * Editorial card: rounded cover, left-aligned headline, muted two-line excerpt and a single meta
 * row (author on the left, date on the right). References: Perplexity Discover, Google News.
 */
const BlogPostCard = ({ post, blogRoutePrefix }: Props) => {
  const imageUrl = post.cover.url;

  return (
    <Card
      radius="lg"
      padding="sm"
      className="relative bg-paper-1 w-full h-full transition-colors duration-200 active:bg-[#343333] [@media(hover:hover)]:hover:bg-[#2e2d2d]"
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
          <BlogPostCategoryLabel tags={post.tags} />
          <Title
            lineClamp={2}
            order={3}
            className={"text-left text-white text-xl leading-snug font-bold"}
          >
            {post.title}
          </Title>
          <Text lineClamp={2} size="sm" c="dimmed" className={"text-left"}>
            {post.excerpt}
          </Text>
        </Stack>
      </Link>
      <Group
        className={"mt-auto pt-3 px-1 pb-0.5 justify-between flex-nowrap gap-4"}
      >
        <Box className={"relative z-10 min-w-0 max-w-40 lg:max-w-48"}>
          <UserAvatarGroup
            avatarProps={{
              size: "sm",
            }}
            groupProps={{
              gap: 6,
            }}
            userId={post.profileUserId}
          />
        </Box>
        <Text size="xs" c="dimmed" className={"shrink-0"}>
          {dayjs(post.publishedAt).format("DD/MM/YYYY")}
        </Text>
      </Group>
    </Card>
  );
};

export { BlogPostCard };
