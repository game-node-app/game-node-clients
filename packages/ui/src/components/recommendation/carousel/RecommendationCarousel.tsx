import React, { ComponentProps, useMemo } from "react";
import {
  RecommendationCriteria,
  useRecommendations,
} from "#@/components/recommendation/hook/useRecommendations";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { GameInfoCarousel } from "#@/components/game/info/carousel/GameInfoCarousel";
import { useGames } from "#@/components/game/hooks/useGames";
import { useGamesResource } from "#@/components/game/hooks/useGamesResource";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useTranslation } from "@repo/locales";

interface Props extends Omit<ComponentProps<typeof DetailsBox>, "title"> {
  title?: string;
  criteria: RecommendationCriteria;
  limit?: number;
}

const RecommendationCarousel = ({ criteria, limit = 15, ...others }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const recommendationsQuery = useRecommendations(criteria, limit);
  const gamesQuery = useGames({
    gameIds: recommendationsQuery.data?.gameIds,
    relations: {
      cover: true,
    },
  });

  const isEmpty =
    recommendationsQuery.data == undefined ||
    recommendationsQuery.data.gameIds.length === 0;

  const resourceQuery = useGamesResource(
    criteria === "genre" ? "genres" : "themes",
    criteria !== "finished",
  );

  const criteriaTitle = useMemo(() => {
    if (["finished", "played"].includes(criteria)) {
      return t("recommendation.basedOnPlayed");
    }

    if (
      resourceQuery.data == undefined ||
      recommendationsQuery.data == undefined
    ) {
      return "";
    }

    const matchingCriteria = resourceQuery.data.find(
      (item) => item.id === recommendationsQuery.data.criteriaId,
    );

    return t("recommendation.gamesYouMayLike", {
      name: matchingCriteria?.name,
    });
  }, [criteria, recommendationsQuery.data, resourceQuery.data, t]);

  if (isEmpty) {
    return null;
  }

  return (
    <DetailsBox title={criteriaTitle} {...others}>
      <GameInfoCarousel
        games={gamesQuery.data}
        isLoading={recommendationsQuery.isLoading || gamesQuery.isLoading}
        isError={recommendationsQuery.isError || gamesQuery.isLoading}
        withControls={!onMobile}
        slideSize={onMobile ? "45%" : "20%"}
      />
    </DetailsBox>
  );
};

export { RecommendationCarousel };
