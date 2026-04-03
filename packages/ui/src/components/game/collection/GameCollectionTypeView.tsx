import React, { useMemo } from "react";
import { FindGamesByCollectionTypeRequestDto } from "@repo/wrapper/server";
import {
  CenteredLoading,
  DetailsCard,
  useGamesByCollectionType,
} from "#@/components";
import { match } from "ts-pattern";
import GameCollectionType = FindGamesByCollectionTypeRequestDto.collectionType;
import { Stack } from "@mantine/core";
import { GameCollectionTypeItem } from "#@/components/game/collection/GameCollectionTypeItem";
import { useTranslation } from "@repo/locales";

interface Props
  extends Omit<FindGamesByCollectionTypeRequestDto, "relations"> {}

const GameCollectionTypeView = ({
  collectionType,
  offset,
  limit = 5,
}: Props) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGamesByCollectionType({
    collectionType,
    offset,
    limit,
    relations: {
      cover: true,
    },
  });

  const titleByCollectionType = useMemo(() => {
    return match(collectionType)
      .with(GameCollectionType.UPCOMING, () =>
        t("game.collectionTypes.upcoming"),
      )
      .with(GameCollectionType.RECENTLY_RELEASED, () =>
        t("game.collectionTypes.recentReleases"),
      )
      .exhaustive();
  }, [collectionType, t]);

  if (isLoading) {
    return <CenteredLoading />;
  }

  return (
    <DetailsCard title={titleByCollectionType}>
      <Stack>
        {data?.data.map((game) => (
          <GameCollectionTypeItem
            key={game.id}
            collectionType={collectionType}
            game={game}
          />
        ))}
      </Stack>
    </DetailsCard>
  );
};

export { GameCollectionTypeView };
