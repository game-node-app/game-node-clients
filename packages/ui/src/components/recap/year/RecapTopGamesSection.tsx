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
import { getRecapPlatformMap } from "#@/components/recap/year/util/recapYear";
import { Image, Paper, Stack, Text, Title } from "@mantine/core";
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
    <Paper
      data-testid={"recap-top-games"}
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={"bg-paper-8"}
    >
      <Stack gap={"lg"}>
        <Title order={2} size={"h2"}>
          {t("recap.page.topGames.title", { year })}
        </Title>

        <div className={"flex flex-col gap-5 sm:flex-row sm:items-center"}>
          <TopGameCover game={topGameData} />
          <Stack gap={"xs"} className={"min-w-0"}>
            <Text size={"xl"} fw={800} className={"truncate"}>
              {gameLabel(topGame.gameId)}
            </Text>
            {share && (
              <Text size={"md"} c={"dimmed"}>
                {t("recap.page.topGames.share", {
                  game: gameLabel(topGame.gameId),
                  percent: share,
                })}
              </Text>
            )}
            <Text size={"sm"}>
              {t("recap.page.topGames.hours", { hours: hours ?? "0" })}
            </Text>
            <div className={"flex flex-wrap gap-x-4 gap-y-1"}>
              {finishedAt && (
                <Text size={"sm"} c={"dimmed"}>
                  {t("recap.page.topGames.finished", { date: finishedAt })}
                </Text>
              )}
              {rating && (
                <Text size={"sm"} c={"dimmed"}>
                  {t("recap.page.topGames.rating", { rating })}
                </Text>
              )}
            </div>
          </Stack>
        </div>

        <Title order={3} size={"h4"}>
          {t("recap.page.topGames.top5")}
        </Title>

        <Stack gap={"sm"}>
          {topGamesList.map((entry, index) => {
            const platformNames = entry.platformIds
              .map((platformId) => platformMap.get(platformId)?.abbreviation)
              .filter((name): name is string => !!name);
            const entryHours = formatPlaytimeHours(
              entry.totalPlaytimeSeconds,
              locale,
            );
            const width = Math.max(
              4,
              (entry.totalPlaytimeSeconds / maxPlaytimeSeconds) * 100,
            );

            return (
              <Stack
                key={`${entry.gameId}-${index}`}
                data-testid={"recap-top-game-row"}
                gap={4}
              >
                <div
                  className={
                    "flex flex-wrap items-baseline justify-between gap-x-3"
                  }
                >
                  <div className={"flex min-w-0 items-baseline gap-2"}>
                    <Text size={"sm"} fw={700} className={"truncate"}>
                      {gameLabel(entry.gameId)}
                    </Text>
                    {platformNames.length > 0 && (
                      <Text size={"xs"} c={"dimmed"}>
                        {platformNames.join(", ")}
                      </Text>
                    )}
                  </div>
                  {entryHours && (
                    <Text size={"xs"} c={"dimmed"}>
                      {entryHours} h
                    </Text>
                  )}
                </div>
                <div
                  className={
                    "h-2 w-full overflow-hidden rounded-full bg-paper-4"
                  }
                >
                  <div
                    className={"h-full rounded-full bg-brand"}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}

function TopGameCover({ game }: { game: Game | undefined }) {
  const { src, onError } = useGameCoverImage(game, ImageSize.COVER_BIG);

  return (
    <Image
      src={src ?? GAME_COVER_PLACEHOLDER}
      onError={onError}
      alt={game?.name ?? ""}
      className={
        "h-48 w-32 shrink-0 self-center rounded-md object-cover sm:self-start"
      }
      radius={"md"}
    />
  );
}
