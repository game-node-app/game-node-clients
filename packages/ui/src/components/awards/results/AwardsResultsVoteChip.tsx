import type { AwardsScoreboardOutcome } from "#@/components/awards/types";
import {
  AwardsStatusChip,
  type AwardsChipTone,
} from "#@/components/awards/shared/AwardsStatusChip";
import { useTranslation } from "@repo/locales";

export interface AwardsResultsVoteChipProps {
  outcome?: AwardsScoreboardOutcome | null;
  /** The game the viewer voted for; named by the `miss` chip. */
  votedGameName?: string | null;
}

const OUTCOME_TONES: Record<AwardsScoreboardOutcome, AwardsChipTone> = {
  hit: "played",
  miss: "neutral",
  not_voted: "neutral",
};

/**
 * Chip of a result card from the personal scoreboard (spec: Placar pessoal).
 * `hit` celebrates the right pick, `miss` names the game the viewer chose and
 * `not_voted` states that the category was skipped.
 */
export function AwardsResultsVoteChip({
  outcome,
  votedGameName,
}: AwardsResultsVoteChipProps) {
  const { t } = useTranslation();

  if (!outcome) {
    return null;
  }

  let label: string;

  if (outcome === "hit") {
    label = t("awards.results.voteChip.hit");
  } else if (outcome === "miss") {
    label = votedGameName
      ? t("awards.results.voteChip.miss", { game: votedGameName })
      : t("awards.results.voteChip.missUnknown");
  } else {
    label = t("awards.results.voteChip.notVoted");
  }

  return (
    <AwardsStatusChip
      data-awards-results-vote-chip
      data-outcome={outcome}
      tone={OUTCOME_TONES[outcome]}
    >
      {label}
    </AwardsStatusChip>
  );
}
