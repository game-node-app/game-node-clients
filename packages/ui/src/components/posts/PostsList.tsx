import React, { useMemo } from "react";
import { Post } from "@repo/wrapper/server";
import { PostsListItem } from "#@/components";
import { Stack } from "@mantine/core";

interface Props {
  items: Post[];
  withUserProfile?: boolean;
  withGameInfo?: boolean;
}

const PostsList = ({ items, withUserProfile, withGameInfo }: Props) => {
  const renderedContent = useMemo(
    () =>
      items.map((item) => (
        <PostsListItem
          key={item.id}
          item={item}
          withUserProfile={withUserProfile}
          withGameInfo={withGameInfo}
        />
      )),
    [items, withGameInfo, withUserProfile],
  );
  return <Stack className={"w-full"}>{renderedContent}</Stack>;
};

export { PostsList };
