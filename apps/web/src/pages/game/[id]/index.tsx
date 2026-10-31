import { Box, Container, Stack, Tabs } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameExtraInfoView,
  GameInfoAchievementsScreen,
  GameInfoContentTitle,
  GameInfoPostsScreen,
  GameInfoReviewScreen,
  GameInfoTabs,
  GameInfoTabValue,
  GameInfoView,
  getSizedImageUrl,
  ImageSize,
  useGame,
  useUrlState,
  useUserView,
} from "@repo/ui";
import {
  Game,
  GameRepositoryFindOneDto,
  GameRepositoryService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { NextPageContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { OpenGraph } from "../../../components/general/OpenGraph";
import sourceType = StatisticsSourceRequestDto.sourceType;

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
  const { t } = useTranslation();
  const router = useRouter();
  const { id, reviewId } = router.query;
  const [, , incrementView] = useUserView(
    typeof id === "string" ? id : undefined,
    sourceType.GAME,
  );

  const [params, setParams] = useUrlState({
    tab: GameInfoTabValue.overview,
  });
  const currentTab = params.tab;

  const visit = useRef<{ id: number; viewId: string } | undefined>(undefined);
  useEffect(() => {
    const gameId =
      typeof id === "string" && /^\d+$/.test(id) ? Number(id) : NaN;
    if (!router.isReady || !Number.isSafeInteger(gameId) || gameId <= 0) {
      visit.current = undefined;
      return;
    }
    if (visit.current?.id !== gameId)
      visit.current = { id: gameId, viewId: crypto.randomUUID() };
    incrementView(visit.current.viewId);
  }, [id, incrementView, router.isReady]);

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
    setParams({ tab: tab });
  };

  const onGoBack = () => onChange(GameInfoTabValue.overview);

  return (
    <Container
      fluid
      pos={"relative"}
      className="mb-12 mt-4"
      mih={"100vh"}
      p={0}
    >
      {gameQuery.data != undefined && (
        <OpenGraph
          title={`${gameQuery.data.name} - GameNode`}
          description={gameQuery.data.summary}
          imageUrl={getSizedImageUrl(
            gameQuery.data.cover?.url,
            ImageSize.FULL_HD,
          )}
        />
      )}
      <Stack className={"w-full h-full"}>
        <GameInfoView id={idAsNumber} />
        <GameInfoTabs currentTab={currentTab} onChange={onChange}>
          <Tabs.Panel value={GameInfoTabValue.overview}>
            <Box className={"w-full mt-4"}>
              <GameExtraInfoView gameId={idAsNumber} />
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.reviews}>
            <Stack className={"w-full h-full gap-xl mt-4"}>
              <GameInfoContentTitle
                title={t("game.tabs.reviews")}
                onGoBack={onGoBack}
              />
              <GameInfoReviewScreen
                gameId={idAsNumber}
                targetReviewId={reviewId as string | undefined}
              />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.discussion}>
            <Stack className={"w-full h-full gap-xl mt-4"}>
              <GameInfoContentTitle
                title={t("game.tabs.discussion")}
                onGoBack={onGoBack}
              />
              <GameInfoPostsScreen gameId={idAsNumber} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.achievements}>
            <Stack className={"w-full h-full gap-sm mt-4"}>
              <GameInfoContentTitle
                title={t("game.tabs.achievements")}
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