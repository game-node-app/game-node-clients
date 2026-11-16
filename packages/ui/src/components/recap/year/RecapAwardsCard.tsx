import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useAwardsBallot } from "#@/components/awards/hooks/useAwardsBallot";
import { useCurrentAwardsEvent } from "#@/components/awards/hooks/useCurrentAwardsEvent";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatNumber,
  useFormatLocale,
} from "#@/components/events/util/format";
import { getAwardsEntry } from "#@/components/events/util/seasonEvents";
import { Link } from "#@/util";
import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapAwardsCardProps {
  year: number;
  /** Owner of the Recap. Visitors never see the ballot shortcut. */
  userId: string;
}

/**
 * Awards shortcut inside the Recap backlog (spec: Atalho para a cédula). It is
 * composed from the current event, the ballot and the categories, and only
 * exists for the signed-in owner while the same year is in `voting`.
 */
export function RecapAwardsCard({ year, userId }: RecapAwardsCardProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const loggedUserId = useUserId();
  const currentEventQuery = useCurrentAwardsEvent();

  const event =
    currentEventQuery.data?.year === year ? currentEventQuery.data : null;
  const isOwner = !!loggedUserId && loggedUserId === userId;
  const isVoting = event?.phase === "voting";
  const enabled = isOwner && isVoting && event != null;

  const ballot = useAwardsBallot(enabled ? event.id : undefined);
  const categories = useAwardEventCategories(enabled ? event.id : undefined);

  if (!event || !enabled) return null;

  const entry = getAwardsEntry(event, ballot.data, categories.data, new Date());
  const gotyCategory = categories.data?.find((category) => category.isGOTY);
  const gotyBallotCategory = gotyCategory
    ? ballot.data?.categories.find(
        (category) => category.id === gotyCategory.id,
      )
    : undefined;
  const gotyTotals = gotyBallotCategory
    ? {
        played: gotyBallotCategory.playedNomineesCount,
        total: gotyBallotCategory.nominees.length,
      }
    : null;

  return (
    <Paper
      data-testid={"recap-awards-card"}
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "lg" }}
      className={"bg-paper-4"}
    >
      <Stack gap={"sm"}>
        <Title order={3} size={"h4"}>
          {t("recap.page.awards.title", { year })}
        </Title>
        {gotyTotals && (
          <Text size={"md"} fw={700}>
            {t("recap.page.awards.played", {
              played: formatNumber(gotyTotals.played, locale) ?? "0",
              total: formatNumber(gotyTotals.total, locale) ?? "0",
            })}
          </Text>
        )}
        <Text size={"sm"} c={"dimmed"}>
          {t("recap.page.awards.note", { year })}
        </Text>
        {entry && (
          <Button
            component={Link}
            href={entry.href}
            variant={"light"}
            className={"self-start"}
          >
            {t("recap.page.awards.action")}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
