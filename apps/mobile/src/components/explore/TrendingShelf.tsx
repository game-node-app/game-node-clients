import { TRENDING_SHELF_LIMIT } from "@/components/explore/trending-genres";
import { Group, Skeleton, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  cn,
  GameGridItem,
  getSizedImageUrl,
  ImageSize,
  Link,
  RATING_STAR_COLOR,
  TrendingGamesError,
  useGames,
  useTrendingGames,
} from "@repo/ui";
import { Game, StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import {
  IconArrowRight,
  IconChevronRight,
  IconStarFilled,
} from "@tabler/icons-react";

interface TrendingShelfProps {
  title: string;
  period: StatisticsRankingsRequestDto.period;
  /** Genre id; omit for the overall ranking. */
  genreId?: number;
  /** Draw the rank number over each cover (used for the overall Top shelf). */
  ranked?: boolean;
  onSeeAll?: () => void;
}

function getBackdropUrl(game: Game): string | undefined {
  const url = getSizedImageUrl(
    game.artworks?.[0]?.url ?? game.screenshots?.[0]?.url ?? game.cover?.url,
    ImageSize.SCREENSHOT_BIG,
  );
  // getSizedImageUrl returns a message string when the url is not an IGDB one
  return url?.startsWith("https://") ? url : undefined;
}

const FeaturedGame = ({ game, label }: { game: Game; label: string }) => {
  const { t } = useTranslation();
  const backdrop = getBackdropUrl(game);
  const genres = game.genres
    ?.map((genre) => genre.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
  const rating =
    typeof game.aggregatedRating === "number" && game.aggregatedRating > 0
      ? (game.aggregatedRating / 20).toFixed(1)
      : undefined;

  return (
    <Link
      href={`/game/${game.id}`}
      className={
        "relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-xl bg-paper-6"
      }
    >
      {backdrop && (
        <img
          src={backdrop}
          alt={""}
          loading={"lazy"}
          draggable={false}
          className={"absolute inset-0 h-full w-full object-cover"}
        />
      )}
      <div
        aria-hidden={true}
        className={
          "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"
        }
      />
      <span
        className={
          "absolute left-3 top-3 inline-flex h-[22px] items-center whitespace-nowrap rounded-full bg-brand-5 px-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-paper-7"
        }
      >
        {label}
      </span>
      <div className={"relative flex flex-col gap-1.5 p-3"}>
        <Text fw={800} size={"xl"} lineClamp={2} c={"white"} lh={1.15}>
          {game.name}
        </Text>
        <div className={"flex items-center gap-2 text-xs text-white/80"}>
          {genres && <span className={"truncate"}>{genres}</span>}
          {rating && (
            <span className={"flex shrink-0 items-center gap-0.5"}>
              <IconStarFilled size={12} color={RATING_STAR_COLOR} />
              {rating}
            </span>
          )}
        </div>
        {game.summary && (
          <Text size={"sm"} lineClamp={3} c={"rgba(255,255,255,0.82)"}>
            {game.summary}
          </Text>
        )}
        <span
          className={
            "mt-1 inline-flex min-h-11 w-fit items-center justify-center gap-1.5 rounded-xl bg-brand-5 px-[18px] text-[13px] font-bold text-paper-7"
          }
        >
          {t("home.trendingViewGame")}
          <IconArrowRight size={16} aria-hidden={true} />
        </span>
      </div>
    </Link>
  );
};

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

  const gameIds = trendingQuery.data?.items.flatMap(({ sourceId }) =>
    typeof sourceId === "number" ? [sourceId] : [],
  );

  const gamesQuery = useGames({
    gameIds,
    relations: { cover: true, genres: true, artworks: true },
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
  const cardWidth = ranked ? "w-32" : "w-28";

  return (
    <section className={"flex w-full flex-col gap-3"}>
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
      {isLoading && <Skeleton className={"aspect-[4/3] w-full rounded-xl"} />}
      {featured && (
        <FeaturedGame
          game={featured.game}
          label={t("home.trendingRank", { rank: featured.rank })}
        />
      )}
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
        {rest?.map(({ game, rank }) => (
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
                {rank}
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
