import { useAwardsNominations } from "#@/components/awards/hooks/useAwardsNominations";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import { useGames } from "#@/components/game/hooks/useGames";
import { DEFAULT_SEARCH_TRENDING_GAMES_DTO } from "#@/components/game/trending/TrendingGamesList";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { cn } from "#@/util";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";

export interface EventNominationsArtProps {
  eventId: number | undefined;
}

const COVERS = 2;
const TRENDING_REQUEST = {
  ...DEFAULT_SEARCH_TRENDING_GAMES_DTO,
  limit: COVERS,
};

function CoverTile({
  game,
  className,
}: {
  game: Game | undefined;
  className: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-[5px] h-[120px] w-[90px] overflow-hidden rounded-md border border-line bg-paper-5 shadow-[0_14px_28px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      {game && (
        <AwardsGameCover
          game={game}
          size={ImageSize.COVER_BIG}
          className={"h-full"}
        />
      )}
    </div>
  );
}

/**
 * Art of the Awards nominations card (frame `5444:2036`): the games the user
 * already nominated (or, until there are two, the trending ones) tilted behind
 * the dashed "Sua indicação" slot that invites the next nomination.
 */
export function EventNominationsArt({ eventId }: EventNominationsArtProps) {
  const { t } = useTranslation();
  const nominationsQuery = useAwardsNominations(eventId);
  const trendingQuery = useTrendingGames(TRENDING_REQUEST);

  const nominatedIds = (nominationsQuery.data ?? []).flatMap(
    (nomination) => nomination.gameIds,
  );
  const trendingIds = (trendingQuery.data?.items ?? [])
    .map((item) => item.sourceId)
    .filter((id): id is number => typeof id === "number");
  const gameIds = Array.from(new Set([...nominatedIds, ...trendingIds])).slice(
    0,
    COVERS,
  );

  const gamesQuery = useGames({
    gameIds: gameIds.length > 0 ? gameIds : undefined,
    relations: { cover: true },
  });
  const gamesById = new Map<number, Game>(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );

  return (
    <div
      aria-hidden={"true"}
      className={"absolute inset-0 flex items-center justify-center"}
    >
      <div className={"relative h-[120px] w-[196px]"}>
        <CoverTile
          game={gameIds[0] != null ? gamesById.get(gameIds[0]) : undefined}
          className={"-left-px -rotate-[7deg]"}
        />
        <CoverTile
          game={gameIds[1] != null ? gamesById.get(gameIds[1]) : undefined}
          className={"left-[107px] rotate-[7deg]"}
        />
        <div
          className={
            "absolute left-[53px] top-0 z-10 flex h-[120px] w-[90px] flex-col items-center justify-center rounded-md border-[1.5px] border-dashed border-brand-5 bg-paper-5 drop-shadow-[0_14px_14px_rgba(0,0,0,0.55)]"
          }
        >
          <Text fz={32} lh={"38px"} className={"text-brand-5"}>
            +
          </Text>
          <Text fz={10} fw={600} lh={"12px"} className={"text-brand-3"}>
            {t("events.card.awards.nominationSlot")}
          </Text>
        </div>
      </div>
    </div>
  );
}
