import { Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GuildContractDto } from "@repo/wrapper/server";
import { useGuildAccess } from "#@/components/guild/hooks/useGuildAccess";
import { useGuildContracts } from "#@/components/guild/hooks/useGuildContracts";

const GUILD_REVIEW_MIN_LENGTH = 80;

interface GuildReviewLengthHintProps {
  /** Trimmed plain-text length of the current review content. */
  length: number;
}

/**
 * Counter for the 80-character minimum of Guild `write_review` contracts
 * (design D10). Renders only for players with access and an active
 * `write_review` contract; it never interferes with saving the review.
 *
 * Reads the accepted-contracts list instead of the Guild overview: the
 * overview (`GET /v1/guild`) lazily creates the profile, runs the contract
 * evaluator and updates `lastVisitedAt`, which would count as a Guild visit
 * and swallow Lina's `returning_after_inactivity` greeting.
 */
const GuildReviewLengthHint = ({ length }: GuildReviewLengthHintProps) => {
  const { t } = useTranslation();
  const access = useGuildAccess();
  const contractsQuery = useGuildContracts("accepted");

  const hasAccess = access.data?.hasAccess === true;
  const hasReviewContract =
    contractsQuery.data?.pages
      .flatMap((page) => page.data)
      .some(
        (contract) =>
          contract.status === GuildContractDto.status.ACTIVE &&
          contract.objectiveType ===
            GuildContractDto.objectiveType.WRITE_REVIEW,
      ) ?? false;

  if (!hasAccess || !hasReviewContract) {
    return null;
  }

  const reachedMinimum = length >= GUILD_REVIEW_MIN_LENGTH;

  return (
    <Group gap={8} wrap="wrap" mt={4}>
      <Text fz="xs" c="dimmed">
        {t("guild.reviewHint.counter", { count: length })}
      </Text>
      <Text fz="xs" className={reachedMinimum ? "text-accent" : "text-muted"}>
        {t(reachedMinimum ? "guild.reviewHint.ok" : "guild.reviewHint.short")}
      </Text>
    </Group>
  );
};

export { GuildReviewLengthHint };
export type { GuildReviewLengthHintProps };
