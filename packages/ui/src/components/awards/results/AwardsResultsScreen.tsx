import { useAwardEvent } from "#@/components/awards/hooks/useAwardEvent";
import { useAwardsResults } from "#@/components/awards/hooks/useAwardsResults";
import { useAwardsScoreboard } from "#@/components/awards/hooks/useAwardsScoreboard";
import type { AwardsScoreboardCategory } from "#@/components/awards/types";
import {
  findCategoryWinner,
  sortResultsByCategoryOrder,
} from "#@/components/awards/results/awardsResults";
import { AwardsResultsGOTY } from "#@/components/awards/results/AwardsResultsGOTY";
import { AwardsResultsPersonalGOTY } from "#@/components/awards/results/AwardsResultsPersonalGOTY";
import {
  AwardsResultsScoreboard,
  AwardsResultsScoreCard,
} from "#@/components/awards/results/AwardsResultsScoreboard";
import { useAwardsMobileLayout } from "#@/components/awards/shared/useAwardsMobileLayout";
import { AwardsResultsWinnerCard } from "#@/components/awards/results/AwardsResultsWinnerCard";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { SeasonEventHeader } from "#@/components/events/view/SeasonEventHeader";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useGames } from "#@/components/game/hooks/useGames";
import { cn, useRouter } from "#@/util";
import { Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useRef } from "react";
import type { Game } from "@repo/wrapper/server";

export interface AwardsResultsScreenProps {
  eventYear: number;
  className?: string;
}

/**
 * `/awards/:year/result` (spec: awards-results, design §8).
 *
 * Reads the public results and, for the signed-in user or the user of a shared
 * link (`?user=`), the public scoreboard. The GOTY category is featured with
 * its vote list and the "all / only those who played" toggle; the remaining
 * categories are listed by `category.order`, each with the scoreboard chip.
 * The personal GOTY card closes the list.
 *
 * Before the results are computed the read is `[]` (or the phase is not
 * `results`); the screen then shows the `resultsDate` instead of winners.
 */
