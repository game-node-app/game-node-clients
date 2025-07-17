import React from "react";
import { Box, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { IGameFigureProps } from "#@/components/game/figure/GameFigureImage";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { getLocalizedFirstReleaseDate } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { getGameGenres } from "#@/components/game/util/getGameGenres";
import { GameInfoPlatforms } from "#@/components/game/info/GameInfoPlatforms";
import { Link } from "#@/util";
import { GameFigureWithQuickAdd, GameHoverEditFigure } from "#@/components";

interface IGameListFigureProps {
  game: TGameOrSearchGame;
  figureProps?: Omit<Partial<IGameFigureProps>, "game">;
}

const GameListItem = ({ game, figureProps }: IGameListFigureProps) => {
  let name = game.name ?? "Unknown";
  const onMobile = useOnMobile();
  if (onMobile) {
    if (name.length > 30) {
      name = name.substring(0, 30) + "...";
    }
  }
  const genres = getGameGenres(game);
  const genreNames = genres?.join(", ");

  const Figure = onMobile ? GameFigureWithQuickAdd : GameHoverEditFigure;

  return (
    <Group
      justify={"center"}
      align={"start"}
      w={"100%"}
      h={"100%"}
      wrap={"nowrap"}
    >
      <Box className="h-auto w-2/5 lg:w-1/6">
        <Figure
          game={game}
          imageProps={{
            styles: {
              root: {
                alignItems: "baseline !important",
                justifyContent: "start !important",
              },
            },
          }}
          withHoverTitle={false}
          {...figureProps}
        />
      </Box>
      <Stack
        h={"100%"}
        className="w-2/4 ms-2 !grow"
        align={"start"}
        justify="start"
      >
        <Stack gap={"xs"}>
          <Link href={`/game/${game.id}`}>
            <Title size="h4" className="font-bold">
              {name}
            </Title>
          </Link>
          <Text size="sm" className="text-gray-500">
            {getLocalizedFirstReleaseDate(game.firstReleaseDate)}
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

export { GameListItem };
