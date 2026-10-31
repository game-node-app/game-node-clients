import { CenteredLoading, useBlogPostTags } from "#@/components";
import { Link } from "#@/util";
import { Badge, Group } from "@mantine/core";

const BlogPostTagBadges = () => {
  const { data, isLoading } = useBlogPostTags();

  return (
    <Group className={"gap-2"}>
      {isLoading && <CenteredLoading />}
      {data?.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog/archive?tag=${encodeURIComponent(tag.id)}`}
          className={"min-h-min"}
        >
          <Badge>{tag.name}</Badge>
        </Link>
      ))}
    </Group>
  );
};

export { BlogPostTagBadges };