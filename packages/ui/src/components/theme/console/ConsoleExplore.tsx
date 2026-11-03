import { SimpleGrid, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  ExploreTrendingGamesProps,
  GameRating,
  ImageSize,
  InfiniteQueryTrendingGamesDto,
  useGames,
  useGamesResource,
  useTrendingGames,
} from "#@/components";
import { Link } from "#@/util";
import { CONSOLE_GAME_RELATIONS, ConsoleGameRow } from "./ConsoleGameRow";
import { getGameArtUrl } from "./gameArt";
import { Game, GameRankingCriteriaDto } from "@repo/wrapper/server";

// IGDB genre ids: Adventure, RPG, Shooter, Indie, Strategy, Platform
const FEATURED_GENRE_IDS = [31, 12, 5, 32, 15, 8];

const noop = () => {};

/** Wide art card for one of a section's best rated games. */
const ExploreTopRatedCard = ({ game }: { game: Game }) => {
  const art = getGameArtUrl(game, ImageSize.SCREENSHOT_HUGE);
  return (
    <Link
      href={`/game/${game.id}`}
      data-console-tile
      className={"gn-shortcut gn-review-card"}
      style={{ aspectRatio: "16 / 9" }}
    >
      {art && (
        <img
          className={"gn-review-card-shot"}
          src={art}
          alt={""}
          loading={"lazy"}
        />
      )}
      <span className={"gn-review-card-body"}>
        <span className={"gn-review-card-game"}>{game.name}</span>
        <span className={"gn-review-card-meta"}>
          {/* IGDB's 0-100 critic score as 0-5 stars */}
          <GameRating value={(game.aggregatedRating ?? 0) / 20} size={"xs"} />
        </span>
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
const ExploreCategorySection = ({ title, dto, criteria }: SectionProps) => {
  const trendingQuery = useTrendingGames({
    period: dto.period,
    criteria,
    offset: 0,
    limit: 12,
  });
  const gameIds = trendingQuery.isError
    ? []
    : trendingQuery.data?.items
        .map((item) => item.sourceId)
        .filter((id): id is number => typeof id === "number");
  // same query as the row's, so react-query shares it
  const gamesQuery = useGames({ gameIds, relations: CONSOLE_GAME_RELATIONS });
  // shortcut: best rated among the section's trending games (no rating ranking endpoint); rank all genre games once the API has one
  const topRated = (gamesQuery.data ?? [])
    .filter((game) => (game.aggregatedRating ?? 0) > 0)
    .sort((a, b) => (b.aggregatedRating ?? 0) - (a.aggregatedRating ?? 0))
    .slice(0, 3);

  return (
    <Stack className={"gap-0 w-full"}>
      <ConsoleGameRow title={title} gameIds={gameIds} onFocusGame={noop} />
      {topRated.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} className={"px-3"}>
          {topRated.map((game) => (
            <ExploreTopRatedCard key={game.id} game={game} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};

/** Console themes' explore: trending overall, then one section per featured genre. */
const ConsoleExplore = ({ dto, filters }: ExploreTrendingGamesProps) => {
  const { t } = useTranslation();
  const genresQuery = useGamesResource("genres");
  const genres = (genresQuery.data ?? []) as { id: number; name: string }[];

  return (
    <Stack className={"w-full gap-xl"}>
      {filters}
      <ExploreCategorySection
        title={t("home.trendingGames")}
        dto={dto}
        criteria={dto.criteria}
      />
      {FEATURED_GENRE_IDS.map((id) => {
        const genre = genres.find((g) => g.id === id);
        if (!genre) return null;
        return (
          <ExploreCategorySection
            key={id}
            title={genre.name}
            dto={dto}
            criteria={{ ...dto.criteria, genres: [id] }}
          />
        );
      })}
    </Stack>
  );
};

export { ConsoleExplore };
