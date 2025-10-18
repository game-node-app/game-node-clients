import GameInfoReviewScreen from "@/components/game/info/review/GameInfoReviewScreen";
import { AppPage } from "@/components/general/AppPage.tsx";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Box, Stack, Tabs } from "@mantine/core";
import {
    DEFAULT_GAME_INFO_VIEW_DTO,
    GameExtraInfoView,
    GameInfoAchievementsScreen,
    GameInfoContentTitle,
    GameInfoPostsScreen,
    GameInfoTabIcons,
    GameInfoTabs,
    GameInfoTabValue,
    GameInfoView,
    useGame,
    useUrlState,
    useUserView,
} from "@repo/ui";
import { FindOneStatisticsDto } from "@repo/wrapper/server";
import {
    IconBrandAppleArcade,
    IconMedal2,
    IconMessage,
    IconStars,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const TAB_ICONS: GameInfoTabIcons = {
  home: <IconBrandAppleArcade size={20} />,
  reviews: <IconStars size={20} />,
  discussion: <IconMessage size={20} />,
  achievements: <IconMedal2 size={20} />,
};

interface Props {
  gameId: number;
}

const GamePage = ({ gameId }: Props) => {
  const queryClient = useQueryClient();

  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

  const [params, setParams] = useUrlState({
    tab: GameInfoTabValue.overview,
  });

  const currentTab = params.tab;

  const [, , incrementView] = useUserView(
    gameId,
    FindOneStatisticsDto.sourceType.GAME,
  );

  /**
   * Stores the path parameter "id" of the last registered game view.
   */
  const lastRegisteredGameView = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (gameId != undefined && lastRegisteredGameView.current !== gameId) {
      incrementView();
      lastRegisteredGameView.current = gameId;
    }
  }, [gameId, incrementView]);

  const onChange = (tab: GameInfoTabValue) => {
    setParams({
      tab,
    });
  };

  const onGoBack = () => {
    onChange(GameInfoTabValue.overview);
  };

  return (
    <AppPage withSearch>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises = [
            queryClient.invalidateQueries({
              queryKey: ["game", gameId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["review", gameId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["posts", "infinite"],
            }),
            queryClient.invalidateQueries({
              queryKey: ["game", "achievements", gameId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["game", "external-stores", gameId],
            }),
          ];
          await Promise.all(promises);
          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <GameInfoView id={gameId} />
      <GameInfoTabs
        currentTab={currentTab}
        onChange={onChange}
        icons={TAB_ICONS}
      >
        <Tabs.Panel value={GameInfoTabValue.overview}>
          <Box className={"w-full mt-4 mb-6"}>
            <GameExtraInfoView gameId={gameId} />
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value={GameInfoTabValue.reviews}>
          <Stack className={"w-full h-full gap-xl mt-4 mb-6"}>
            <GameInfoContentTitle
              title={"Reviews"}
              onGoBack={onGoBack}
              iconProps={{ display: "none" }}
              titleProps={{
                className: "text-md font-medium ps-2",
              }}
            />
            <GameInfoReviewScreen gameId={gameId} />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value={GameInfoTabValue.discussion}>
          <Stack className={"w-full h-full gap-xl mt-4 mb-6"}>
            <GameInfoContentTitle
              title={"Discussion"}
              onGoBack={onGoBack}
              iconProps={{ display: "none" }}
              titleProps={{
                className: "text-md font-medium ps-2",
              }}
            />
            <GameInfoPostsScreen gameId={gameId} />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value={GameInfoTabValue.achievements}>
          <Stack className={"w-full h-full gap-sm mt-4 mb-6"}>
            <GameInfoContentTitle
              title={"Achievements"}
              onGoBack={onGoBack}
              iconProps={{ display: "none" }}
              titleProps={{
                className: "text-md font-medium ps-2",
              }}
            />
            <GameInfoAchievementsScreen gameId={gameId} />
          </Stack>
        </Tabs.Panel>
      </GameInfoTabs>
    </AppPage>
  );
};

export default GamePage;
