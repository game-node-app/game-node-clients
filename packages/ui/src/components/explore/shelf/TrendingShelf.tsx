import { Group, Skeleton, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { IconChevronRight } from "@tabler/icons-react";
import { FeaturedGame } from "#@/components/explore/shelf/FeaturedGame";
import { ShelfRail } from "#@/components/explore/shelf/ShelfRail";
import {
  getTrendingShelfRequest,
  TRENDING_SHELF_RELATIONS,
} from "#@/components/explore/util/trendingShelf";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { useGames } from "#@/components/game/hooks/useGames";
import { TrendingGamesError } from "#@/components/game/trending/TrendingGamesError";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { cn } from "#@/util";

interface TrendingShelfProps {
  title: string;
  period: StatisticsRankingsRequestDto.period;
  /** Genre id; omit for the overall ranking. */
  genreId?: number;
  /**
   * The overall Top shelf: spans the screen and draws the rank number over each
   * cover.
   */
  ranked?: boolean;
  onSeeAll?: () => void;
}

const TrendingShelf = ({
  title,
  period,
  genreId,
  ranked,
  onSeeAll,
}: TrendingShelfProps) => {
  const { t } = useTranslation();

  const trendingQuery = useTrendingGames(
    getTrendingShelfRequest(period, genreId),
  );

  const gameIds = trendingQuery.data?.items.flatMap(({ sourceId }) =>
    typeof sourceId === "number" ? [sourceId] : [],
  );

  const gamesQuery = useGames({
    gameIds,
    relations: TRENDING_SHELF_RELATIONS,
  });

  const games = gameIds?.flatMap((id, index) => {
    const game = gamesQuery.data?.find((game) => game.id === id);
    return game ? [{ game, rank: index + 1 }] : [];
  });

  const isLoading = trendingQuery.isLoading || gamesQuery.isLoading;
  const hasError = trendingQuery.isError || gamesQuery.isError;
  const hasGames = !!games?.length;

  // Non-ranked shelves vanish when empty, but a failed request is never silent.
  if (!ranked && !isLoading && !hasGames && !hasError) return null;

  const featured = games?.[0];
  const rest = games?.slice(1);
  const cardWidth = ranked ? "w-32 md:w-40" : "w-28 md:w-32";

  return (
    <section className={"flex w-full min-w-0 flex-col gap-3"}>
      <Group justify={"space-between"} wrap={"nowrap"}>
        <Text fw={700} size={"lg"} className={"truncate"}>
          {title}
        </Text>
        {onSeeAll && !!gameIds?.length && (
          <UnstyledButton
            onClick={onSeeAll}
            className={"flex shrink-0 items-center gap-0.5 text-sm text-dimmed"}
            aria-label={`${t("explore.sections.seeAll")}: ${title}`}
          >
            {t("explore.sections.seeAll")}
            <IconChevronRight size={16} />
          </UnstyledButton>
        )}
      </Group>
      {hasError && (
        <TrendingGamesError
          retrying={trendingQuery.isFetching || gamesQuery.isFetching}
          onRetry={() =>
            trendingQuery.isError
              ? trendingQuery.refetch()
              : gamesQuery.refetch()
          }
        />
      )}
      {ranked && !isLoading && !hasError && !hasGames && (
        <CenteredErrorMessage message={t("game.search.noGamesFound")} />
      )}
      {isLoading && (
        <Skeleton
          className={cn(
            "aspect-[4/3] w-full rounded-xl sm:aspect-video",
            ranked ? "lg:aspect-[21/8]" : "lg:aspect-[4/3] xl:aspect-[3/2]",
          )}
          h={"auto"}
        />
      )}
      {featured && (
        <FeaturedGame
          game={featured.game}
          label={t("home.trendingRank", { rank: featured.rank })}
          wide={ranked}
        />
      )}
      <ShelfRail>
        {isLoading &&
          Array.from({ length: 4 }, (_, i) => (
            <Skeleton
              key={i}
              className={cn("shrink-0 aspect-[264/354]", cardWidth)}
              h={"auto"}
            />
          ))}
        {rest?.map(({ game, rank }) => (
          <div
            key={game.id}
            className={cn("relative shrink-0 snap-start", cardWidth)}
          >
            <div className="relative">
              <GameGridItem game={game} />
              {ranked && (
                <span className="pointer-events-none absolute bottom-2 left-2 rounded-sm bg-media-content-scrim px-2 py-1 text-3xl font-black leading-none tabular-nums text-media">
                  {rank}
                </span>
              )}
            </div>
            <Text size={"xs"} fw={500} lineClamp={2} mt={4}>
              {game.name}
            </Text>
          </div>
        ))}
      </ShelfRail>
    </section>
  );
};

export { TrendingShelf };
