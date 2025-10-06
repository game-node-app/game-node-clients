import React from "react";
import { Stack } from "@mantine/core";
import { GamePostEditor, PostsListView } from "#@/components";

interface Props {
  gameId: number;
}

const GameInfoPostsScreen = ({ gameId }: Props) => {
  return (
    <Stack className={"w-full gap-4"}>
      <GamePostEditor gameId={gameId} withEnableButton />
      <PostsListView gameId={gameId} withGameInfo={false} />
    </Stack>
  );
};

export { GameInfoPostsScreen };
