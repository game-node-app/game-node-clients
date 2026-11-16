import { getAwardsResultsShareUrl } from "#@/components/awards/results/awardsResults";
import type { AwardsScoreboard } from "#@/components/awards/types";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useShareText } from "#@/context/UIProvider";
import { cn, createErrorNotification } from "#@/util";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconShare } from "@tabler/icons-react";

export interface AwardsResultsScoreboardProps {
  year: number;
  /** User whose scoreboard is displayed (the viewer or the shared link). */
  userId: string;
  /** True when the scoreboard belongs to the signed-in user. */
  isOwn: boolean;
  scoreboard: AwardsScoreboard;
  className?: string;
}

/**
 * "Seu placar" card of the result page (frames `5410:977`/`5412:1008`).
 *
 * The totals always come from the response. A shared link shows the same block
 * with the profile name instead of "Você", and only the owner can share the
 * score link back.
 */
export function AwardsResultsScoreboard({
  year,
  userId,
  isOwn,
  scoreboard,
  className,
}: AwardsResultsScoreboardProps) {
  const { t } = useTranslation();
  const shareText = useShareText();
  const profile = useUserProfile(isOwn ? undefined : userId);
  const name = profile.data?.username;

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

  const totals = scoreboard.totals;
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

  return (
    <Paper
      data-awards-results-scoreboard
      data-own={isOwn ? "true" : "false"}
      className={cn(
        "border border-brand/40 bg-brand-5/10 p-4 md:p-6",
        className,
      )}
    >
      <Stack gap={"sm"}>
        <Text size={"lg"} fw={700}>
          {t("awards.results.scoreboard.title")}
        </Text>
        <Text data-awards-results-score-summary size={"md"}>
          {summary}
        </Text>
        {isOwn && (
          <Group>
            <Button
              data-awards-results-share
              variant={"light"}
              leftSection={<IconShare size={16} />}
              onClick={() => void onShare()}
            >
              {t("awards.results.scoreboard.share")}
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
