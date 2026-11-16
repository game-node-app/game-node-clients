import {
  formatNumber,
  useFormatLocale,
} from "#@/components/events/util/format";
import { RecapGoalCard } from "#@/components/recap/goal/RecapGoalCard";
import type { YearRecap } from "#@/components/recap/types";
import { RecapAwardsCard } from "#@/components/recap/year/RecapAwardsCard";
import { Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapBacklogSectionProps {
  year: number;
  recap: YearRecap;
  /** Owner of the Recap; the Awards card and the goal need the signed-in owner. */
  userId: string;
}

/**
 * "Backlog and next step" (frame 5420:945): added/finished/growth, the
 * finished/dropped/queued grid, the optional ballot shortcut and the goal card.
 * The growth sentence is omitted when `backlogGrowth` is 0.
 */
export function RecapBacklogSection({
  year,
  recap,
  userId,
}: RecapBacklogSectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const number = (value: number) => formatNumber(value, locale) ?? "0";

  return (
    <Paper
      data-testid={"recap-backlog"}
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={"bg-paper-8"}
    >
      <Stack gap={"lg"}>
        <Stack gap={4}>
          <Title order={2} size={"h2"}>
            {t("recap.page.backlog.title")}
          </Title>
          <Text size={"md"}>
            {t("recap.page.backlog.summary", {
              added: number(recap.totalAddedGames),
              finished: number(recap.totalFinishedGames),
            })}
          </Text>
          {recap.backlogGrowth > 0 && (
            <Text size={"sm"} c={"dimmed"}>
              {t("recap.page.backlog.growth", {
                count: number(recap.backlogGrowth),
              })}
            </Text>
          )}
        </Stack>

        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing={"sm"}>
          <BacklogStat
            value={number(recap.totalFinishedGames)}
            label={t("recap.page.backlog.finished")}
          />
          <BacklogStat
            value={number(recap.totalDroppedGames)}
            label={t("recap.page.backlog.dropped")}
          />
          <BacklogStat
            value={number(recap.backlogGrowth)}
            label={t("recap.page.backlog.queued")}
          />
        </SimpleGrid>

        <RecapAwardsCard year={year} userId={userId} />
        <RecapGoalCard
          year={year}
          userId={userId}
          finishedGames={recap.totalFinishedGames}
        />
      </Stack>
    </Paper>
  );
}

function BacklogStat({ value, label }: { value: string; label: string }) {
  return (
    <div className={"flex flex-col gap-1 rounded-md bg-paper-4 p-4"}>
      <Text size={"2rem"} fw={800} lh={1}>
        {value}
      </Text>
      <Text size={"sm"} c={"dimmed"}>
        {label}
      </Text>
    </div>
  );
}
