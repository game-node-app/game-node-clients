import React, { useMemo } from "react";
import { Post } from "@repo/wrapper/server";
import { PostsListItem } from "#@/components";
import { Stack } from "@mantine/core";

interface Props {
  items: Post[];
}

const PostsList = ({ items }: Props) => {
  const renderedContent = useMemo(
    () => items.map((item) => <PostsListItem key={item.id} item={item} />),
    [items],
  );
  return <Stack className={"w-full"}>{renderedContent}</Stack>;
};

export { PostsList };
