import React, { useCallback, useMemo } from "react";
import {
  CenteredErrorMessage,
  CenteredLoading,
  GameAchievementsList,
  getAchievementsEnabledStores,
  useGameAchievementsV2,
  useGameExternalStores,
  useOnMobilePlatform,
  useUserId,
  XBOX_STORES,
} from "#@/components";
import { Group, Image, Tabs } from "@mantine/core";
import { GameExternalGame } from "@repo/wrapper/server";
import { match, P } from "ts-pattern";
import { cn, getServerStoredIcon } from "#@/util";

interface Props {
  gameId: number;
}

const GameInfoAchievementsScreen = ({ gameId }: Props) => {
  const userId = useUserId();
  const onMobilePlatform = useOnMobilePlatform();
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
          leftSection={
            <Image
              alt={storeName ?? "External Store"}
              src={getServerStoredIcon(group?.iconName)}
              className={"h-8 w-8 object-contain"}
            />
          }
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
      variant={onMobilePlatform ? "default" : "pills"}
      keepMounted={false}
      defaultValue={data != undefined ? `${data.at(0)?.source}` : undefined}
      classNames={{
        tabSection: onMobilePlatform ? "me-0 block" : "hidden",
        tabLabel: onMobilePlatform ? "hidden lg:block text-lg" : undefined,
        tab: onMobilePlatform ? "flex justify-center" : undefined,
      }}
    >
      {isError && <CenteredErrorMessage error={error} />}
      <Group
        className={cn("w-full justify-end mb-4 pe-4", {
          "justify-start": onMobilePlatform,
        })}
      >
        <Tabs.List>{buildTabs()}</Tabs.List>
      </Group>
      {buildPanels()}
    </Tabs>
  );
};

export { GameInfoAchievementsScreen };
