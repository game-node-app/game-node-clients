import { getAwardsResultsShareUrl } from "#@/components/awards/results/awardsResults";
import { AwardsSecondaryButton } from "#@/components/awards/shared/AwardsSecondaryButton";
import { useAwardsMobileLayout } from "#@/components/awards/shared/useAwardsMobileLayout";
import type { AwardsScoreboard } from "#@/components/awards/types";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useShareText } from "#@/context/UIProvider";
import { cn, createErrorNotification } from "#@/util";
import { useTranslation } from "@repo/locales";

export interface AwardsResultsScoreboardProps {
  year: number;
  /** User whose scoreboard is displayed (the viewer or the shared link). */
  userId: string;
  /** True when the scoreboard belongs to the signed-in user. */
  isOwn: boolean;
  scoreboard: AwardsScoreboard;
  className?: string;
}

/** Name and share action of the scoreboard, shared by both of its blocks. */
function useScoreboardActions({
  year,
  userId,
  isOwn,
  scoreboard,
}: Omit<AwardsResultsScoreboardProps, "className">) {
  const { t } = useTranslation();
  const shareText = useShareText();
  const profile = useUserProfile(isOwn ? undefined : userId);
  const name = profile.data?.username;
  const totals = scoreboard.totals;

  const onShare = async () => {
    try {
      const url = getAwardsResultsShareUrl(year, userId);
      await shareText(
        `${t("awards.results.scoreboard.shareText", { year })} ${url}`,
      );
    } catch (error) {
      createErrorNotification(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  return { t, name, totals, onShare };
}

/**
 * Header of the "all categories" section (frame `5410:888`): the "Seu placar"
 * eyebrow, the score sentence and the share action. A shared link shows the
 * same block with the profile name instead of "Você", and only the owner can
 * share the score link back.
 *
 * Below `md` the sentence moves to `AwardsResultsScoreCard`, so this block is
 * reduced to the share action.
 */
export function AwardsResultsScoreboard({
  className,
  ...props
}: AwardsResultsScoreboardProps) {
  const { t, name, totals, onShare } = useScoreboardActions(props);
  const compact = useAwardsMobileLayout();
  const { isOwn } = props;

  const summary =
    isOwn || !name
      ? t("awards.results.scoreboard.summary", {
          hits: totals.hits,
          scorable: totals.scorable,
        })
      : t("awards.results.scoreboard.summaryOther", {
          name,
          hits: totals.hits,
          scorable: totals.scorable,
        });

  const share = isOwn ? (
    <AwardsSecondaryButton
      data-awards-results-share
      fullWidth={compact}
      onClick={() => void onShare()}
    >
      {t("awards.results.scoreboard.share")}
    </AwardsSecondaryButton>
  ) : null;

  if (compact) {
    return share ? (
      <div
        data-awards-results-scoreboard
        data-own={isOwn ? "true" : "false"}
        className={className}
      >
        {share}
      </div>
    ) : null;
  }

  return (
    <div
      data-awards-results-scoreboard
      data-own={isOwn ? "true" : "false"}
      className={cn("flex w-full items-end justify-between gap-6", className)}
    >
      <div className={"flex min-w-0 flex-col gap-3"}>
        <p
          className={
            "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-brand-3"
          }
        >
          {t("awards.results.scoreboard.title")}
        </p>
        <p
          data-awards-results-score-summary
          className={
            "text-[32px] font-bold leading-[38px] tracking-[-0.32px] text-foreground"
          }
        >
          {summary}
        </p>
      </div>
      {share}
    </div>
  );
}

export interface AwardsResultsScoreCardProps
  extends Omit<AwardsResultsScoreboardProps, "className"> {
  /** Scrolls to the category tiles. */
  onViewCategories: () => void;
  className?: string;
}

/**
 * Mobile "score-card" (frame `5412:935`): "Seu placar", "7 de 11 acertos" and
 * the "Ver categorias" action.
 */
export function AwardsResultsScoreCard({
  onViewCategories,
  className,
  ...props
}: AwardsResultsScoreCardProps) {
  const { t, name, totals } = useScoreboardActions(props);
  const { isOwn } = props;

  return (
    <div
      data-awards-results-score-card
      data-own={isOwn ? "true" : "false"}
      className={cn(
        "flex w-full items-center gap-3 rounded-[14px] border border-line bg-paper-5 px-4 py-3.5",
        className,
      )}
    >
      <div className={"flex min-w-0 flex-1 flex-col gap-1"}>
        <p
          className={
            "truncate text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-dimmed-1"
          }
        >
          {isOwn || !name ? t("awards.results.scoreboard.title") : name}
        </p>
        <p
          data-awards-results-score-summary
          className={
            "text-[20px] font-semibold leading-[normal] text-foreground"
          }
        >
          {t("awards.results.scoreboard.hitsCompact", {
            hits: totals.hits,
            scorable: totals.scorable,
          })}
        </p>
      </div>
      <AwardsSecondaryButton onClick={onViewCategories}>
        {t("awards.results.scoreboard.viewCategories")}
      </AwardsSecondaryButton>
    </div>
  );
}
