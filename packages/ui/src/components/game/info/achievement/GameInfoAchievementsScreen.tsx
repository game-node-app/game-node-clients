import React, { useCallback, useMemo } from "react";
import {
  CenteredErrorMessage,
  CenteredLoading,
  GameAchievementsList,
  getAchievementsEnabledStores,
  useGameAchievementsV2,
  useGameExternalStores,
  useUserId,
  XBOX_STORES,
} from "#@/components";
import { Group, Tabs } from "@mantine/core";
import { GameExternalGame } from "@repo/wrapper/server";
import { match, P } from "ts-pattern";

interface Props {
  gameId: number;
}

const GameInfoAchievementsScreen = ({ gameId }: Props) => {
  const userId = useUserId();
  const { data, isLoading, isError, error } = useGameAchievementsV2(
    userId,
    gameId,
  );

  const buildTabs = useCallback(() => {
    if (data == undefined) return null;

    return data.map((group) => {
      const storeName = group.sourceAbbreviatedName;

      return (
        <Tabs.Tab
          key={`tab-achievement-${storeName}`}
          value={`${group.source}`}
        >
          {storeName?.toUpperCase() ?? "Not available"}
        </Tabs.Tab>
      );
    });
  }, [data]);

  const buildPanels = useCallback(() => {
    if (data == undefined) return null;

    return data.map((group) => {
      return (
        <Tabs.Panel
          key={`panel-achievement-${group.source}`}
          value={`${group.source}`}
        >
          <GameAchievementsList
            gameId={gameId}
            userId={userId}
            source={group.source}
          />
        </Tabs.Panel>
      );
    });
  }, [data, gameId, userId]);

  if (isLoading) {
    return <CenteredLoading />;
  }

  return (
    <Tabs
      variant={"pills"}
      keepMounted={false}
      defaultValue={data != undefined ? `${data.at(0)?.source}` : undefined}
    >
      {isError && <CenteredErrorMessage error={error} />}
      <Group className={"w-full justify-end mb-4 pe-4"}>
        <Tabs.List>{buildTabs()}</Tabs.List>
      </Group>
      {buildPanels()}
    </Tabs>
  );
};

export { GameInfoAchievementsScreen };
