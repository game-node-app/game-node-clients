import { useAwardsResults } from "#@/components/awards/hooks/useAwardsResults";
import { useAwardsScoreboard } from "#@/components/awards/hooks/useAwardsScoreboard";
import { findGlobalGOTYCategory } from "#@/components/awards/util/goty";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import {
  formatNumber,
  formatPercentage,
  formatPlaytimeHours,
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { getAwardsScreenHref } from "#@/components/events/util/seasonEvents";
import { useSeasonEvents } from "#@/components/events/hooks/useSeasonEvents";
import { useGames } from "#@/components/game/hooks/useGames";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { cn, Link } from "#@/util";
import { Badge, Box, Group, Progress, Stack, Text } from "@mantine/core";
import { IconAward } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import type { ReactNode } from "react";
import { EventCardCovers } from "./EventCardCovers";
import {
  EventCardButton,
  EventCardDeadline,
  EventCardDescription,
  EventCardEyebrow,
  EventCardHeadline,
  EventCardShell,
} from "./EventCardParts";
import { EventNominationsArt } from "./EventNominationsArt";
import { EventPhaseTimeline } from "./EventPhaseTimeline";
import { RecapLiveArt } from "./RecapLiveArt";

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
        : "/wrapped";
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

  const isHalf = layout === "half";
  const longDate = (value: string | Date | null | undefined) =>
    formatUtcDate(value, locale, { day: "numeric", month: "long" }) ?? "";

  const visualClassName = cn(
    "flex shrink-0 flex-col justify-end gap-3",
    layout === "wide" ? "md:w-64" : "w-full",
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

  /**
   * Text column of a card. `visual` is the block that Wide keeps beside the
   * text (and Mobile below it); Half moves its `halfArt` into the shell's art
   * column.
   */
  const renderCard = (
    content: ReactNode,
    visual: ReactNode,
    halfArt?: ReactNode,
  ) => (
    <EventCardShell
      kind={kind}
      layout={layout}
      art={
        halfArt ??
        (visual ? (
          <div className={"flex h-full w-full items-center justify-center"}>
            {visual}
          </div>
        ) : undefined)
      }
    >
      <div className={"flex min-w-0 flex-1 flex-col gap-[10px]"}>{content}</div>
      {!isHalf && visual ? renderVisual(visual) : null}
    </EventCardShell>
  );

  const actions = (
    primary: ReactNode,
    secondary?: ReactNode,
    above?: ReactNode,
  ) => (
    <div className={"mt-auto flex flex-col gap-4 pt-1"}>
      {above}
      <Group gap={8} wrap={"wrap"}>
        {primary}
        {secondary}
      </Group>
    </div>
  );

  if (kind === "awards-nominations") {
    if (!awardsEvent) {
      return null;
    }

    const href =
      season.awardsEntry?.href ??
      getAwardsScreenHref(awardsEvent.year, awardsEvent.phase);
    const chip = deadlineLabel(awardsEvent.nominationEndDate);
    const nominationsArt = <EventNominationsArt eventId={awardsEvent.id} />;

    return renderCard(
      <>
        <EventCardEyebrow
          trailing={chip && <EventCardDeadline>{chip}</EventCardDeadline>}
        >
          {t("events.card.awards.eyebrow", { year: awardsEvent.year })}
        </EventCardEyebrow>
        <EventCardHeadline layout={layout}>
          {t("events.card.awards.nominationsHeadline")}
        </EventCardHeadline>
        <EventCardDescription>
          {t("events.card.awards.nominationsDescription", {
            date: longDate(awardsEvent.votingStartDate),
          })}
        </EventCardDescription>
        {!isHalf && (
          <Text size={"xs"} className={"text-dimmed-1"}>
            {t("events.card.awards.participationReward")}
          </Text>
        )}
        {isVisitor
          ? actions(
              <EventCardButton onClick={() => void redirectToAuth()}>
                {t("events.card.awards.visitorNominationsAction")}
              </EventCardButton>,
              undefined,
              <EventPhaseTimeline
                nominationStartDate={awardsEvent.nominationStartDate}
                nominationEndDate={awardsEvent.nominationEndDate}
                votingStartDate={awardsEvent.votingStartDate}
                votingEndDate={awardsEvent.votingEndDate}
                resultsDate={awardsEvent.resultsDate}
                active={"nominations"}
              />,
            )
          : actions(
              <Link href={href}>
                <EventCardButton>
                  {t("events.card.awards.nominationsPrimary")}
                </EventCardButton>
              </Link>,
              <Link href={href}>
                <EventCardButton tone={"secondary"}>
                  {t("events.card.awards.nominationsSecondary")}
                </EventCardButton>
              </Link>,
              <EventPhaseTimeline
                nominationStartDate={awardsEvent.nominationStartDate}
                nominationEndDate={awardsEvent.nominationEndDate}
                votingStartDate={awardsEvent.votingStartDate}
                votingEndDate={awardsEvent.votingEndDate}
                resultsDate={awardsEvent.resultsDate}
                active={"nominations"}
              />,
            )}
      </>,
      isHalf ? null : (
        <div className={"relative min-h-[120px] w-full flex-1"}>
          {nominationsArt}
        </div>
      ),
      isHalf ? nominationsArt : undefined,
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

    return renderCard(
      <>
        <EventCardEyebrow
          trailing={chip && <EventCardDeadline>{chip}</EventCardDeadline>}
        >
          {t("events.card.awards.eyebrow", { year: awardsEvent.year })}
        </EventCardEyebrow>
        {isVisitor ? (
          <>
            <EventCardHeadline layout={layout}>
              {t("events.card.awards.visitorVotingHeadline")}
            </EventCardHeadline>
            <EventCardDescription>
              {t("events.card.awards.visitorVotingDescription")}
            </EventCardDescription>
          </>
        ) : (
          <>
            {missingCategories != null && (
              <EventCardHeadline layout={layout}>
                {missingCategories === 1
                  ? t("events.card.awards.votingHeadlineSingle")
                  : t("events.card.awards.votingHeadline", {
                      count: missingCategories,
                    })}
              </EventCardHeadline>
            )}
            {gotyBallotCategory && (
              <EventCardDescription>
                {t("events.card.awards.votingGoty", {
                  played: gotyBallotCategory.playedNomineesCount,
                  total: gotyBallotCategory.nominees.length,
                })}
              </EventCardDescription>
            )}
            {ballot && (
              <Stack gap={4}>
                <Text size={"xs"} className={"text-dimmed-1"}>
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
              <EventCardButton onClick={() => void redirectToAuth()}>
                {t("events.card.awards.visitorVotingAction")}
              </EventCardButton>,
            )
          : actions(
              <Link href={href}>
                <EventCardButton>
                  {t("events.card.awards.votingPrimary")}
                </EventCardButton>
              </Link>,
              <Link href={href}>
                <EventCardButton tone={"secondary"}>
                  {t("events.card.awards.votingSecondary")}
                </EventCardButton>
              </Link>,
            )}
      </>,
      covers.some(Boolean) ? <EventCardCovers games={covers} stretch={layout === "mobile"} /> : trophyVisual,
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

    return renderCard(
      <>
        <EventCardEyebrow>
          {t("events.card.awards.eyebrow", { year: awardsEvent.year })}
        </EventCardEyebrow>
        {winnerName && (
          <EventCardHeadline layout={layout}>
            {t("events.card.awards.resultsWinner", { game: winnerName })}
          </EventCardHeadline>
        )}
        <EventCardDescription>
          {votes && categoriesCount
            ? t("events.card.awards.resultsVotes", {
                votes,
                categories: categoriesCount,
              })
            : t("events.card.awards.resultsTitle", {
                year: awardsEvent.year,
              })}
        </EventCardDescription>
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
            <EventCardButton>
              {t("events.card.awards.resultsPrimary")}
            </EventCardButton>
          </Link>,
          !isVisitor ? (
            <Link href={href}>
              <EventCardButton tone={"secondary"}>
                {t("events.card.awards.resultsShare")}
              </EventCardButton>
            </Link>
          ) : undefined,
        )}
      </>,
      covers.some(Boolean) ? <EventCardCovers games={covers} stretch={layout === "mobile"} /> : trophyVisual,
    );
  }

  if (!recapYear) {
    return null;
  }

  const recapEyebrow = (
    <EventCardEyebrow>
      {t("events.card.recap.eyebrow", { year: recapYear })}
    </EventCardEyebrow>
  );

  if (kind === "recap-live") {
    if (isVisitor) {
      return renderCard(
        <>
          {recapEyebrow}
          <EventCardHeadline layout={layout}>
            {t("events.card.recap.visitorHeadline")}
          </EventCardHeadline>
          <EventCardDescription>
            {t("events.card.recap.visitorDescription")}
          </EventCardDescription>
          {actions(
            <EventCardButton onClick={() => void redirectToAuth()}>
              {t("events.card.recap.visitorAction")}
            </EventCardButton>,
          )}
        </>,
        trophyVisual,
      );
    }

    const closesAt =
      season.recapWindow?.closesAt ??
      new Date(Date.UTC(recapYear, 11, 31)).toISOString();
    const stats = (
      <RecapLiveArt
        hours={hours}
        gamesCount={gamesCount}
        monthlyPlaytimeSeconds={recap?.calendar?.monthlyPlaytimeSeconds}
        year={recapYear}
        fill={isHalf}
        stretch={layout === "mobile"}
      />
    );

    return renderCard(
      <>
        {recapEyebrow}
        <EventCardHeadline layout={layout}>
          {t("events.card.recap.liveHeadline", { year: recapYear })}
        </EventCardHeadline>
        {topGameName && topGameShare && (
          <EventCardDescription>
            {t("events.card.recap.liveDescription", {
              game: topGameName,
              share: topGameShare,
              date: longDate(closesAt),
            })}
          </EventCardDescription>
        )}
        {!isHalf && stats}
        {actions(
          <Link href={recapHref}>
            <EventCardButton>
              {t("events.card.recap.livePrimary")}
            </EventCardButton>
          </Link>,
          !isHalf ? (
            <Link href={storiesHref}>
              <EventCardButton tone={"secondary"}>
                {t("events.card.recap.liveShare")}
              </EventCardButton>
            </Link>
          ) : undefined,
        )}
      </>,
      !isHalf && covers.some(Boolean) ? (
        <EventCardCovers games={covers} stretch={layout === "mobile"} />
      ) : null,
      isHalf ? stats : undefined,
    );
  }

  return renderCard(
    <>
      {recapEyebrow}
      <EventCardHeadline layout={layout}>
        {t("events.card.recap.closedHeadline", { year: recapYear })}
      </EventCardHeadline>
      <Group align={"flex-end"} gap={"xs"}>
        {hours && (
          <Text fz={32} fw={700} lh={1} className={"text-white"}>
            {t("events.card.recap.hours", { hours })}
          </Text>
        )}
        {gamesCount && (
          <Text size={"sm"} className={"pb-0.5 text-nav-muted"}>
            {t("events.card.recap.closedGames", {
              games: gamesCount,
              year: recapYear,
            })}
          </Text>
        )}
      </Group>
      {hours && gamesCount && finishedCount && (
        <EventCardDescription>
          {t("events.card.recap.closedSummary", {
            hours,
            games: gamesCount,
            finished: finishedCount,
          })}
        </EventCardDescription>
      )}
      {actions(
        <Link href={storiesHref}>
          <EventCardButton>
            {t("events.card.recap.closedPrimary")}
          </EventCardButton>
        </Link>,
        <Link href={`${storiesHref}?story=5`}>
          <EventCardButton tone={"secondary"}>
            {t("events.card.recap.closedDownload")}
          </EventCardButton>
        </Link>,
      )}
    </>,
    covers.some(Boolean) ? <EventCardCovers games={covers} stretch={layout === "mobile"} /> : null,
  );
}
