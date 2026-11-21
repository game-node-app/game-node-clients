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
import { useEffect, useRef, useState } from "react";

const DATE_KEY = "YYYY-MM-DD";
const COLORS = [
  "color-mix(in srgb, var(--profile-accent, var(--gn-brand)) 30%, var(--gn-nav-raised))",
  "color-mix(in srgb, var(--profile-accent, var(--gn-brand)) 65%, var(--gn-nav-raised))",
  "var(--profile-accent, var(--gn-brand))",
  "color-mix(in srgb, var(--profile-accent, var(--gn-brand)) 55%, white)",
];

/** Empty cell fill: the same raised surface the lowest activity level blends into. */
const EMPTY_CELL_COLOR = "var(--gn-nav-raised)";
/** A cell is 16 viewBox units; below this scale (about 12px a cell) the grid scrolls instead of shrinking. */
const MIN_GRID_SCALE = 0.75;

const JournalHeatmap = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const { data: journal, isLoading, isError } = useJournalOverview(userId);
  const today = dayjs().startOf("day");
  const [period, setPeriod] = useState("rolling");
  const gridScrollRef = useRef<HTMLDivElement>(null);

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
  const gridWidth = weeks * 20 + 44;

  // On narrow screens the grid scrolls; start at the most recent weeks.
  useEffect(() => {
    const el = gridScrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [isLoading, isError, period, weeks]);

  const activitySummary = [
    t("profile.overview.activityTitle"),
    t(
      period === "rolling"
        ? "profile.overview.rollingTotal"
        : "profile.overview.yearTotal",
      { count: total, year: period },
    ),
    `${t("profile.overview.activeDays")}: ${counts.length.toLocaleString(language)}`,
    `${t("profile.overview.longestStreak")}: ${t("profile.overview.days", { count: longestStreak })}`,
  ].join(". ");

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
            {/* Cells keep a readable minimum size; narrower screens scroll sideways. The grid is
                a picture, so the summary label carries the numbers the hover tooltip shows. */}
            <div
              ref={gridScrollRef}
              role="region"
              tabIndex={0}
              aria-label={activitySummary}
              className="overflow-x-auto rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <div
                aria-hidden
                style={{
                  minWidth: `${Math.round(gridWidth * MIN_GRID_SCALE)}px`,
                }}
              >
                <Heatmap
                  renderRoot={(props) => (
                    <svg {...props} viewBox={`0 0 ${gridWidth} 165`} />
                  )}
                  className="h-auto w-full"
                  startDate={startKey}
                  endDate={endKey}
                  firstDayOfWeek={0}
                  data={data}
                  colors={COLORS}
                  domain={[1, Math.max(COLORS.length, ...counts)]}
                  style={{ "--heatmap-empty-rect-bg": EMPTY_CELL_COLOR }}
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
                    monthLabel: "text-[15px]",
                    weekdayLabel: "hidden sm:inline",
                  }}
                  getTooltipLabel={({ date, value }) =>
                    t("profile.overview.dayActivity", {
                      date: dateFormatter.format(new Date(date)),
                      count: value ?? 0,
                    })
                  }
                />
              </div>
            </div>
            <Group justify="space-between" gap="xs">
              <Text size="xs" c="dimmed">
                {t("profile.overview.activityHint")}
              </Text>
              <Group gap={5} aria-hidden>
                <Text size="xs" c="dimmed">
                  {t("profile.overview.less")}
                </Text>
                {[EMPTY_CELL_COLOR, ...COLORS].map((color) => (
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
