import {
  formatNumber,
  formatPercentage,
  formatPlaytimeHours,
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import {
  buildCalendarGrid,
  formatUtcMonth,
  formatUtcWeekday,
  getCalendarDayLevel,
} from "#@/components/recap/year/util/recapYear";
import { Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapCalendarSectionProps {
  year: number;
  recap: YearRecap;
}

/**
 * "Playing calendar" (frame 5418:941): a square per UTC day of the year, the
 * top month sentence and the month/streak/weekday cards. An old Recap has
 * `calendar: null` and the whole section is omitted; the grid also needs
 * `dailyPlaytimeSeconds`.
 */
export function RecapCalendarSection({
  year,
  recap,
}: RecapCalendarSectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const calendar = recap.calendar;

  if (!calendar) return null;

  const topMonthLabel = calendar.topMonth
    ? formatUtcMonth(year, calendar.topMonth.month, locale)
    : null;
  const topMonthHours = calendar.topMonth
    ? formatPlaytimeHours(calendar.topMonth.playtimeSeconds, locale)
    : null;
  const weekdayLabel = calendar.topWeekday
    ? formatUtcWeekday(calendar.topWeekday.weekday, locale)
    : null;
  const weekendShare = formatPercentage(calendar.weekendShare, locale);

  const grid = recap.dailyPlaytimeSeconds
    ? buildCalendarGrid(year, recap.dailyPlaytimeSeconds)
    : null;
  const maxSeconds = grid
    ? Math.max(0, ...grid.days.map((day) => day.seconds))
    : 0;

  return (
    <Paper
      data-testid={"recap-calendar"}
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={"bg-paper-8"}
    >
      <Stack gap={"lg"}>
        <Stack gap={4}>
          <Title order={2} size={"h2"}>
            {t("recap.page.calendar.title")}
          </Title>
          <Text size={"sm"} c={"dimmed"}>
            {t("recap.page.calendar.description")}
          </Text>
          {topMonthLabel && topMonthHours && (
            <Text size={"lg"} fw={700}>
              {t("recap.page.calendar.topMonth", {
                month: topMonthLabel,
                hours: topMonthHours,
              })}
            </Text>
          )}
        </Stack>

        {grid && (
          <div
            data-testid={"recap-calendar-grid"}
            role={"img"}
            aria-label={t("recap.page.calendar.gridLabel", { year })}
            className={"grid w-full gap-[2px]"}
            style={{
              gridTemplateColumns: `repeat(${grid.weeks}, minmax(0, 1fr))`,
              gridTemplateRows: "repeat(7, minmax(0, 1fr))",
              gridAutoFlow: "column",
            }}
          >
            {Array.from({ length: grid.offset }, (_, index) => (
              <div key={`empty-${index}`} aria-hidden />
            ))}
            {grid.days.map((day) => {
              const level = getCalendarDayLevel(day.seconds, maxSeconds);

              return (
                <div
                  key={day.index}
                  data-recap-day={day.index}
                  data-utc-date={day.date}
                  data-weekday={day.weekday}
                  data-level={level}
                  title={
                    formatUtcDate(day.date, locale, {
                      day: "numeric",
                      month: "short",
                    }) ?? undefined
                  }
                  className={"aspect-square rounded-[2px]"}
                  style={{
                    backgroundColor:
                      level === 0
                        ? "rgba(255, 255, 255, 0.05)"
                        : `rgba(241, 80, 37, ${0.2 + level * 0.2})`,
                  }}
                />
              );
            })}
          </div>
        )}

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={"sm"}>
          {calendar.topMonth && topMonthLabel && topMonthHours && (
            <CalendarCard
              value={t("recap.page.calendar.monthCard", {
                hours: topMonthHours,
                month: topMonthLabel,
              })}
            />
          )}
          {calendar.longestStreak && (
            <CalendarCard
              value={t("recap.page.calendar.streak", {
                days: formatNumber(calendar.longestStreak.days, locale) ?? "0",
              })}
            />
          )}
          {calendar.topWeekday && weekdayLabel && weekendShare && (
            <CalendarCard
              value={t("recap.page.calendar.weekday", {
                weekday: weekdayLabel,
                percent: weekendShare,
              })}
            />
          )}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}

function CalendarCard({ value }: { value: string }) {
  return (
    <div className={"rounded-md bg-paper-4 px-4 py-3"}>
      <Text size={"sm"}>{value}</Text>
    </div>
  );
}
