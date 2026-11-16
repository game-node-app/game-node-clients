import { useAwardsResults } from "#@/components/awards/hooks/useAwardsResults";
import { useAwardsScoreboard } from "#@/components/awards/hooks/useAwardsScoreboard";
import { findGlobalGOTYCategory } from "#@/components/awards/util/goty";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import {
  formatNumber,
  formatPercentage,
  formatPlaytimeHours,
  useFormatLocale,
} from "#@/components/events/util/format";
import { getAwardsScreenHref } from "#@/components/events/util/seasonEvents";
import { useSeasonEvents } from "#@/components/events/hooks/useSeasonEvents";
import { useGames } from "#@/components/game/hooks/useGames";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { cn, Link } from "#@/util";
import {
  Badge,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAward } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import type { ReactNode } from "react";
import { EventCardCovers } from "./EventCardCovers";
import { EventPhaseTimeline } from "./EventPhaseTimeline";
import { RecapMonthlyBars } from "./RecapMonthlyBars";

/**
 * The five Home card variants of frame `5444:2410` (spec: Card do Awards por
 * fase / Card da Retrospectiva por fase). The Awards variants only exist in the
 * phases in which there is something to do; the Retrospectiva variants need an
 * entry, which the season rules already gate by session and created Recap.
 */
export type EventCardKind =
  | "awards-nominations"
  | "awards-voting"
  | "awards-results"
  | "recap-live"
  | "recap-closed";

/** Wide (one card), Half (two cards) and the mobile carousel card. */
export type EventCardLayout = "wide" | "half" | "mobile";

export interface EventCardProps {
  kind: EventCardKind;
  layout?: EventCardLayout;
}

const DAY_IN_MS = 86_400_000;
const COVERS_MAX = 4;

function uniqueGameIds(ids: Array<number | null | undefined>): number[] {
  return Array.from(
    new Set(ids.filter((id): id is number => typeof id === "number")),
  ).slice(0, COVERS_MAX);
}

function isRecapKind(kind: EventCardKind): boolean {
  return kind === "recap-live" || kind === "recap-closed";
}

/**
 * One event card of the Home. It owns the data reads of its own variant so the
 * section only decides which cards exist and their layout:
 * - Awards voting reads nothing extra (the season hook already read the ballot
 *   and the categories);
 * - Awards results reads the public results and, with a session, the scoreboard;
 * - Retrospectiva reads the Recap only for the signed-in owner, after the
 *   status reported `isRecapCreated` (the season hook gates the entry).
 */
