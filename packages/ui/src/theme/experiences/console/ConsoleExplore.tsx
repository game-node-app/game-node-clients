import { SimpleGrid, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  Game,
  GameRankingCriteriaDto,
  StatisticsRankingsRequestDto,
} from "@repo/wrapper/server";
import { GameRating } from "#@/components/general/input/GameRating";
import { useGames } from "#@/components/game/hooks/useGames";
import { useGamesResource } from "#@/components/game/hooks/useGamesResource";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import type { InfiniteQueryTrendingGamesDto } from "#@/components/statistics/hooks/useInfiniteTrendingGames";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import type { ExploreTrendingGamesProps } from "#@/components/explore/ExploreTrendingGames";
import { Link } from "#@/util";
import { CONSOLE_GAME_RELATIONS, ConsoleGameRow } from "./ConsoleGameRow";
import { getGameArtUrl } from "./gameArt";
import classes from "./ConsoleExplore.module.css";

// IGDB genre ids: Adventure, RPG, Shooter, Indie, Strategy, Platform
const FEATURED_GENRE_IDS = [31, 12, 5, 32, 15, 8];

const CONSOLE_CATEGORY_LIMIT = 12;

const DEFAULT_CONSOLE_EXPLORE_DTO: InfiniteQueryTrendingGamesDto = {
  period: StatisticsRankingsRequestDto.period.MONTH,
  criteria: {},
  limit: CONSOLE_CATEGORY_LIMIT,
};

const noop = () => {};

/** Wide art card for one of a section's best rated games. */
const ConsoleTopRatedCard = ({ game }: { game: Game }) => {
  const { t } = useTranslation();
  const art = getGameArtUrl(game, ImageSize.SCREENSHOT_HUGE);

  return (
    <Link
      href={`/game/${game.id}`}
      data-console-tile
      data-console-top-rated
      className={classes.card}
    >
      {art && (
        <img className={classes.cardShot} src={art} alt={""} loading={"lazy"} />
      )}
      <span className={classes.cardBody}>
        <span className={classes.cardBadge}>
          {t("console.explore.bestRated")}
        </span>
        <span className={classes.cardTitle}>{game.name}</span>
        {/* IGDB's 0-100 critic score as 0-5 stars */}
        <GameRating value={(game.aggregatedRating ?? 0) / 20} size={"xs"} />
      </span>
    </Link>
  );
};

interface SectionProps {
  title: string;
  dto: InfiniteQueryTrendingGamesDto;
  criteria: GameRankingCriteriaDto | undefined;
}

/** One category: its trending games as a tile row, then the 3 best rated of them as cards. */
const ConsoleCategorySection = ({ title, dto, criteria }: SectionProps) => {
  const trendingQuery = useTrendingGames({
    period: dto.period,
    criteria,
    offset: 0,
    limit: CONSOLE_CATEGORY_LIMIT,
  });
  const gameIds = trendingQuery.isError
    ? []
    : trendingQuery.data?.items
        .map((item) => item.sourceId)
        .filter((id): id is number => typeof id === "number");
  // same query as the row's, so react-query shares it
  const gamesQuery = useGames({ gameIds, relations: CONSOLE_GAME_RELATIONS });
  // shortcut: best rated among the section's trending games (no rating ranking endpoint); rank all genre games once the API has one
  const topRated = [...(gamesQuery.data ?? [])]
    .filter((game) => (game.aggregatedRating ?? 0) > 0)
    .sort((a, b) => (b.aggregatedRating ?? 0) - (a.aggregatedRating ?? 0))
    .slice(0, 3);

  return (
    <div className={classes.section}>
      <ConsoleGameRow title={title} gameIds={gameIds} onFocusGame={noop} />
      {topRated.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} className={classes.grid}>
          {topRated.map((game) => (
            <ConsoleTopRatedCard key={game.id} game={game} />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
};

/**
 * Console themes' explore: trending overall, then one section per featured
 * genre, each followed by its 3 best rated games.
 *
 * The platform passes its filter UI (`filters`) and query (`dto`), so the
 * controls above the sections stay live: a period change re-queries every
 * section. When the platform is showing filtered results (`filtered`), the
 * console keeps the same filters in place and renders the platform's `results`
 * (or `children`), preserving its pagination instead of hiding it.
 */
const ConsoleExplore = ({
  children,
  filters,
  results,
  dto,
  filtered,
}: ExploreTrendingGamesProps) => {
  const { t } = useTranslation();
  const genresQuery = useGamesResource("genres");
  const genres = genresQuery.data ?? [];
  const baseDto = dto ?? DEFAULT_CONSOLE_EXPLORE_DTO;
  const baseCriteria = baseDto.criteria ?? {};

  if (filtered) {
    if (results) {
      return (
        <Stack className={classes.explore} data-console-explore>
          {filters}
          {results}
        </Stack>
      );
    }
    // no result slot: `children` already carries the platform filters
    if (children) return <>{children}</>;
  }

  return (
    <Stack className={classes.explore} data-console-explore>
      {filters}
      <ConsoleCategorySection
        title={t("home.trendingGames")}
        dto={baseDto}
        criteria={baseCriteria}
      />
      {FEATURED_GENRE_IDS.map((id) => {
        const genre = genres.find((item) => item.id === id);
        if (!genre?.name) return null;
        return (
          <ConsoleCategorySection
            key={id}
            title={genre.name}
            dto={baseDto}
            criteria={{ ...baseCriteria, genres: [id] }}
          />
        );
      })}
    </Stack>
  );
};

export { ConsoleCategorySection, ConsoleExplore, ConsoleTopRatedCard };
