import {
  formatPercentage,
  formatPlaytimeHours,
  formatRating,
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { useGames } from "#@/components/game/hooks/useGames";
import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "#@/components/game/hooks/useGameCoverImage";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import type { Game } from "@repo/wrapper/server";
import type { YearRecap } from "#@/components/recap/types";
import {
  RecapEyebrow,
  RecapHeading,
  RecapSection,
} from "#@/components/recap/year/RecapSection";
import { cn } from "#@/util";
import { getRecapPlatformMap } from "#@/components/recap/year/util/recapYear";
import { useTranslation } from "@repo/locales";

export interface RecapTopGamesSectionProps {
  year: number;
  recap: YearRecap;
}

const TOP_GAMES_LIMIT = 5;

/**
 * "Most played in {year}" (frame 5417:941): the year's game with its share,
 * hours, finish date and rating, then the top 5 by hours with platform and a
 * proportional bar. Missing values are omitted instead of rendered as zero.
 */
export function RecapTopGamesSection({
  year,
  recap,
}: RecapTopGamesSectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const topGames = recap.topGames;
  const gamesQuery = useGames(
    {
      gameIds: topGames.map((topGame) => topGame.gameId),
      relations: { cover: true },
    },
    false,
    "off",
  );

  if (topGames.length === 0) return null;

  const platformMap = getRecapPlatformMap(recap);
  const topGame = topGames[0]!;
  const topGameData = gamesQuery.data?.find(
    (game) => game.id === topGame.gameId,
  );
  const gamesById = new Map(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );
  const topGamesList = topGames.slice(0, TOP_GAMES_LIMIT);
  const maxPlaytimeSeconds = Math.max(
    1,
    ...topGamesList.map((entry) => entry.totalPlaytimeSeconds),
  );

  const gameLabel = (gameId: number) =>
    gamesQuery.data?.find((game) => game.id === gameId)?.name ??
    t("recap.page.topGames.gameFallback", { id: gameId });

  const share = formatPercentage(topGame.share, locale);
  const hours = formatPlaytimeHours(topGame.totalPlaytimeSeconds, locale);
  const finishedAt = formatUtcDate(topGame.finishedAt, locale, {
    day: "numeric",
    month: "short",
  });
  const rating = formatRating(topGame.rating, locale);

  return (
    <RecapSection data-testid={"recap-top-games"}>
      <div
        className={
          "grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start md:gap-16 lg:gap-24"
        }
      >
        <TopGameCover game={topGameData} />

        <div className={"flex min-w-0 flex-col"}>
          <RecapEyebrow>
            {t("recap.page.topGames.title", { year })}
          </RecapEyebrow>
          <RecapHeading className={"mt-4"}>
            {share
              ? t("recap.page.topGames.share", {
                  game: gameLabel(topGame.gameId),
                  percent: share,
                })
              : gameLabel(topGame.gameId)}
          </RecapHeading>

          <div className={"mt-8 flex flex-wrap gap-x-10 gap-y-4"}>
            <TopGameStat
              value={t("events.card.recap.hours", { hours: hours ?? "0" })}
              label={t("recap.page.topGames.hoursLabel")}
            />
            {finishedAt && (
              <TopGameStat
                value={finishedAt}
                label={t("recap.page.topGames.finishedLabel")}
              />
            )}
            {rating && (
              <TopGameStat
                value={rating}
                label={t("recap.page.topGames.ratingLabel")}
              />
            )}
          </div>

          <div className={"mt-8 border-t border-[#2a2a2a] pt-8"}>
            <h3
              className={
                "m-0 text-xs leading-none font-bold tracking-[0.06em] text-[#adadad] uppercase"
              }
            >
              {t("recap.page.topGames.top5")}
            </h3>

            <ol className={"m-0 mt-5 flex list-none flex-col p-0"}>
              {topGamesList.map((entry, index) => {
                const platformNames = entry.platformIds
                  .map(
                    (platformId) => platformMap.get(platformId)?.abbreviation,
                  )
                  .filter((name): name is string => !!name);
                const entryHours = formatPlaytimeHours(
                  entry.totalPlaytimeSeconds,
                  locale,
                );
                const width = Math.max(
                  3,
                  (entry.totalPlaytimeSeconds / maxPlaytimeSeconds) * 100,
                );
                const isFirst = index === 0;

                return (
                  <li
                    key={`${entry.gameId}-${index}`}
                    data-testid={"recap-top-game-row"}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 sm:gap-4",
                      isFirst && "bg-paper-5",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 shrink-0 text-xs font-bold tabular-nums",
                        isFirst ? "text-brand" : "text-[#808080]",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <TopGameThumb game={gamesById.get(entry.gameId)} />
                    <div className={"flex min-w-0 flex-1 flex-col"}>
                      <span
                        className={
                          "truncate text-base leading-6 font-medium text-white"
                        }
                      >
                        {gameLabel(entry.gameId)}
                      </span>
                      {platformNames.length > 0 && (
                        <span className={"truncate text-sm text-[#808080]"}>
                          {platformNames.join(", ")}
                        </span>
                      )}
                    </div>
                    <div
                      className={
                        "hidden h-2 w-24 shrink-0 overflow-hidden rounded-full bg-[#262626] sm:block lg:w-40 xl:w-[220px]"
                      }
                    >
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isFirst ? "bg-brand" : "bg-brand-3",
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    {entryHours && (
                      <span
                        className={
                          "w-12 shrink-0 text-right text-xs font-bold tracking-[0.06em] text-white uppercase"
                        }
                      >
                        {t("events.card.recap.hours", { hours: entryHours })}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </RecapSection>
  );
}

function TopGameStat({ value, label }: { value: string; label: string }) {
  return (
    <div className={"flex flex-col gap-1"}>
      <span
        className={
          "text-[28px] leading-8 font-semibold tracking-[-0.01em] text-white"
        }
      >
        {value}
      </span>
      <span className={"text-sm text-[#808080]"}>{label}</span>
    </div>
  );
}

function TopGameThumb({ game }: { game: Game | undefined }) {
  const { src, onError } = useGameCoverImage(game, ImageSize.COVER_SMALL);

  return (
    <img
      src={src ?? GAME_COVER_PLACEHOLDER}
      onError={onError}
      alt={""}
      className={"h-12 w-9 shrink-0 rounded object-cover"}
    />
  );
}

function TopGameCover({ game }: { game: Game | undefined }) {
  // Up to 480 CSS px wide: the 2x cover would still be upscaled on hidpi.
  const { src, onError } = useGameCoverImage(game, ImageSize.FULL_HD);

  return (
    <img
      src={src ?? GAME_COVER_PLACEHOLDER}
      onError={onError}
      alt={game?.name ?? ""}
      className={
        "mx-auto aspect-[3/4] w-full max-w-[480px] rounded-2xl object-cover md:mx-0"
      }
    />
  );
}
