import {
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DailyInfoTile } from "#@/components/daily/view/DailyInfoTile";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { useDailyResults } from "#@/components/daily/hooks/useDailyResults";
import {
  computeDailyStats,
  toSaoPauloDate,
} from "#@/components/daily/util/computeDailyStats";

interface Props {
  mode: DailyMode;
  maxAttempts: number;
  /** Attempts of the puzzle just solved, highlighted in the distribution. */
  highlight?: number;
}

const DailyStatsPanel = ({ mode, maxAttempts, highlight }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const resultsQuery = useDailyResults(mode);
  const [local] = useDailyLocalResults();
  const results = userId
    ? (resultsQuery.data?.data ?? [])
    : Object.values(local).filter((result) => result.mode === mode);

  const stats = computeDailyStats(
    results,
    maxAttempts,
    toSaoPauloDate(new Date()),
  );
  const highest = Math.max(...stats.distribution, 1);
  const numbers = [
    [t("daily.stats.played"), stats.played],
    [
      t("daily.stats.winRate"),
      `${stats.played ? Math.round((stats.wins / stats.played) * 100) : 0}%`,
    ],
    [t("daily.stats.currentStreak"), stats.currentStreak],
    [t("daily.stats.maxStreak"), stats.maxStreak],
  ] as const;

  return (
    <Paper withBorder p={"md"} className={"w-full"}>
      <Stack className={"gap-3"}>
        <Title order={4}>{t("daily.stats.title")}</Title>
        <SimpleGrid type={"container"} cols={{ base: 2, "28rem": 4 }}>
          {numbers.map(([label, value]) => (
            <DailyInfoTile key={label} label={label} value={value} />
          ))}
        </SimpleGrid>
        <Text size={"sm"} fw={600}>
          {t("daily.stats.distribution")}
        </Text>
        {stats.distribution.map((count, index) => (
          <Group key={index} className={"flex-nowrap gap-2"}>
            <Text size={"sm"} w={20}>
              {index + 1}
            </Text>
            <Progress
              className={"flex-grow"}
              value={(count / highest) * 100}
              color={index + 1 === highlight ? "brand" : "gray"}
              size={"lg"}
              aria-label={`${index + 1}: ${count}`}
            />
            <Text size={"sm"} w={24} className={"text-right"}>
              {count}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};

export { DailyStatsPanel };
