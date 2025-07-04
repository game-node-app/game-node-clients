import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Stack, Tabs } from "@mantine/core";
import { useRouter } from "next/router";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { NextPageContext } from "next";
import {
  FindOneStatisticsDto,
  Game,
  GameRepositoryFindOneDto,
  GameRepositoryService,
} from "@repo/wrapper/server";
import Head from "next/head";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameExtraInfoView,
  GameInfoAchievementsScreen,
  GameInfoContentTitle,
  GameInfoPostsScreen,
  GameInfoTabs,
  GameInfoTabValue,
  GameInfoView,
  useGame,
  useUserView,
} from "@repo/ui";
import GameInfoReviewScreen from "@/components/game/info/review/GameInfoReviewScreen";
import sourceType = FindOneStatisticsDto.sourceType;

export const getServerSideProps = async (context: NextPageContext) => {
  const queryId = context.query.id;
  if (queryId == undefined) {
    return;
  }
  const dto: GameRepositoryFindOneDto = DEFAULT_GAME_INFO_VIEW_DTO;
  const idAsNumber = parseInt(queryId as string, 10);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["game", idAsNumber, dto],
    queryFn: async (): Promise<Game | undefined> => {
      if (!idAsNumber) {
        return undefined;
      }
      return GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
        idAsNumber,
        dto,
      );
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const GameInfoPage = () => {
  const router = useRouter();
  const { id, reviewId } = router.query;
  const [_, isViewed, incrementView] = useUserView(`${id}`, sourceType.GAME);
  const tabFromQuery = router.query.tab as GameInfoTabValue | undefined;
  const [currentTab, setCurrentTab] = useState<GameInfoTabValue>(
    GameInfoTabValue.overview,
  );

  /**
   * Stores the path parameter "id" of the last registered game view.
   */
  const lastRegisteredGameView = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      router.isReady &&
      id != undefined &&
      lastRegisteredGameView.current !== id
    ) {
      incrementView();
      lastRegisteredGameView.current = id as string;
    }
  }, [id, incrementView, router]);

  useEffect(() => {
    if (tabFromQuery) {
      setCurrentTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  /**
   * Effect to render /404 if necessary
   */
  useEffect(() => {
    if (router.isReady && id == undefined) {
      router.push("/404");
    }
  }, [id, router]);

  const idAsNumber = parseInt(id as string, 10);

  const gameQuery = useGame(idAsNumber, DEFAULT_GAME_INFO_VIEW_DTO);

  const onChange = (tab: GameInfoTabValue) => {
    router.replace(
      {
        pathname: router.pathname,
        query: {
          id: id,
          tab: tab === "overview" ? undefined : tab,
        },
      },
      undefined,
      {
        shallow: true,
        scroll: false,
      },
    );
    setCurrentTab(tab);
  };

  const onGoBack = () => onChange(GameInfoTabValue.overview);

  return (
    <Container fluid pos={"relative"} className="mb-12" mih={"100vh"} p={0}>
      {gameQuery.data != undefined && (
        <Head>
          <title>{`${gameQuery.data.name} - GameNode`}</title>
        </Head>
      )}
      <Stack className={"w-full h-full"}>
        <GameInfoView id={idAsNumber} />
        <GameInfoTabs currentTab={currentTab} onChange={onChange}>
          <Tabs.Panel value={GameInfoTabValue.overview}>
            <Box className={"w-full mt-4"}>
              <GameExtraInfoView id={idAsNumber} />
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.reviews}>
            <Stack className={"w-full h-full gap-xl mt-4"}>
              <GameInfoContentTitle title={"Reviews"} onGoBack={onGoBack} />
              <GameInfoReviewScreen
                gameId={idAsNumber}
                targetReviewId={reviewId as string | undefined}
              />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.discussion}>
            <Stack className={"w-full h-full gap-xl mt-4"}>
              <GameInfoContentTitle title={"Discussion"} onGoBack={onGoBack} />
              <GameInfoPostsScreen gameId={idAsNumber} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.achievements}>
            <Stack className={"w-full h-full gap-sm mt-4"}>
              <GameInfoContentTitle
                title={"Achievements"}
                onGoBack={onGoBack}
              />
              <GameInfoAchievementsScreen gameId={idAsNumber} />
            </Stack>
          </Tabs.Panel>
        </GameInfoTabs>
      </Stack>
    </Container>
  );
};

export default GameInfoPage;
