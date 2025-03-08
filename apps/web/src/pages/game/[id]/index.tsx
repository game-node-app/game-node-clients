import React, { useEffect, useRef } from "react";
import { Container, Stack } from "@mantine/core";
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

  return (
    <Container fluid pos={"relative"} className="mb-12" mih={"100vh"} p={0}>
      {gameQuery.data != undefined && (
        <Head>
          <title>{`${gameQuery.data.name} - GameNode`}</title>
        </Head>
      )}
      <Stack>
        <GameInfoView id={idAsNumber} />
        <GameInfoReviewScreen
          gameId={idAsNumber}
          targetReviewId={reviewId as string | undefined}
        />
        <GameExtraInfoView id={idAsNumber} />
      </Stack>
    </Container>
  );
};

export default GameInfoPage;
