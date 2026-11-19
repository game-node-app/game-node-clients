import { TRENDING_SHELF_LIMIT } from "@/components/explore/trending-genres";
import { Group, Skeleton, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn, GameGridItem, useGames, useTrendingGames } from "@repo/ui";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { IconChevronRight } from "@tabler/icons-react";

interface TrendingShelfProps {
  title: string;
  period: StatisticsRankingsRequestDto.period;
  /** Genre id; omit for the overall ranking. */
  genreId?: number;
  /** Draw the rank number over each cover (used for the overall Top shelf). */
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

  const trendingQuery = useTrendingGames({
    period,
    limit: TRENDING_SHELF_LIMIT,
    offset: 0,
    criteria: genreId != undefined ? { genres: [genreId] } : {},
  });

  const gameIds = trendingQuery.data?.items
    .map((item) => item.sourceId)
    .filter((id): id is number => typeof id === "number");

  const gamesQuery = useGames(
    { gameIds: gameIds ?? [], relations: { cover: true } },
    gameIds != undefined && gameIds.length > 0,
  );

  const games = gameIds
    ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game) => game !== undefined);

  const isLoading = trendingQuery.isLoading || gamesQuery.isLoading;

  // Hide empty shelves (e.g. a genre with no ranked games in this period).
  if (!isLoading && (games == undefined || games.length === 0)) return null;

  const cardWidth = ranked ? "w-32" : "w-28";

  return (
    <section className={"flex w-full flex-col gap-2"}>
      <Group justify={"space-between"} wrap={"nowrap"}>
        <Text fw={700} size={"lg"} className={"truncate"}>
          {title}
        </Text>
        {onSeeAll && (
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
      <div
        className={
          "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {isLoading &&
          Array.from({ length: 4 }, (_, i) => (
            <Skeleton
              key={i}
              className={cn("shrink-0 aspect-[264/354]", cardWidth)}
            />
          ))}
        {games?.map((game, index) => (
          <div
            key={game.id}
            className={cn("relative shrink-0 snap-start", cardWidth)}
          >
            <GameGridItem game={game} />
            {ranked && (
              <span
                className={
                  "pointer-events-none absolute bottom-7 left-1 text-5xl font-black leading-none text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]"
                }
              >
                {index + 1}
              </span>
            )}
            <Text size={"xs"} fw={500} lineClamp={2} mt={4}>
              {game.name}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
};

export { TrendingShelf };
