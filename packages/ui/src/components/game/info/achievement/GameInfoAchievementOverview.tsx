import React, { useMemo } from "react";
import {
  DetailsBox,
  EGameExternalGameCategory,
  GameInfoAchievementOverviewItem,
  useGameExternalStores,
} from "#@/components";
import { GameExternalGame } from "@repo/wrapper/server";
import { Stack } from "@mantine/core";

interface Props {
  gameId: number;
}

// @see {@link EGameExternalGameCategory}
const ACHIEVEMENT_ENABLED_SOURCES = [
  GameExternalGame.category._1,
  // GameExternalGame.category._36,
  // GameExternalGame.category._11,
];

const GameInfoAchievementOverview = ({ gameId }: Props) => {
  const { data: stores, isLoading, isError } = useGameExternalStores(gameId);

  const enabledStores = useMemo(() => {
    return (
      stores?.filter((store) =>
        ACHIEVEMENT_ENABLED_SOURCES.includes(store.category!),
      ) ?? []
    );
  }, [stores]);

  return (
    <DetailsBox
      title={"Achievements"}
      enabled={enabledStores.length > 0}
      withBorder
      withPadding
      withDimmedTitle
    >
      {enabledStores.map((store) => (
        <GameInfoAchievementOverviewItem
          key={`achievement-${store.id}`}
          externalGame={store}
        />
      ))}
    </DetailsBox>
  );
};

export { GameInfoAchievementOverview };
