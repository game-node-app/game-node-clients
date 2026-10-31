import { Link } from "#@/util";
import { Group } from "@mantine/core";
import { BlogTagDto } from "@repo/wrapper/server";
import { IconTags } from "@tabler/icons-react";

interface Props {
  tags: BlogTagDto[];
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
            href={`/blog/archive?tag=${encodeURIComponent(tag.id)}`}
            className={"hover:!underline"}
          >
            {tag.name}
            {!isLastElement && ", "}
          </Link>
        );
      })}
    </Group>
  );
};

export { BlogPostTags };