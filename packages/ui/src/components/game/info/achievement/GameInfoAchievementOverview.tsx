import React, { useMemo } from "react";
import {
  ACHIEVEMENT_ENABLED_STORES,
  DetailsBox,
  GameInfoAchievementOverviewItem,
  useGameExternalStores,
} from "#@/components";

interface Props {
  gameId: number;
}

const GameInfoAchievementOverview = ({ gameId }: Props) => {
  const { data: stores, isLoading, isError } = useGameExternalStores(gameId);

  const enabledStores = useMemo(() => {
    return (
      stores?.filter((store) =>
        ACHIEVEMENT_ENABLED_STORES.includes(store.category!),
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
