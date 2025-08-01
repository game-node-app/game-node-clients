import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Group, Stack, Text, Title, Badge, Flex } from "@mantine/core";
import { TGameOrSearchGame } from "@/components/game/util/types";
import {
  GameFigureImage,
  GameInfoPlatforms,
  getGameGenres,
  getLocalizedFirstReleaseDate,
  IGameFigureImageProps,
} from "@repo/ui";

export interface IGameListFigureProps {
  game: TGameOrSearchGame;
  figureProps?: Partial<IGameFigureImageProps>;
}

const GameListItem = ({ game, figureProps }: IGameListFigureProps) => {
  const name = game.name ?? "Unknown";
  const genres = getGameGenres(game);
  const genreNames = genres?.join(", ");

  return (
    <Group
      justify={"start"}
      align={"start"}
      w={"100%"}
      h={"100%"}
      wrap={"nowrap"}
    >
      <Box className="h-auto w-2/5">
        <GameFigureImage
          game={game}
          imageProps={{
            styles: {
              root: {
                alignItems: "baseline !important",
                justifyContent: "start !important",
              },
            },
          }}
          {...figureProps}
        />
      </Box>
      <Stack
        h={"100%"}
        className="w-2/4  !grow"
        align={"start"}
        justify="start"
      >
        <Stack gap={"xs"}>
          <Title size="h5" className="font-bold">
            {name}
          </Title>
          <Text size="sm" className="text-gray-500">
            {getLocalizedFirstReleaseDate(game.firstReleaseDate, "en-US")}
          </Text>
        </Stack>
        <Flex className={"w-full"}>
          <GameInfoPlatforms
            gameId={game.id}
            justify={"start"}
            iconsProps={{
              w: 28,
            }}
          />
        </Flex>

        <Text size="sm" c={"dimmed"}>
          {genreNames}
        </Text>
      </Stack>
    </Group>
  );
};

export default GameListItem;
