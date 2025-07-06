import React, { useCallback, useMemo } from "react";
import {
  ACHIEVEMENT_ENABLED_STORES,
  DetailsBox,
  GameInfoAchievementOverviewItem,
  useGameExternalStores,
} from "#@/components";
import { Skeleton, Stack } from "@mantine/core";

interface Props {
  gameId: number;
}

const GameInfoAchievementOverview = ({ gameId }: Props) => {
  const { data: stores, isLoading } = useGameExternalStores(gameId);

  const enabledStores = useMemo(() => {
    return (
      stores?.filter((store) =>
        ACHIEVEMENT_ENABLED_STORES.includes(store.category!),
      ) ?? []
    );
  }, [stores]);

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(2)
      .fill(0)
      .map((_, i) => (
        <Skeleton
          key={`achievements-loading-${i}`}
          animate
          visible
          className={"w-full h-12"}
        />
      ));
  }, []);

  return (
    <DetailsBox
      title={"Achievements"}
      enabled={enabledStores.length > 0 || isLoading}
      withPadding
      stackProps={{
        className: "bg-[#262525]",
      }}
    >
      {isLoading && buildLoadingSkeletons()}
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
