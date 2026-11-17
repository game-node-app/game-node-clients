import {
  findCategoryWinner,
  getPlayedDispute,
  getWinnerPercentage,
  hasPlayedVotes,
  sortWinnersByMode,
  type AwardsResultsVoteMode,
} from "#@/components/awards/results/awardsResults";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import { AwardsSegmentedControl } from "#@/components/awards/shared/AwardsSegmentedControl";
import { AwardsStatusChip } from "#@/components/awards/shared/AwardsStatusChip";
import { useAwardsMobileLayout } from "#@/components/awards/shared/useAwardsMobileLayout";
import {
  formatNumber,
  formatPercentage,
  useFormatLocale,
} from "#@/components/events/util/format";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { cn } from "#@/util";
import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { AwardsCategoryResult, Game } from "@repo/wrapper/server";
import { useState } from "react";

export interface AwardsResultsGOTYProps {
  result: AwardsCategoryResult;
  gamesById: ReadonlyMap<number, Game>;
  /** The game the viewer voted for in GOTY, marked in the vote list. */
  votedGameId?: number | null;
  className?: string;
}

/**
 * Featured block of the result page (frames `5410:888` and `5412:935`): the
 * GOTY winner, the "Todos os votos / Só quem jogou" toggle, the vote share
 * list and the played-only dispute note.
 *
 * The toggle and the note are omitted when the category has no played votes
 * (old events), and the toggle only reorders/rerates this list — the featured
 * winner stays the position-1 game of the full vote. Bars are drawn relative
 * to the leading share; the viewer's own vote is marked with "Seu voto".
 */
