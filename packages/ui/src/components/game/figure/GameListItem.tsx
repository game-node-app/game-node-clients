import React from "react";
import { Box, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { IGameFigureImageProps } from "#@/components/game/figure/GameFigureImage";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { getLocalizedFirstReleaseDate } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { getGameGenres } from "#@/components/game/util/getGameGenres";
import { GameInfoPlatforms } from "#@/components/game/info/GameInfoPlatforms";
import { Link } from "#@/util";
import { GameFigureWithQuickAdd, GameHoverEditFigure } from "#@/components";
import { useI18nContext } from "@repo/locales";

interface IGameListFigureProps {
  game: TGameOrSearchGame;
  figureProps?: Omit<Partial<IGameFigureImageProps>, "game">;
}

const GameListItem = ({ game, figureProps }: IGameListFigureProps) => {
  const { language } = useI18nContext();
  const dtf = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          <Link href={game.href ?? `/game/${game.id}`}>
            <Title size="h4" className="font-bold">
              {name}
            </Title>
          </Link>
          {game.firstReleaseDate && (
            <Text size="sm" className="text-dimmed">
              {dtf.format(new Date(game.firstReleaseDate))}
            </Text>
          )}
        </Stack>
        <GameInfoPlatforms
          gameId={game.id}
          justify={"start"}
          iconsProps={{
            w: 20,
          }}
          withNotAvailableText={false}
        />

        <Text size="sm" c={"dimmed"}>
          {genreNames}
        </Text>
      </Stack>
    </Group>
  );
};

export { GameListItem };
