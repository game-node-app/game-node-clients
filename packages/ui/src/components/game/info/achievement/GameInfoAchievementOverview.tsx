import {
  DetailsBox,
  GameInfoAchievementOverviewItem,
  useGameAchievementsV2,
  useUserId,
  CenteredErrorMessage,
} from "#@/components";
import { Button, Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useCallback, useMemo } from "react";

interface Props {
  gameId: number;
}

const GameInfoAchievementOverview = ({ gameId }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const {
    data: achievements,
    isLoading,
    isError,
    error,
    refetch,
  } = useGameAchievementsV2(userId, gameId);

  const enabledSources = useMemo(() => {
    return achievements?.map((achievement) => achievement.source) ?? [];
  }, [achievements]);

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(2)
      .fill(0)
      .map((_, i) => (
        <Skeleton
          key={`achievements-loading-${i}`}
          animate
          visible
          className={"w-full h-12"}
        />
      ));
  }, []);

  return (
    <DetailsBox
      title={t("game.achievement.overviewTitle")}
      enabled={enabledSources.length > 0 || isLoading || isError}
      withPadding
      withBackground
      withDimmedTitle
    >
      {isLoading && buildLoadingSkeletons()}
      {isError && (
        <>
          <CenteredErrorMessage error={error} />
          <Button onClick={() => void refetch()}>{t("actions.retry")}</Button>
        </>
      )}
      {!isError &&
        enabledSources.map((source) => (
          <GameInfoAchievementOverviewItem
            key={`achievement-overview-${source}`}
            source={source}
            gameId={gameId}
          />
        ))}
    </DetailsBox>
  );
};

export { GameInfoAchievementOverview };
