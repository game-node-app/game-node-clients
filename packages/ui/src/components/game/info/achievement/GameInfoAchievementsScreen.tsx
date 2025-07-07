import React, { useCallback, useMemo } from "react";
import {
  CenteredErrorMessage,
  CenteredLoading,
  GameAchievementsList,
  getAchievementsEnabledStores,
  useGameExternalStores,
  XBOX_STORES,
} from "#@/components";
import { Group, Tabs } from "@mantine/core";
import { GameExternalGame } from "@repo/wrapper/server";
import { match, P } from "ts-pattern";

interface Props {
  gameId: number;
}

const getStoreName = (category: GameExternalGame.category) => {
  return match(category)
    .with(GameExternalGame.category._1, () => "Steam")
    .with(GameExternalGame.category._36, () => "PSN")
    .with(P.union(...XBOX_STORES), () => "Xbox")
    .otherwise(() => "Not available");
};

const GameInfoAchievementsScreen = ({ gameId }: Props) => {
  const { data, isLoading } = useGameExternalStores(gameId);

  const enabledStores = useMemo(() => {
    if (data == undefined) return [];

    return getAchievementsEnabledStores(data);
  }, [data]);

  const buildTabs = useCallback(() => {
    return enabledStores.map((store) => {
      const storeName = getStoreName(store.category!);

      return (
        <Tabs.Tab key={`tab-${store.id}`} value={`${store.category}`}>
          {storeName?.toUpperCase() ?? "Not available"}
        </Tabs.Tab>
      );
    });
  }, [enabledStores]);

  const buildPanels = useCallback(() => {
    return enabledStores.map((store) => {
      return (
        <Tabs.Panel key={`panel-${store.id}`} value={`${store.category}`}>
          <GameAchievementsList externalGame={store} />
        </Tabs.Panel>
      );
    });
  }, [enabledStores]);

  if (isLoading) {
    return <CenteredLoading />;
  } else if (enabledStores.length === 0) {
    return (
      <CenteredErrorMessage
        message={"No achievements available for this game."}
      />
    );
  }

  return (
    <Tabs
      variant={"pills"}
      keepMounted={false}
      defaultValue={`${enabledStores[0].category}`}
    >
      <Group className={"w-full justify-end mb-4 pe-4"}>
        <Tabs.List>{buildTabs()}</Tabs.List>
      </Group>
      {buildPanels()}
    </Tabs>
  );
};

export { GameInfoAchievementsScreen };
