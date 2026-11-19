import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview";
import { Heatmap } from "@mantine/charts";
import {
  Box,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import dayjs from "dayjs";
import { useState } from "react";

const DATE_KEY = "YYYY-MM-DD";
const COLORS = [
  "color-mix(in srgb, var(--profile-accent, #f15025) 30%, #222)",
  "color-mix(in srgb, var(--profile-accent, #f15025) 65%, #222)",
  "var(--profile-accent, #f15025)",
  "color-mix(in srgb, var(--profile-accent, #f15025) 55%, white)",
];

const JournalHeatmap = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const { data: journal, isLoading, isError } = useJournalOverview(userId);
  const today = dayjs().startOf("day");
  const [period, setPeriod] = useState("rolling");

  const start =
    period === "rolling"
      ? today.subtract(1, "year").add(1, "day")
      : today.year(Number(period)).startOf("year");
  const end = period === "rolling" ? today : start.endOf("year").startOf("day");
  const startKey = start.format(DATE_KEY);
  const endKey = end.format(DATE_KEY);
  const data: Record<string, number> = {};
  for (const { year, months } of journal?.years ?? []) {
    if (year < start.year() || year > end.year()) continue;

    for (const { month, days } of months) {
      for (const { day, entries } of days) {
        const date = new Date(Date.UTC(year, month, day))
          .toISOString()
          .slice(0, 10);
        if (date >= startKey && date <= endKey && entries.length) {
          data[date] = entries.length;
        }
      }
    }
  }

  let longestStreak = 0;
  let streak = 0;
  let streakThroughYesterday = 0;
  for (let date = start; !date.isAfter(end); date = date.add(1, "day")) {
    if (date.isSame(end, "day")) streakThroughYesterday = streak;
    streak = data[date.format(DATE_KEY)] ? streak + 1 : 0;
    longestStreak = Math.max(longestStreak, streak);
  }

  const counts = Object.values(data);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const availableYears = (journal?.years ?? [])
    .filter(({ months }) =>
      months.some(({ days }) => days.some(({ entries }) => entries.length)),
    )
    .map(({ year }) => year)
    .sort((a, b) => b - a);
  const dateFormatter = new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const monthFormatter = new Intl.DateTimeFormat(language, {
    month: "short",
    timeZone: "UTC",
  });
  const weekdayFormatter = new Intl.DateTimeFormat(language, {
    weekday: "short",
    timeZone: "UTC",
  });
  const weeks = Math.ceil((start.day() + end.diff(start, "day") + 1) / 7);

  return (
    <Paper
      component="section"
      withBorder
      radius="lg"
      p={{ base: "md", sm: "xl" }}
      className="min-w-0 bg-body"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="xs">
          <Stack gap={2}>
            <Title order={2} size="h4">
              {t("profile.overview.activityTitle")}
            </Title>
            {!isLoading && !isError && (
              <Text size="sm" c="dimmed">
                {t(
                  period === "rolling"
                    ? "profile.overview.rollingTotal"
                    : "profile.overview.yearTotal",
                  {
                    count: total,
                    year: period,
                  },
                )}
              </Text>
            )}
          </Stack>
          <SegmentedControl
            size="xs"
            aria-label={t("profile.overview.activityPeriod")}
            value={period}
            onChange={setPeriod}
            data={[
              { value: "rolling", label: t("profile.overview.lastYear") },
              ...availableYears.map((year) => ({
                value: String(year),
                label: String(year),
              })),
            ]}
            classNames={{
              root: "bg-transparent",
              indicator:
                "bg-[var(--profile-accent-soft,var(--mantine-color-brand-light))]",
            }}
          />
        </Group>
        {isLoading ? (
          <CenteredLoading />
        ) : isError ? (
          <Text size="sm" c="dimmed">
            {t("profile.messages.fetchFailed")}
          </Text>
        ) : (
          <>
            <Group gap="lg">
              {[
                {
                  value:
                    period === "rolling"
                      ? t("profile.overview.days", {
                          count: streak || streakThroughYesterday,
                        })
                      : undefined,
                  label: t("profile.overview.currentStreak"),
                },
                {
                  value: t("profile.overview.days", { count: longestStreak }),
                  label: t("profile.overview.longestStreak"),
                },
                {
                  value: counts.length.toLocaleString(language),
                  label: t("profile.overview.activeDays"),
                },
              ].map(
                ({ value, label }) =>
                  value !== undefined && (
                    <Stack key={label} gap={2}>
                      <Text
                        fw={700}
                        className="text-xl leading-none tracking-tight sm:text-2xl"
                      >
                        {value}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {label}
                      </Text>
                    </Stack>
                  ),
              )}
            </Group>
            <Heatmap
              aria-label={t("profile.overview.activityTitle")}
              role="img"
              renderRoot={(props) => (
                <svg {...props} viewBox={`0 0 ${weeks * 20 + 44} 165`} />
              )}
              className="h-auto w-full"
              startDate={startKey}
              endDate={endKey}
              firstDayOfWeek={0}
              data={data}
              colors={COLORS}
              domain={[1, Math.max(COLORS.length, ...counts)]}
              style={{ "--heatmap-empty-rect-bg": "#222" }}
              withOutsideDates={false}
              withTooltip
              withMonthLabels
              withWeekdayLabels
              monthLabels={Array.from({ length: 12 }, (_, month) =>
                monthFormatter.format(Date.UTC(2024, month, 1)),
              )}
              weekdayLabels={Array.from({ length: 7 }, (_, day) =>
                [1, 3, 5].includes(day)
                  ? weekdayFormatter.format(Date.UTC(2024, 0, day + 7))
                  : "",
              )}
              weekdaysLabelsWidth={40}
              monthsLabelsHeight={21}
              rectSize={16}
              gap={4}
              rectRadius={3}
              classNames={{
                monthLabel:
                  "text-[26px] [&:nth-of-type(even)]:hidden sm:text-xs sm:[&:nth-of-type(even)]:inline",
                weekdayLabel: "hidden sm:inline",
              }}
              getTooltipLabel={({ date, value }) =>
                t("profile.overview.dayActivity", {
                  date: dateFormatter.format(new Date(date)),
                  count: value ?? 0,
                })
              }
            />
            <Group justify="space-between" gap="xs">
              <Text size="xs" c="dimmed">
                {t("profile.overview.activityHint")}
              </Text>
              <Group gap={5} aria-hidden>
                <Text size="xs" c="dimmed">
                  {t("profile.overview.less")}
                </Text>
                {["#222", ...COLORS].map((color) => (
                  <Box
                    key={color}
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <Text size="xs" c="dimmed">
                  {t("profile.overview.more")}
                </Text>
              </Group>
            </Group>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export { JournalHeatmap };
