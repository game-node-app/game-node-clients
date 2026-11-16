import type { AwardsScoreboardOutcome } from "#@/components/awards/types";
import { findCategoryWinner } from "#@/components/awards/results/awardsResults";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import { useAwardsCategoryText } from "#@/components/awards/shared/awardsCategoryText";
import { cn } from "#@/util";
import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { AwardsCategoryResult, Game } from "@repo/wrapper/server";
import { AwardsResultsVoteChip } from "./AwardsResultsVoteChip";

export interface AwardsResultsWinnerCardProps {
  result: AwardsCategoryResult;
  game?: Game | null;
  /** The viewer's outcome in this category, when a scoreboard was read. */
  outcome?: AwardsScoreboardOutcome | null;
  votedGameName?: string | null;
  className?: string;
}

/**
 * One row of the all-category winners (frame `5410:982`): category, winner and
 * the personal scoreboard chip.
 */
export function AwardsResultsWinnerCard({
  result,
  game,
  outcome,
  votedGameName,
  className,
}: AwardsResultsWinnerCardProps) {
  const { t } = useTranslation();
  const resolveCategoryText = useAwardsCategoryText();
  const winner = findCategoryWinner(result);

  if (!winner) {
    return null;
  }

  const categoryText = resolveCategoryText(result.category);
  const winnerName =
    game?.name ?? t("awards.results.gameFallback", { id: winner.gameId });

  return (
    <Paper
      data-awards-results-winner-card
      data-category-id={result.categoryId}
      data-category-order={result.category.order}
      className={cn("border border-paper-4 bg-paper-2 p-3", className)}
    >
      <Group align={"flex-start"} wrap={"nowrap"} gap={"sm"}>
        <Box className={"w-16 shrink-0"}>
          <AwardsGameCover game={game} />
        </Box>
        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text size={"xs"} c={"dimmed"} className={"uppercase tracking-wide"}>
            {categoryText.name}
          </Text>
          <Text fw={600} className={"truncate"}>
            {winnerName}
          </Text>
          <AwardsResultsVoteChip
            outcome={outcome}
            votedGameName={votedGameName}
          />
        </Stack>
      </Group>
    </Paper>
  );
}
