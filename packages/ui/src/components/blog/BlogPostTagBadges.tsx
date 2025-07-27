import React from "react";
import { CenteredLoading, useBlogPostTags } from "#@/components";
import { Badge, Group } from "@mantine/core";
import { Link } from "#@/util";

const BlogPostTagBadges = () => {
  const { data, isLoading } = useBlogPostTags();

  return (
    <Group className={"gap-2"}>
      {isLoading && <CenteredLoading />}
      {data?.map((tag) => (
        <Link key={tag.id} href={`/blog?tag=${tag.id}`} className={"min-h-min"}>
          <Badge>{tag.name}</Badge>
        </Link>
      ))}
    </Group>
  );
};

export { BlogPostTagBadges };
