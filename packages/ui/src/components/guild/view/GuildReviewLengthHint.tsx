import { Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GuildContractDto } from "@repo/wrapper/server";
import { useGuildAccess } from "#@/components/guild/hooks/useGuildAccess";
import { useGuildContracts } from "#@/components/guild/hooks/useGuildContracts";

const DEFAULT_WRITE_REVIEW_MIN_LENGTH = 80;
const DEFAULT_BONUS_REVIEW_MIN_LENGTH = 150;

function toPositiveInt(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : null;
}

function getContractRequiredReviewLength(
  contract: GuildContractDto,
): number | null {
  if (contract.status !== GuildContractDto.status.ACTIVE) {
    return null;
  }

  let required: number | null = null;

  if (contract.objectiveType === GuildContractDto.objectiveType.WRITE_REVIEW) {
    required =
      toPositiveInt(contract.criteria?.minReviewChars) ??
      toPositiveInt(contract.criteria?.minChars) ??
      DEFAULT_WRITE_REVIEW_MIN_LENGTH;
  }

  if (
    !contract.bonusCompleted &&
    contract.bonusObjective?.type === "also_write_review"
  ) {
    const bonusMin =
      toPositiveInt(contract.bonusObjective?.minChars) ??
      DEFAULT_BONUS_REVIEW_MIN_LENGTH;
    required = required === null ? bonusMin : Math.max(required, bonusMin);
  }

  return required;
}

interface GuildReviewLengthHintProps {
  /** Trimmed plain-text length of the current review content. */
  length: number;
}

/**
 * Counter for the minimum length of active Guild `write_review` contracts and
 * uncompleted `also_write_review` bonus objectives (design D10). Renders only
 * for players with access and a matching active requirement; it never
 * interferes with saving the review.
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
  const contracts =
    contractsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const requiredMin = contracts.reduce<number | null>((max, contract) => {
    const current = getContractRequiredReviewLength(contract);
    if (current === null) return max;
    return max === null ? current : Math.max(max, current);
  }, null);

  if (!hasAccess || requiredMin === null) {
    return null;
  }

  const reachedMinimum = length >= requiredMin;

  return (
    <Group gap={8} wrap="wrap" mt={4}>
      <Text fz="xs" c="dimmed">
        {t("guild.reviewHint.counter", { count: length, min: requiredMin })}
      </Text>
      <Text fz="xs" className={reachedMinimum ? "text-accent" : "text-muted"}>
        {reachedMinimum
          ? t("guild.reviewHint.ok")
          : t("guild.reviewHint.short", { min: requiredMin })}
      </Text>
    </Group>
  );
};

export { GuildReviewLengthHint };
export type { GuildReviewLengthHintProps };
