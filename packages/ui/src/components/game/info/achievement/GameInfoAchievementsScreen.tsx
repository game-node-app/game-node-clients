import {
  CenteredErrorMessage,
  CenteredLoading,
  GameAchievementsList,
  useGameAchievementsV2,
  useOnMobile,
  useUserId,
} from "#@/components";
import { getServerStoredIcon } from "#@/util";
import { Image, Tabs } from "@mantine/core";
import { useCallback } from "react";

interface Props {
  gameId: number;
}

const GameInfoAchievementsScreen = ({ gameId }: Props) => {
  const userId = useUserId();
  useOnMobile();
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
      variant={"default"}
      keepMounted={false}
      defaultValue={data != undefined ? `${data.at(0)?.source}` : undefined}
      classNames={{
        tabSection: "me-0 block lg:me-2",
        tabLabel: "hidden lg:block text-lg",
        tab: "flex justify-center",
        list: "w-fit",
      }}
    >
      {isError && <CenteredErrorMessage error={error} />}
      <Tabs.List>{buildTabs()}</Tabs.List>
      {buildPanels()}
    </Tabs>
  );
};

export { GameInfoAchievementsScreen };
