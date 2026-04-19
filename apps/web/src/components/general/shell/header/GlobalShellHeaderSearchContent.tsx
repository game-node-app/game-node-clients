import React from "react";
import {
  GameFigureImage,
  GameListItem,
  GameView,
  getGamePlatformInfo,
  SearchGame,
  UserAvatarGroup,
} from "@repo/ui";
import type { users_UserDto } from "@repo/wrapper/search";
import { Box, Divider, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";

interface Props {
  games: SearchGame[];
  isLoadingGames: boolean;
  users: users_UserDto[];
}

const GlobalShellHeaderSearchContent = ({
  games,
  isLoadingGames,
  users,
}: Props) => {
  const renderedGames = games.map((game) => {
    const platforms = getGamePlatformInfo(game);
    const platformsAbbreviations = platforms.platformsAbbreviations;

    return (
      <Box className={"w-full h-full"} key={game.id}>
        <GameListItem game={game} />
        {/*<Group className={"w-full flex-nowrap items-start"}>*/}
        {/*  <Box className={"w-20 lg:w-24 min-w-20 lg:min-w-24"}>*/}
        {/*    <GameFigureImage game={game} />*/}
        {/*  </Box>*/}
        {/*  <Stack justify={"start"} h={"100%"}>*/}
        {/*    <Text fz={"sm"}>{game.name}</Text>*/}
        {/*    <Text fz={"xs"} c={"dimmed"}>*/}
        {/*      {platformsAbbreviations?.join(", ")}*/}
        {/*    </Text>*/}
        {/*  </Stack>*/}
        {/*</Group>*/}
        <Divider className={"mt-1"} />
      </Box>
    );
  });

  const renderedUsers = users.map((user) => {
    return (
      <Link
        href={`/profile/${user.userId}`}
        className={"w-full h-full"}
        key={user.userId}
      >
        <UserAvatarGroup
          groupProps={{
            gap: "md",
          }}
          avatarProps={{ size: "lg" }}
          userId={"8dfe1233-b865-4a5b-9a9a-a07284dc2ddd"}
        />
        <Divider className={"mt-1"} />
      </Link>
    );
  });

  return (
    <Stack className={"w-full gap-6"}>
      <GameView layout={"list"}>
        {renderedGames}
        <GameView.LoadingSkeletons isVisible={isLoadingGames} />
      </GameView>
      {renderedUsers}
    </Stack>
  );
};

export { GlobalShellHeaderSearchContent };
