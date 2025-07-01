import React from "react";
import { Stack } from "@mantine/core";
import { GamePostEditor, PostsListView, useInfinitePosts } from "#@/components";

interface Props {
  gameId: number;
}

const GameInfoPostsScreen = ({ gameId }: Props) => {
  return (
    <Stack className={"w-full gap-xl"}>
      <GamePostEditor gameId={gameId} />
      <PostsListView gameId={gameId} />
    </Stack>
  );
};

export { GameInfoPostsScreen };
