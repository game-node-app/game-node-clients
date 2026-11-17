import type { AwardsScoreboardOutcome } from "#@/components/awards/types";
import { findCategoryWinner } from "#@/components/awards/results/awardsResults";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import { useAwardsCategoryText } from "#@/components/awards/shared/awardsCategoryText";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { cn } from "#@/util";
import { Box } from "@mantine/core";
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
 * One tile of the all-category winners (frame `5410:982`): 60×80 cover,
 * category eyebrow, winner and the personal scoreboard chip.
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
    <div
      data-awards-results-winner-card
      data-category-id={result.categoryId}
      data-category-order={result.category.order}
      className={cn(
        "flex items-center gap-4 rounded-[14px] border border-line bg-paper-5 p-[14px]",
        className,
      )}
    >
      <Box className={"h-20 w-[60px] shrink-0 overflow-hidden rounded-[6px]"}>
        <AwardsGameCover
          game={game}
          size={ImageSize.COVER_BIG}
          className={"h-full"}
          imageProps={{ radius: 6 }}
        />
      </Box>
      <div className={"flex min-w-0 flex-1 flex-col items-start gap-1.5"}>
        <p
          className={
            "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-dimmed-1"
          }
        >
          {categoryText.name}
        </p>
        <p
          className={
            "break-words text-[16px] font-medium leading-normal text-white"
          }
        >
          {winnerName}
        </p>
        <AwardsResultsVoteChip
          outcome={outcome}
          votedGameName={votedGameName}
        />
      </div>
    </div>
  );
}
