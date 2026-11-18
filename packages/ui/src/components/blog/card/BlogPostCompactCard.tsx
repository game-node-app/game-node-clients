import { BlogPostCategoryLabel } from "#@/components";
import { Link } from "#@/util";
import { Card, Image, Stack, Text, Title } from "@mantine/core";
import { BlogArticleDto } from "@repo/wrapper/server";
import dayjs from "dayjs";

interface Props {
  post: BlogArticleDto;
  blogRoutePrefix?: string;
}

/**
 * Dense row for secondary posts: category, headline and date on the left, square cover on the
 * right (reference: Insight Timer list rows). The whole card is the link.
 */
const BlogPostCompactCard = ({ post, blogRoutePrefix = "/blog" }: Props) => {
  return (
    <Card
      radius="lg"
      padding="sm"
      className="relative flex flex-row items-center gap-3 bg-paper-1 w-full transition-colors duration-200 active:bg-[#343333] [@media(hover:hover)]:hover:bg-[#2e2d2d]"
    >
      <Stack className={"gap-1.5 min-w-0 flex-1"}>
        <BlogPostCategoryLabel tags={post.tags} />
        <Link
          href={`${blogRoutePrefix}/post/${post.id}`}
          className={"after:absolute after:inset-0 after:content-['']"}
        >
          <Title
            order={4}
            lineClamp={3}
            className={"text-left text-white text-base leading-snug font-bold"}
          >
            {post.title}
          </Title>
        </Link>
        <Text size="xs" c="dimmed">
          {dayjs(post.publishedAt).format("DD/MM/YYYY")}
        </Text>
      </Stack>
      <Image
        src={post.cover.url}
        alt={post.cover.alt}
        radius="md"
        className={"!size-24 !shrink-0 object-cover"}
      />
    </Card>
  );
};

export { BlogPostCompactCard };
