import { Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { useDailyResults } from "#@/components/daily/hooks/useDailyResults";
import {
  computeDailyStats,
  toSaoPauloDate,
} from "#@/components/daily/util/computeDailyStats";
import { cn } from "#@/util/cn";

interface Props {
  mode: DailyMode;
  maxAttempts: number;
  /** Today's bucket, highlighted: the attempts of a win, or "lost". */
  highlight?: number | "lost";
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
  const losses = stats.played - stats.wins;
  const rows = [
    ...stats.distribution.map((count, index) => ({
      label: `${index + 1}`,
      count,
      today: highlight === index + 1,
      lost: false,
    })),
    { label: "X", count: losses, today: highlight === "lost", lost: true },
  ];
  const highest = Math.max(...rows.map((row) => row.count), 1);
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
    <Paper withBorder radius={14} p={20} className={"w-full !bg-paper-8"}>
      <Stack className={"gap-3"}>
        <Text fz={13} fw={600} c={"dimmed"} tt={"uppercase"} lts={"0.08em"}>
          {t("daily.stats.titleMode", {
            mode: t(`daily.modes.${mode}.name`),
          })}
        </Text>
        <SimpleGrid cols={4} spacing={8}>
          {numbers.map(([label, value]) => (
            <Stack
              key={label}
              className={"gap-0.5 items-center rounded-[10px] bg-body p-3"}
            >
              <Text fz={22} fw={700} lh={1.2}>
                {value}
              </Text>
              <Text fz={12} c={"dimmed"} ta={"center"} lh={1.2}>
                {label}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
        <Stack className={"gap-2.5"} aria-label={t("daily.stats.distribution")}>
          {rows.map((row) => (
            <Group key={row.label} className={"flex-nowrap gap-2"}>
              <Text fz={13} fw={600} w={16} c={row.lost ? "red" : "dimmed"}>
                {row.label}
              </Text>
              <div className={"flex-1"}>
                <div
                  className={cn(
                    "flex h-[22px] min-w-[28px] items-center justify-end rounded px-2 text-xs font-bold",
                    row.today
                      ? "bg-brand-5 text-black"
                      : row.lost
                        ? "bg-[var(--mantine-color-red-light)] text-[var(--mantine-color-red-light-color)]"
                        : "bg-paper-4",
                  )}
                  style={{ width: `${(row.count / highest) * 100}%` }}
                >
                  {row.count}
                </div>
              </div>
            </Group>
          ))}
        </Stack>
        <Text fz={12} c={"dimmed"}>
          {t("daily.stats.lostNote", { lost: losses, played: stats.played })}
        </Text>
      </Stack>
    </Paper>
  );
};

export { DailyStatsPanel };