export function EventCard({ kind, layout = "wide" }: EventCardProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const redirectToAuth = useRedirectToAuth();
  const season = useSeasonEvents();
  const isVisitor = !season.userId;
  const isRecap = isRecapKind(kind);
  const awardsEvent = season.awardsEvent;

  const resultsQuery = useAwardsResults(
    kind === "awards-results" ? awardsEvent?.id : undefined,
  );
  const scoreboardQuery = useAwardsScoreboard(
    kind === "awards-results" ? awardsEvent?.id : undefined,
    kind === "awards-results" ? season.userId : undefined,
  );
  const recapQuery = useRecap(
    isRecap && season.userId ? season.userId : undefined,
    isRecap && season.recapEntry ? season.recapEntry.year : undefined,
    { enabled: isRecap && !!season.userId && !!season.recapEntry },
  );

  const now = new Date();

  const deadlineLabel = (
    deadline: string | null | undefined,
  ): string | null => {
    if (!deadline) {
      return null;
    }

    const remaining = new Date(deadline).getTime() - now.getTime();
    if (!Number.isFinite(remaining) || remaining <= 0) {
      return null;
    }

    if (remaining <= DAY_IN_MS) {
      return t("events.card.awards.endsTomorrow");
    }

    return t("events.card.awards.endsInDays", {
      days: Math.ceil(remaining / DAY_IN_MS),
    });
  };

  const ballot = season.awardsBallot;
  const categories = season.awardsCategories ?? [];
  const gotyCategory = findGlobalGOTYCategory(categories);
  const gotyBallotCategory =
    gotyCategory && ballot
      ? (ballot.categories.find(
          (category) => category.id === gotyCategory.id,
        ) ?? null)
      : null;

  const categoriesTotal = ballot?.categoriesTotal || categories.length || 0;
  const categoriesVoted = ballot?.categoriesVoted ?? 0;
  const missingCategories = ballot
    ? Math.max(categoriesTotal - categoriesVoted, 0)
    : null;

  const results = resultsQuery.data;
  const gotyResult = results?.find((result) => result.category?.isGOTY) ?? null;
  const winner =
    gotyResult?.winners.find((candidate) => candidate.position === 1) ?? null;
  const scoreboard = scoreboardQuery.data ?? null;

  const recap = recapQuery.data;
  const topGame = recap?.topGames?.[0] ?? null;
  const recapYear = season.recapEntry?.year ?? season.recapYear;
  const recapHref =
    season.recapHref && recapYear
      ? season.recapHref
      : season.userId && recapYear
        ? `/recap/${recapYear}/${season.userId}`
        : "/recap";
  const storiesHref = `${recapHref}/stories`;

  let coverIds: Array<number | null | undefined> = [];
  if (kind === "awards-voting") {
    coverIds =
      gotyBallotCategory?.nominees.map((nominee) => nominee.gameId) ?? [];
  } else if (kind === "awards-results") {
    const orderedResults = [...(results ?? [])].sort(
      (a, b) => (a.category?.order ?? 0) - (b.category?.order ?? 0),
    );
    coverIds = [
      winner?.gameId,
      ...orderedResults.flatMap((result) =>
        [...result.winners]
          .sort((a, b) => a.position - b.position)
          .map((candidate) => candidate.gameId),
      ),
    ];
  } else if (isRecap) {
    coverIds = recap?.topGames.map((game) => game.gameId) ?? [];
  }

  const uniqueCoverIds = uniqueGameIds(coverIds);
  const gamesQuery = useGames(
    {
      gameIds: uniqueCoverIds.length > 0 ? uniqueCoverIds : undefined,
      relations: { cover: true },
    },
    false,
    isRecap ? "off" : undefined,
  );
  const gamesById = new Map<number, Game>(
    (gamesQuery.data ?? []).map((game) => [game.id, game]),
  );
  const covers = uniqueCoverIds.map((gameId) => gamesById.get(gameId));

  const hours = formatPlaytimeHours(recap?.totalPlaytimeSeconds, locale);
  const gamesCount = formatNumber(recap?.topGames.length, locale);
  const finishedCount = formatNumber(recap?.totalFinishedGames, locale);
  const topGameShare = formatPercentage(topGame?.share, locale);
  const topGameName = topGame
    ? (gamesById.get(topGame.gameId)?.name ?? null)
    : null;

  const winnerName = winner
    ? (winner.game?.name ?? gamesById.get(winner.gameId)?.name ?? null)
    : null;

  const isWide = layout === "wide";
  const cardClassName = cn(
    "relative flex h-full flex-col gap-5 overflow-hidden rounded-lg border border-paper-4 bg-paper-1 p-6",
    isWide && "md:flex-row md:items-stretch md:gap-8",
    layout === "mobile" && "w-[300px] shrink-0",
  );
  const visualClassName = cn(
    "flex shrink-0 flex-col justify-end gap-3",
    isWide ? "md:w-64" : "w-full",
  );

  const renderVisual = (visual: ReactNode) => (
    <Box className={visualClassName}>{visual}</Box>
  );

  const trophyVisual = (
    <Box
      aria-hidden={"true"}
      className={
        "hidden min-h-24 items-center justify-center rounded-md bg-brand-5/10 text-brand-5 md:flex"
      }
    >
      <IconAward size={72} stroke={1.5} />
    </Box>
  );

  const actions = (primary: ReactNode, secondary?: ReactNode) => (
    <Group gap={"sm"} mt={"auto"} wrap={"wrap"}>
      {primary}
      {secondary}
    </Group>
  );

  if (kind === "awards-nominations") {
    if (!awardsEvent) {
      return null;
    }

    const href =
      season.awardsEntry?.href ??
      getAwardsScreenHref(awardsEvent.year, awardsEvent.phase);
    const chip = deadlineLabel(awardsEvent.nominationEndDate);

    return (
      <article
        data-testid={"event-card"}
        data-kind={kind}
        data-layout={layout}
        className={cardClassName}
      >
        <Stack className={"min-w-0 flex-1"} gap={"sm"}>
          <Group justify={"space-between"} align={"flex-start"} gap={"xs"}>
            <Text size={"sm"} fw={600} c={"dimmed"}>
              {t("events.card.awards.nominationsTitle", {
                year: awardsEvent.year,
              })}
            </Text>
            {chip && (
              <Badge variant={"light"} size={"sm"}>
                {chip}
              </Badge>
            )}
          </Group>
          <Title order={3} size={"h4"}>
            {t("events.card.awards.nominationsHeadline")}
          </Title>
          <Text size={"sm"} c={"dimmed"}>
            {t("events.card.awards.nominationsDescription")}
          </Text>
          <EventPhaseTimeline
            nominationStartDate={awardsEvent.nominationStartDate}
            nominationEndDate={awardsEvent.nominationEndDate}
            votingStartDate={awardsEvent.votingStartDate}
            votingEndDate={awardsEvent.votingEndDate}
            resultsDate={awardsEvent.resultsDate}
            active={"nominations"}
          />
          <Text size={"xs"} c={"dimmed"}>
            {t("events.card.awards.participationReward")}
          </Text>
          {isVisitor
            ? actions(
                <Button size={"sm"} onClick={() => void redirectToAuth()}>
                  {t("events.card.awards.visitorNominationsAction")}
                </Button>,
              )
            : actions(
                <Link href={href}>
                  <Button size={"sm"}>
                    {t("events.card.awards.nominationsPrimary")}
                  </Button>
                </Link>,
                <Link href={href}>
                  <Button size={"sm"} variant={"default"}>
                    {t("events.card.awards.nominationsSecondary")}
                  </Button>
                </Link>,
              )}
        </Stack>
        {renderVisual(trophyVisual)}
      </article>
    );
  }

  if (kind === "awards-voting") {
    if (!awardsEvent) {
      return null;
    }

    const href =
      season.awardsEntry?.href ??
      getAwardsScreenHref(awardsEvent.year, awardsEvent.phase);
    const chip = deadlineLabel(awardsEvent.votingEndDate);
    const progressValue =
      categoriesTotal > 0
        ? Math.min(100, (categoriesVoted / categoriesTotal) * 100)
        : 0;

    return (
      <article
        data-testid={"event-card"}
        data-kind={kind}
        data-layout={layout}
        className={cardClassName}
      >
        <Stack className={"min-w-0 flex-1"} gap={"sm"}>
          <Group justify={"space-between"} align={"flex-start"} gap={"xs"}>
            <Text size={"sm"} fw={600} c={"dimmed"}>
              {t("events.card.awards.votingTitle", {
                year: awardsEvent.year,
              })}
            </Text>
            {chip && (
              <Badge variant={"light"} size={"sm"}>
                {chip}
              </Badge>
            )}
          </Group>
          {isVisitor ? (
            <>
              <Title order={3} size={"h4"}>
                {t("events.card.awards.visitorVotingHeadline")}
              </Title>
              <Text size={"sm"} c={"dimmed"}>
                {t("events.card.awards.visitorVotingDescription")}
              </Text>
            </>
          ) : (
            <>
              {missingCategories != null && (
                <Title order={3} size={"h4"}>
                  {missingCategories === 1
                    ? t("events.card.awards.votingHeadlineSingle")
                    : t("events.card.awards.votingHeadline", {
                        count: missingCategories,
                      })}
                </Title>
              )}
              {gotyBallotCategory && (
                <Text size={"sm"} c={"dimmed"}>
                  {t("events.card.awards.votingGoty", {
                    played: gotyBallotCategory.playedNomineesCount,
                    total: gotyBallotCategory.nominees.length,
                  })}
                </Text>
              )}
              {ballot && (
                <Stack gap={4}>
                  <Text size={"xs"} c={"dimmed"}>
                    {t("events.card.awards.votingProgress", {
                      voted: categoriesVoted,
                      total: categoriesTotal,
                    })}
                  </Text>
                  <Progress
                    value={progressValue}
                    size={"md"}
                    radius={"xl"}
                    aria-label={t("events.card.awards.votingProgress", {
                      voted: categoriesVoted,
                      total: categoriesTotal,
                    })}
                  />
                </Stack>
              )}
            </>
          )}
          {isVisitor
            ? actions(
                <Button size={"sm"} onClick={() => void redirectToAuth()}>
                  {t("events.card.awards.visitorVotingAction")}
                </Button>,
              )
            : actions(
                <Link href={href}>
                  <Button size={"sm"}>
                    {t("events.card.awards.votingPrimary")}
                  </Button>
                </Link>,
                <Link href={href}>
                  <Button size={"sm"} variant={"default"}>
                    {t("events.card.awards.votingSecondary")}
                  </Button>
                </Link>,
              )}
        </Stack>
        {renderVisual(
          covers.some(Boolean) ? (
            <EventCardCovers games={covers} />
          ) : (
            trophyVisual
          ),
        )}
      </article>
    );
  }

  if (kind === "awards-results") {
    if (!awardsEvent) {
      return null;
    }

    const href =
      season.awardsEntry?.href ??
      getAwardsScreenHref(awardsEvent.year, awardsEvent.phase);
    const votes = formatNumber(gotyResult?.totalVotesCount, locale);
    const categoriesCount = formatNumber(awardsEvent.categoriesCount, locale);

    return (
      <article
        data-testid={"event-card"}
        data-kind={kind}
        data-layout={layout}
        className={cardClassName}
      >
        <Stack className={"min-w-0 flex-1"} gap={"sm"}>
          <Text size={"sm"} fw={600} c={"dimmed"}>
            {t("events.card.awards.resultsTitle", { year: awardsEvent.year })}
          </Text>
          {winnerName && (
            <Title order={3} size={"h4"}>
              {t("events.card.awards.resultsWinner", { game: winnerName })}
            </Title>
          )}
          <Text size={"sm"} c={"dimmed"}>
            {votes && categoriesCount
              ? t("events.card.awards.resultsVotes", {
                  votes,
                  categories: categoriesCount,
                })
              : t("events.card.awards.resultsTitle", {
                  year: awardsEvent.year,
                })}
          </Text>
          {!isVisitor && scoreboard && (
            <Badge variant={"light"} size={"md"} className={"self-start"}>
              {t("events.card.awards.resultsScore", {
                hits: scoreboard.totals.hits,
                scorable: scoreboard.totals.scorable,
              })}
            </Badge>
          )}
          {actions(
            <Link href={href}>
              <Button size={"sm"}>
                {t("events.card.awards.resultsPrimary")}
              </Button>
            </Link>,
            !isVisitor ? (
              <Link href={href}>
                <Button size={"sm"} variant={"default"}>
                  {t("events.card.awards.resultsShare")}
                </Button>
              </Link>
            ) : undefined,
          )}
        </Stack>
        {renderVisual(
          covers.some(Boolean) ? (
            <EventCardCovers games={covers} />
          ) : (
            trophyVisual
          ),
        )}
      </article>
    );
  }

  if (!recapYear) {
    return null;
  }

  const liveSentence =
    topGameName && topGameShare && hours && gamesCount && finishedCount
      ? t("events.card.recap.liveSentence", {
          game: topGameName,
          share: topGameShare,
          hours,
          games: gamesCount,
          finished: finishedCount,
        })
      : null;

  if (kind === "recap-live") {
    if (isVisitor) {
      return (
        <article
          data-testid={"event-card"}
          data-kind={kind}
          data-layout={layout}
          className={cardClassName}
        >
          <Stack className={"min-w-0 flex-1"} gap={"sm"}>
            <Text size={"sm"} fw={600} c={"dimmed"}>
              {t("events.card.recap.liveTitle", { year: recapYear })}
            </Text>
            <Title order={3} size={"h4"}>
              {t("events.card.recap.visitorHeadline")}
            </Title>
            <Text size={"sm"} c={"dimmed"}>
              {t("events.card.recap.visitorDescription")}
            </Text>
            {actions(
              <Button size={"sm"} onClick={() => void redirectToAuth()}>
                {t("events.card.recap.visitorAction")}
              </Button>,
            )}
          </Stack>
          {renderVisual(trophyVisual)}
        </article>
      );
    }

    return (
      <article
        data-testid={"event-card"}
        data-kind={kind}
        data-layout={layout}
        className={cardClassName}
      >
        <Stack className={"min-w-0 flex-1"} gap={"sm"}>
          <Text size={"sm"} fw={600} c={"dimmed"}>
            {t("events.card.recap.liveTitle", { year: recapYear })}
          </Text>
          <Group align={"flex-end"} gap={"xs"}>
            {hours && (
              <Title order={2}>{t("events.card.recap.hours", { hours })}</Title>
            )}
            {gamesCount && (
              <Text size={"sm"} c={"dimmed"} pb={4}>
                {t("events.card.recap.liveGames", { games: gamesCount })}
              </Text>
            )}
          </Group>
          <RecapMonthlyBars values={recap?.calendar?.monthlyPlaytimeSeconds} />
          {liveSentence ? (
            <Text size={"sm"}>{liveSentence}</Text>
          ) : (
            <Title order={3} size={"h4"}>
              {t("events.card.recap.liveHeadline", { year: recapYear })}
            </Title>
          )}
          {actions(
            <Link href={recapHref}>
              <Button size={"sm"}>{t("events.card.recap.livePrimary")}</Button>
            </Link>,
            <Link href={storiesHref}>
              <Button size={"sm"} variant={"default"}>
                {t("events.card.recap.liveShare")}
              </Button>
            </Link>,
          )}
        </Stack>
        {renderVisual(
          covers.some(Boolean) ? <EventCardCovers games={covers} /> : null,
        )}
      </article>
    );
  }

  return (
    <article
      data-testid={"event-card"}
      data-kind={kind}
      data-layout={layout}
      className={cardClassName}
    >
      <Stack className={"min-w-0 flex-1"} gap={"sm"}>
        <Text size={"sm"} fw={600} c={"dimmed"}>
          {t("events.card.recap.closedTitle", { year: recapYear })}
        </Text>
        <Title order={3} size={"h4"}>
          {t("events.card.recap.closedHeadline", { year: recapYear })}
        </Title>
        <Group align={"flex-end"} gap={"xs"}>
          {hours && (
            <Title order={2}>{t("events.card.recap.hours", { hours })}</Title>
          )}
          {gamesCount && (
            <Text size={"sm"} c={"dimmed"} pb={4}>
              {t("events.card.recap.closedGames", {
                games: gamesCount,
                year: recapYear,
              })}
            </Text>
          )}
        </Group>
        {hours && gamesCount && finishedCount && (
          <Text size={"sm"} c={"dimmed"}>
            {t("events.card.recap.closedSummary", {
              hours,
              games: gamesCount,
              finished: finishedCount,
            })}
          </Text>
        )}
        {actions(
          <Link href={storiesHref}>
            <Button size={"sm"}>{t("events.card.recap.closedPrimary")}</Button>
          </Link>,
          <Link href={`${storiesHref}?story=5`}>
            <Button size={"sm"} variant={"default"}>
              {t("events.card.recap.closedDownload")}
            </Button>
          </Link>,
        )}
      </Stack>
      {renderVisual(
        covers.some(Boolean) ? <EventCardCovers games={covers} /> : null,
      )}
    </article>
  );
}
