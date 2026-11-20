import { buildPresenterComponent } from "#@/context";
import { Stack } from "@mantine/core";
import { Post } from "@repo/wrapper/server";
import { useMemo } from "react";
import { PostsListItem } from "./PostsListItem";

const PostsListItemPresenter = buildPresenterComponent(
  "PostsListItem",
  (props) => <PostsListItem {...props} />,
);

interface Props {
  items: Post[];
  withUserProfile?: boolean;
  withGameInfo?: boolean;
}

const PostsList = ({ items, withUserProfile, withGameInfo }: Props) => {
  const renderedContent = useMemo(
    () =>
      items.map((item) => (
        <PostsListItemPresenter
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
