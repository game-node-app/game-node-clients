import { Group, Text } from "@mantine/core";
import React from "react";
import { BlogPostTag } from "@repo/wrapper/server";
import { IconTags } from "@tabler/icons-react";
import { getCapitalizedText, Link } from "#@/util";

interface Props {
  tags: BlogPostTag[];
}

const BlogPostTags = ({ tags }: Props) => {
  return (
    <Group className={"gap-1"}>
      <IconTags />
      {tags.map((tag, i) => {
        const isLastElement = i === tags.length - 1;
        return (
          <Link
            key={tag.id}
            href={`/blog?tag=${tag.id}`}
            className={"hover:!underline"}
          >
            {getCapitalizedText(tag.name)}
            {!isLastElement && ", "}
          </Link>
        );
      })}
    </Group>
  );
};

export { BlogPostTags };
