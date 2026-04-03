import React, { useMemo } from "react";
import {
  FindGamesByCollectionTypeRequestDto,
  Game,
} from "@repo/wrapper/server";
import { Box, Group, Stack, Text } from "@mantine/core";
import { GameGridItem, GameRating, useReviewsScore } from "#@/components";
import dayjs from "dayjs";
import { useI18nContext, useTranslation } from "@repo/locales";

interface Props {
  collectionType: FindGamesByCollectionTypeRequestDto.collectionType;
  game: Game;
}

const GameCollectionTypeItem = ({ game, collectionType }: Props) => {
  const { language } = useI18nContext();

  const dtf = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [language],
  );

  const releaseDate = dtf.format(dayjs(game.firstReleaseDate).toDate());
  const enabledReviewScore =
    collectionType !==
    FindGamesByCollectionTypeRequestDto.collectionType.UPCOMING;

  const { data: reviewScore } = useReviewsScore(
    enabledReviewScore ? game.id : undefined,
  );

  const hasReviewScore =
    reviewScore != null && reviewScore.median != null && reviewScore.median > 0;

  return (
    <Group className={"flex-nowrap gap-2"}>
      <Box className={"flex-shrink-0 basis-4/12 lg:basis-3/12"}>
        <GameGridItem game={game} />
      </Box>
      <Stack className={"justify-start items-start h-full gap-2"}>
        <Text className={"text-sm"}>{game.name}</Text>
        <Text className={"text-sm text-dimmed"}>{releaseDate}</Text>
        {hasReviewScore && <GameRating value={reviewScore?.median} />}
      </Stack>
    </Group>
  );
};

export { GameCollectionTypeItem };