export function AwardsResultsGOTY({
  result,
  gamesById,
  votedGameId,
  className,
}: AwardsResultsGOTYProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const compact = useAwardsMobileLayout();
  const [selectedMode, setSelectedMode] =
    useState<AwardsResultsVoteMode>("all");

  const showPlayed = hasPlayedVotes(result);
  const mode: AwardsResultsVoteMode = showPlayed ? selectedMode : "all";

  const winner = findCategoryWinner(result);
  const winnerGame = winner ? (gamesById.get(winner.gameId) ?? null) : null;
  const gameName = (gameId: number) =>
    gamesById.get(gameId)?.name ??
    t("awards.results.gameFallback", { id: gameId });

  const winnerName = winner ? gameName(winner.gameId) : null;
  const votes = formatNumber(result.totalVotesCount, locale) ?? "0";
  const winners = sortWinnersByMode(result.winners, mode);
  const dispute = showPlayed ? getPlayedDispute(result.winners) : null;
  const leadShare = winners.length ? getWinnerPercentage(winners[0], mode) : 0;

  const eyebrow = (
    <p
      className={
        "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-brand-3"
      }
    >
      {compact
        ? t("awards.results.gotyEyebrowCompact", { votes })
        : t("awards.results.gotyEyebrow", { votes })}
    </p>
  );

  const title = winnerName && (
    <h1
      className={cn(
        "font-bold text-white",
        compact
          ? "text-[28px] leading-[34px] tracking-[-0.28px]"
          : "text-[40px] leading-[46px] tracking-[-0.4px]",
      )}
    >
      {compact
        ? t("awards.results.gotyTitleCompact", { game: winnerName })
        : t("awards.results.gotyTitle", { game: winnerName })}
    </h1>
  );

  const filter = showPlayed && (
    <AwardsSegmentedControl
      data-awards-results-filter
      aria-label={t("awards.results.filter.label")}
      surface={"surface"}
      fullWidth={compact}
      playedValue={"played"}
      value={mode}
      onChange={setSelectedMode}
      options={[
        { value: "all", label: t("awards.results.filter.all") },
        { value: "played", label: t("awards.results.filter.played") },
      ]}
    />
  );

  const rows = (
    <div
      data-awards-results-vote-list
      className={cn("flex w-full flex-col", compact ? "gap-4" : "gap-3.5")}
    >
      {winners.map((row, index) => {
        const percentage = getWinnerPercentage(row, mode);
        const label = formatPercentage(percentage, locale) ?? "0%";
        const isLeader = index === 0;
        const isOwnVote = votedGameId != null && row.gameId === votedGameId;
        const game = gamesById.get(row.gameId);
        const width = leadShare > 0 ? (percentage / leadShare) * 100 : 0;

        const ownChip = isOwnVote ? (
          <AwardsStatusChip tone={"brand"} data-awards-results-own-vote>
            {t("awards.shared.nominee.yourVote")}
          </AwardsStatusChip>
        ) : null;

        const bar = (
          <div
            role={"progressbar"}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percentage * 100)}
            className={cn(
              "w-full overflow-hidden bg-paper-1",
              compact ? "h-1.5 rounded-[3px]" : "h-2 rounded-[4px]",
            )}
          >
            <div
              className={cn(
                "h-full",
                compact ? "rounded-[3px]" : "rounded-[4px]",
                isLeader
                  ? "bg-brand"
                  : isOwnVote
                    ? "bg-brand-3"
                    : "bg-dimmed-1",
              )}
              style={{ width: `${Math.min(100, Math.max(0, width))}%` }}
            />
          </div>
        );

        const nameClass = cn(
          "truncate",
          compact ? "text-[14px] leading-[1.43]" : "text-[16px] leading-normal",
          isLeader ? "font-medium text-white" : "text-nav-muted",
        );
        const percentClass = cn(
          "shrink-0 text-right",
          isLeader
            ? compact
              ? "text-[16px] font-medium text-white"
              : "w-14 text-[20px] font-semibold text-white"
            : compact
              ? "text-[14px] font-medium text-nav-muted"
              : "w-14 text-[16px] font-medium text-nav-muted",
        );

        if (compact) {
          return (
            <div
              key={row.id}
              data-awards-results-vote-row
              data-game-id={row.gameId}
              className={"flex flex-col gap-2"}
            >
              <div className={"flex items-center gap-2"}>
                <span className={nameClass}>{gameName(row.gameId)}</span>
                {ownChip}
                <span className={"min-w-px flex-1"} />
                <span className={percentClass}>{label}</span>
              </div>
              {bar}
            </div>
          );
        }

        return (
          <div
            key={row.id}
            data-awards-results-vote-row
            data-game-id={row.gameId}
            className={"flex items-center gap-4"}
          >
            <Box
              className={"h-10 w-[30px] shrink-0 overflow-hidden rounded-[4px]"}
            >
              <AwardsGameCover
                game={game}
                className={"h-full"}
                imageProps={{ radius: 4 }}
              />
            </Box>
            <div className={"flex min-w-0 flex-1 flex-col gap-2"}>
              <div className={"flex items-center gap-2.5"}>
                <span className={nameClass}>{gameName(row.gameId)}</span>
                {ownChip}
              </div>
              {bar}
            </div>
            <span className={percentClass}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  const note = dispute && (
    <p
      data-awards-results-dispute
      className={
        "w-full rounded-[12px] bg-state-played-tint px-4 py-3.5 text-[14px] leading-[1.43] text-state-played"
      }
    >
      {t("awards.results.disputeNote", {
        first: gameName(dispute[0].gameId),
        firstPercentage:
          formatPercentage(getWinnerPercentage(dispute[0], "played"), locale) ??
          "0%",
        second: gameName(dispute[1].gameId),
        secondPercentage:
          formatPercentage(getWinnerPercentage(dispute[1], "played"), locale) ??
          "0%",
      })}
    </p>
  );

  if (compact) {
    return (
      <section
        data-awards-results-goty
        data-category-id={result.categoryId}
        className={cn("flex w-full flex-col gap-4", className)}
      >
        <div className={"flex items-center gap-4 pt-4"}>
          {winnerGame && (
            <Box
              className={
                "h-36 w-[108px] shrink-0 overflow-hidden rounded-[10px]"
              }
            >
              <AwardsGameCover
                game={winnerGame}
                size={ImageSize.COVER_BIG}
                className={"h-full"}
                imageProps={{ radius: 10 }}
              />
            </Box>
          )}
          <div className={"flex min-w-0 flex-1 flex-col gap-2"}>
            {eyebrow}
            {title}
          </div>
        </div>
        {filter}
        {rows}
        {note}
      </section>
    );
  }

  return (
    <section
      data-awards-results-goty
      data-category-id={result.categoryId}
      className={cn(
        "flex w-full items-center gap-10 py-8 lg:gap-20",
        className,
      )}
    >
      {winnerGame && (
        <Box
          className={
            "aspect-[3/4] w-[36%] max-w-[450px] shrink-0 overflow-hidden rounded-[16px]"
          }
        >
          <AwardsGameCover
            game={winnerGame}
            size={ImageSize.COVER_BIG_2X}
            className={"h-full"}
            imageProps={{ radius: 16 }}
          />
        </Box>
      )}
      <div className={"flex min-w-0 flex-1 flex-col items-start gap-6"}>
        <div className={"flex flex-col gap-4"}>
          {eyebrow}
          {title}
        </div>
        {filter}
        {rows}
        {note}
      </div>
    </section>
  );
}
