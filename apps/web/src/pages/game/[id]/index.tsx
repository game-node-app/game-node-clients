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
  buildPresenterComponent,
  useAppExperience,
  useGame,
  useUrlState,
  useUserView,
} from "@repo/ui";
import {
  Game,
  GameRepositoryFindOneDto,
  GameRepositoryService,
  ReviewScoreResponseDto,
  ReviewsService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { OpenGraph } from "../../../components/general/OpenGraph";
import {
  fetchForSeo,
  gameCoverUrl,
  isNotFoundError,
  SITE_URL,
} from "../../../util/seo";
import sourceType = StatisticsSourceRequestDto.sourceType;

const GameInfoViewPresenter = buildPresenterComponent(
  "GameInfoView",
  GameInfoView,
);

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const queryId = context.query.id;
  const idAsNumber =
    typeof queryId === "string" && /^\d+$/.test(queryId)
      ? Number(queryId)
      : NaN;
  if (!Number.isSafeInteger(idAsNumber) || idAsNumber <= 0) {
    return { notFound: true } as const;
  }
  const dto: GameRepositoryFindOneDto = DEFAULT_GAME_INFO_VIEW_DTO;

  const queryClient = new QueryClient();

  const [game, score] = await Promise.all([
    queryClient
      .fetchQuery({
        queryKey: ["game", idAsNumber, dto],
        queryFn: (): Promise<Game | undefined> =>
          GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
            idAsNumber,
            dto,
          ),
      })
      .catch((error: unknown) => (isNotFoundError(error) ? null : undefined)),
    fetchForSeo(() =>
      ReviewsService.reviewsControllerGetScoreForGameIdV1(idAsNumber),
    ),
  ]);
  if (game === null) {
    return { notFound: true } as const;
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      reviewScore: score ? toSeoReviewScore(score) : null,
    },
  };
};

type SeoReviewScore = { average: number; count: number };

function toSeoReviewScore(
  score: ReviewScoreResponseDto,
): SeoReviewScore | null {
  const { total, ...counts } = score.distribution;
  if (!total) return null;
  const sum = Object.entries(counts).reduce(
    (acc, [rating, count]) => acc + Number(rating) * count,
    0,
  );
  return { average: Math.round((sum / total) * 10) / 10, count: total };
}

/** schema.org `VideoGame` of a game page. */
function gameJsonLd(
  game: Game,
  url: string,
  image: string | null,
  reviewScore: SeoReviewScore | null,
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    url,
    ...(game.summary ? { description: game.summary } : {}),
    ...(image ? { image } : {}),
    ...(game.firstReleaseDate
      ? { datePublished: game.firstReleaseDate.slice(0, 10) }
      : {}),
    ...(game.genres?.length
      ? { genre: game.genres.map((genre) => genre.name).filter(Boolean) }
      : {}),
    ...(game.platforms?.length
      ? {
          gamePlatform: game.platforms
            .map((platform) => platform.name)
            .filter(Boolean),
        }
      : {}),
    ...(reviewScore
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewScore.average,
            ratingCount: reviewScore.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

const GameInfoPage = ({
  reviewScore = null,
}: {
  reviewScore?: SeoReviewScore | null;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const experience = useAppExperience();
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

  const coverUrl = gameCoverUrl(gameQuery.data?.cover?.url);

  return (
    <Container
      fluid
      pos={"relative"}
      className="mb-12 mt-4"
      mih={"100vh"}
      p={0}
      data-xbox-focus-scope={experience === "console" ? "true" : undefined}
    >
      {gameQuery.data != undefined && (
        <OpenGraph
          title={`${gameQuery.data.name} - GameNode`}
          description={gameQuery.data.summary}
          imageUrl={coverUrl}
          imageAlt={gameQuery.data.name}
          jsonLd={gameJsonLd(
            gameQuery.data,
            `${SITE_URL}/game/${idAsNumber}`,
            coverUrl,
            reviewScore,
          )}
        />
      )}
      <Stack className={"w-full h-full"}>
        <GameInfoViewPresenter id={idAsNumber} />
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
