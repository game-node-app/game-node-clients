import React from "react";
import { Box, Combobox, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { GameFigureImage, getGamePlatformInfo, SearchGame } from "@repo/ui";

interface ISearchBarSelectOptions {
  game: SearchGame;
}

const GameSelectOption = ({ game }: ISearchBarSelectOptions) => {
  const platforms = getGamePlatformInfo(game);
  const platformsAbbreviations = platforms.platformsAbbreviations;
  return (
    <Combobox.Option value={`${game.id}`} className={"w-full h-full"}>
      <Link href={`/game/${game.id}`} className={"w-full h-full"}>
        <Group wrap={"nowrap"} w={"100%"} h={"100%"}>
          <Box w={"30%"} maw={"30%"} miw={"30%"}>
            <GameFigureImage game={game} />
          </Box>
          <Stack justify={"start"} h={"100%"}>
            <Text fz={"sm"}>{game.name}</Text>
            <Text fz={"xs"} c={"dimmed"}>
              {platformsAbbreviations?.join(", ")}
            </Text>
          </Stack>
        </Group>
      </Link>
    </Combobox.Option>
  );
};

export default GameSelectOption;
