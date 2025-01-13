import React, { useEffect, useRef } from "react";
import { Container } from "@mantine/core";
import GameInfoView, {
    DEFAULT_GAME_INFO_VIEW_DTO,
} from "@/components/game/info/GameInfoView";
import { useRouter } from "next/router";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import GameExtraInfoView from "@/components/game/info/GameExtraInfoView";
import { NextPageContext } from "next";
import {
    FindOneStatisticsDto,
    Game,
    GameRepositoryFindOneDto,
    GameRepositoryService,
    StatisticsActionDto,
} from "@/wrapper/server";
import GameInfoReviewScreen from "@/components/game/info/review/GameInfoReviewScreen";
import { useUserView } from "@/components/statistics/hooks/useUserView";
import sourceType = FindOneStatisticsDto.sourceType;
import Head from "next/head";
import { useGame } from "@/components/game/hooks/useGame";

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
    const { id } = router.query;
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
                <Head key={"game-title"}>
                    <title>{`${gameQuery.data.name} - GameNode`}</title>
                </Head>
            )}
            <Container fluid mt={"30px"} p={0} w={"100%"}>
                <GameInfoView id={idAsNumber} />
            </Container>
            <Container fluid mt={"30px"} p={0} w={"100%"}>
                <GameInfoReviewScreen gameId={idAsNumber} />
            </Container>
            <Container fluid mt={"30px"} p={0} w={"100%"}>
                <GameExtraInfoView id={idAsNumber} />
            </Container>
        </Container>
    );
};

export default GameInfoPage;