export function AwardsResultsScreen({
  eventYear,
  className,
}: AwardsResultsScreenProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const userId = useUserId();
  const router = useRouter();
  const isMobileLayout = useAwardsMobileLayout();
  const categoriesRef = useRef<HTMLElement>(null);

  const requestedUserId = router.query.get("user")?.trim() || undefined;
  const scoreboardUserId = requestedUserId ?? userId;
  const isOwnScoreboard = !!userId && scoreboardUserId === userId;

  const eventQuery = useAwardEvent({ eventYear });
  const event = eventQuery.data;

  const resultsQuery = useAwardsResults(event?.id);
  const results = resultsQuery.data ?? [];
  const hasResults = event?.phase === "results" && results.length > 0;

  const scoreboardQuery = useAwardsScoreboard(
    hasResults ? event?.id : undefined,
    hasResults ? scoreboardUserId : undefined,
  );
  const scoreboard = scoreboardQuery.data ?? null;

  // One batch read hydrates every game on the screen: GOTY votes, the winners
  // and the scoreboard's voted/personal games.
  const gameIds = new Set<number>();
  for (const result of results) {
    for (const winner of result.winners) {
      gameIds.add(winner.gameId);
    }
  }
  for (const category of scoreboard?.categories ?? []) {
    if (category.votedGameId != null) {
      gameIds.add(category.votedGameId);
    }
  }
  if (scoreboard?.personalGOTY) {
    gameIds.add(scoreboard.personalGOTY.gameId);
  }

  const gamesQuery = useGames({
    gameIds: Array.from(gameIds),
    relations: { cover: true },
  });
  const gamesById = new Map<number, Game>(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );

  if (!Number.isFinite(eventYear)) {
    return null;
  }

  if (eventQuery.isPending) {
    return <CenteredLoading />;
  }

  if (!event) {
    return null;
  }

  if (resultsQuery.isPending) {
    return <CenteredLoading />;
  }

  if (!hasResults) {
    const resultsDate = formatUtcDate(event.resultsDate, locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <Stack
        data-awards-results-screen
        data-state={"empty"}
        className={cn("w-full", className)}
        gap={"lg"}
      >
        <SeasonEventHeader year={event.year} screen={"results"} />
        <Paper
          data-awards-results-empty
          className={"border border-paper-4 bg-paper-2 p-6"}
        >
          <Stack gap={"sm"}>
            <Text size={"xl"} fw={700}>
              {t("awards.results.title")}
            </Text>
            <Text c={"dimmed"}>
              {resultsDate
                ? t("awards.results.notYet", { date: resultsDate })
                : t("awards.results.notYetUnknown")}
            </Text>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  const orderedResults = sortResultsByCategoryOrder(results);
  const featured =
    orderedResults.find((result) => result.category?.isGOTY === true) ?? null;
  const winnerResults = orderedResults.filter(
    (result) =>
      result.category?.isGOTY !== true &&
      result.category?.isPersonalGOTY !== true,
  );

  const scoreboardByCategory = new Map(
    (scoreboard?.categories ?? []).map((category) => [
      category.categoryId,
      category,
    ]),
  );

  const votedGameName = (
    category: AwardsScoreboardCategory | undefined,
  ): string | null => {
    if (category?.votedGameId == null) {
      return null;
    }

    return gamesById.get(category.votedGameId)?.name ?? null;
  };

  const gotyOutcome = featured
    ? scoreboardByCategory.get(featured.categoryId)
    : undefined;
  const personalGOTY = scoreboard?.personalGOTY ?? null;
  const showScoreboard = !!scoreboard && !!scoreboardUserId;

  const personalTile = personalGOTY && (
    <AwardsResultsPersonalGOTY
      personalGOTY={personalGOTY}
      game={gamesById.get(personalGOTY.gameId)}
      className={"col-span-1 @3xl:col-span-2"}
    />
  );

  const scrollToCategories = () =>
    categoriesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  return (
    <div
      data-awards-results-screen
      data-state={"results"}
      className={cn("flex w-full flex-col gap-6", className)}
    >
      {!isMobileLayout && (
        <SeasonEventHeader year={event.year} screen={"results"} />
      )}
      {featured && (
        <AwardsResultsGOTY
          result={featured}
          gamesById={gamesById}
          votedGameId={gotyOutcome?.votedGameId ?? null}
        />
      )}
      {isMobileLayout && showScoreboard && (
        <AwardsResultsScoreCard
          year={event.year}
          userId={scoreboardUserId}
          isOwn={isOwnScoreboard}
          scoreboard={scoreboard}
          onViewCategories={scrollToCategories}
        />
      )}
      <section
        ref={categoriesRef}
        data-awards-results-categories
        className={cn(
          "@container flex w-full flex-col",
          isMobileLayout
            ? "gap-4 pt-2"
            : "gap-8 rounded-[20px] bg-paper-0 p-10",
        )}
      >
        {showScoreboard ? (
          <AwardsResultsScoreboard
            year={event.year}
            userId={scoreboardUserId}
            isOwn={isOwnScoreboard}
            scoreboard={scoreboard}
          />
        ) : (
          <h2
            className={cn(
              "font-bold text-foreground",
              isMobileLayout ? "text-[20px]" : "text-[32px] leading-[38px]",
            )}
          >
            {t("awards.results.categoriesTitle")}
          </h2>
        )}
        <div
          className={cn(
            "grid grid-cols-1 gap-3.5 @3xl:grid-cols-2 @5xl:grid-cols-3",
            !isMobileLayout && "gap-4",
          )}
        >
          {winnerResults.map((result) => {
            const outcome = scoreboardByCategory.get(result.categoryId);
            const winner = findCategoryWinner(result);

            return (
              <AwardsResultsWinnerCard
                key={result.id}
                result={result}
                game={winner ? gamesById.get(winner.gameId) : null}
                outcome={outcome?.outcome}
                votedGameName={votedGameName(outcome)}
              />
            );
          })}
          {personalTile}
        </div>
      </section>
    </div>
  );
}
