import type { AwardsScoreboardOutcome } from "#@/components/awards/types";
import {
  findCategoryWinner,
  getPlayedDispute,
  getWinnerPercentage,
  hasPlayedVotes,
  sortWinnersByMode,
  type AwardsResultsVoteMode,
} from "#@/components/awards/results/awardsResults";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import {
  formatNumber,
  formatPercentage,
  useFormatLocale,
} from "#@/components/events/util/format";
import { cn } from "#@/util";
import {
  Box,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { AwardsCategoryResult, Game } from "@repo/wrapper/server";
import { useState } from "react";
import { AwardsResultsVoteChip } from "./AwardsResultsVoteChip";

export interface AwardsResultsGOTYProps {
  result: AwardsCategoryResult;
  gamesById: ReadonlyMap<number, Game>;
  /** The viewer's outcome in the GOTY category, when a scoreboard was read. */
  outcome?: AwardsScoreboardOutcome | null;
  votedGameName?: string | null;
  className?: string;
}

/**
 * Featured block of the result page (frames `5410:907`–`5410:973`): the GOTY
 * winner, the "Todos os votos / Só quem jogou" toggle, the vote share list and
 * the played-only dispute note.
 *
 * The toggle and the note are omitted when the category has no played votes
 * (old events), and the toggle only reorders/rerates this list — the featured
 * winner stays the position-1 game of the full vote.
 */
export function AwardsResultsGOTY({
  result,
  gamesById,
  outcome,
  votedGameName,
  className,
}: AwardsResultsGOTYProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
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

  return (
    <Paper
      data-awards-results-goty
      data-category-id={result.categoryId}
      className={cn("border border-paper-4 bg-paper-2 p-4 md:p-6", className)}
    >
      <Stack gap={"md"}>
        <Text size={"xs"} c={"dimmed"} className={"uppercase tracking-wide"}>
          {t("awards.results.gotyEyebrow", { votes })}
        </Text>
        <Group align={"flex-start"} wrap={"nowrap"} gap={"md"}>
          {winnerGame && (
            <Box className={"w-24 shrink-0 md:w-32"}>
              <AwardsGameCover game={winnerGame} />
            </Box>
          )}
          <Stack gap={"xs"} className={"min-w-0 flex-1"}>
            {winnerName && (
              <Text size={"xl"} fw={800}>
                {t("awards.results.gotyTitle", { game: winnerName })}
              </Text>
            )}
            <AwardsResultsVoteChip
              outcome={outcome}
              votedGameName={votedGameName}
            />
          </Stack>
        </Group>
        {showPlayed && (
          <SegmentedControl
            data-awards-results-filter
            aria-label={t("awards.results.filter.label")}
            value={mode}
            onChange={(value) =>
              setSelectedMode(value as AwardsResultsVoteMode)
            }
            data={[
              { value: "all", label: t("awards.results.filter.all") },
              { value: "played", label: t("awards.results.filter.played") },
            ]}
            size={"xs"}
            className={"self-start"}
          />
        )}
        <Stack gap={"sm"} data-awards-results-vote-list>
          {winners.map((row) => {
            const percentage = getWinnerPercentage(row, mode);
            const label = formatPercentage(percentage, locale) ?? "0%";

            return (
              <Stack
                key={row.id}
                gap={4}
                data-awards-results-vote-row
                data-game-id={row.gameId}
              >
                <Group justify={"space-between"} gap={"sm"} wrap={"nowrap"}>
                  <Text size={"sm"} fw={600} className={"truncate"}>
                    {gameName(row.gameId)}
                  </Text>
                  <Text size={"sm"} c={"dimmed"}>
                    {label}
                  </Text>
                </Group>
                <Progress
                  value={Math.min(100, Math.max(0, percentage * 100))}
                  size={"sm"}
                  radius={"xl"}
                  aria-label={label}
                />
              </Stack>
            );
          })}
        </Stack>
        {dispute && (
          <Text data-awards-results-dispute size={"sm"} c={"dimmed"}>
            {t("awards.results.disputeNote", {
              first: gameName(dispute[0].gameId),
              firstPercentage:
                formatPercentage(
                  getWinnerPercentage(dispute[0], "played"),
                  locale,
                ) ?? "0%",
              second: gameName(dispute[1].gameId),
              secondPercentage:
                formatPercentage(
                  getWinnerPercentage(dispute[1], "played"),
                  locale,
                ) ?? "0%",
            })}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
