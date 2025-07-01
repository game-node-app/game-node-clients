import React, { useCallback, useMemo } from "react";
import {
  ACHIEVEMENT_ENABLED_STORES,
  CenteredErrorMessage,
  CenteredLoading,
  GameAchievementsList,
  GameInfoContentTitle,
  useGameExternalStores,
} from "#@/components";
import { Group, Tabs, Text } from "@mantine/core";
import { GameExternalGame } from "@repo/wrapper/server";

interface Props {
  gameId: number;
}

const GameInfoAchievementsScreen = ({ gameId }: Props) => {
  const { data, isLoading } = useGameExternalStores(gameId);

  const enabledStores = useMemo(() => {
    return (
      data?.filter((store) =>
        ACHIEVEMENT_ENABLED_STORES.includes(store.category!),
      ) ?? []
    );
  }, [data]);

  const buildTabs = useCallback(() => {
    return enabledStores.map((store) => {
      return (
        <Tabs.Tab key={`tab-${store.id}`} value={`${store.category}`}>
          {store.storeName?.toUpperCase() ?? "Not available"}
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
