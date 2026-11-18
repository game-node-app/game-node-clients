import { BlogPostCard, useBlogPosts } from "#@/components";
import { Link } from "#@/util";
import { Box, Group, Skeleton, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconChevronRight } from "@tabler/icons-react";

interface Props {
  /** Tag id to filter by (`news`, `review`, ...). */
  tag: string;
  title: string;
  limit?: number;
}

/**
 * One category of the blog home: a header with a "see all" link and a horizontally scrolling
 * row of cards. Renders nothing when the category has no posts.
 */
const BlogPostsCategorySection = ({ tag, title, limit = 8 }: Props) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useBlogPosts({ tag, limit });

  if (isError || (!isLoading && (data?.data.length ?? 0) === 0)) return null;

  return (
    <section className={"w-full"}>
      <Group className={"justify-between mb-3 flex-nowrap"}>
        <Title order={3} className={"text-white text-xl font-bold"}>
          {title}
        </Title>
        <Link
          href={`/blog/archive?tag=${encodeURIComponent(tag)}`}
          className={"min-h-min"}
        >
          <Group className={"gap-0.5 flex-nowrap text-dimmed"}>
            <Text size="sm" c="dimmed">
              {t("blog.buttons.seeMore")}
            </Text>
            <IconChevronRight size={16} />
          </Group>
        </Link>
      </Group>
      <Box
        className={
          "flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {isLoading &&
          [0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              h={260}
              radius="lg"
              className={"!w-64 !shrink-0"}
            />
          ))}
        {data?.data.map((post) => (
          <Box key={post.id} className={"w-64 shrink-0 snap-start"}>
            <BlogPostCard post={post} blogRoutePrefix="/blog" />
          </Box>
        ))}
      </Box>
    </section>
  );
};

export { BlogPostsCategorySection };
