import {
  formatPercentage,
  formatPlaytimeHours,
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import {
  RecapEyebrow,
  RecapHeading,
  RecapLead,
  RecapSection,
  RecapSurface,
} from "#@/components/recap/year/RecapSection";
import {
  buildCalendarGrid,
  formatUtcMonth,
  formatUtcWeekday,
  getCalendarDayLevel,
} from "#@/components/recap/year/util/recapYear";
import { useTranslation } from "@repo/locales";

export interface RecapCalendarSectionProps {
  year: number;
  recap: YearRecap;
}

/** Opacity of the brand colour per heat level 1–4 (design legend). */
const LEVEL_OPACITY = [0.3, 0.52, 0.76, 1] as const;

const CELL_GAP = 4;
const LABEL_COLUMN = "2.5rem";

const levelStyle = (level: number) =>
  level === 0
    ? { backgroundColor: "#1c1c1c" }
    : { backgroundColor: `rgba(241, 80, 37, ${LEVEL_OPACITY[level - 1]})` };

/**
 * "Playing calendar" (frame 5418:941): the top month sentence, a heatmap with
 * a square per UTC day (weeks as columns, Monday first) and the month, streak
 * and weekday facts. An old Recap has `calendar: null` and the whole section is
 * omitted; the heatmap also needs `dailyPlaytimeSeconds`. In a live Recap the
 * days after the last update are drawn hollow.
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
  const streak = calendar.longestStreak;
  const dayMonth = { day: "numeric", month: "short" } as const;
  const streakStart = streak
    ? formatUtcDate(streak.start, locale, dayMonth)
    : null;
  const streakEnd = streak ? formatUtcDate(streak.end, locale, dayMonth) : null;

  const grid = recap.dailyPlaytimeSeconds
    ? buildCalendarGrid(year, recap.dailyPlaytimeSeconds)
    : null;

  return (
    <RecapSection data-testid={"recap-calendar"} className={"pb-12 md:pb-24"}>
      <RecapEyebrow>{t("recap.page.calendar.title")}</RecapEyebrow>
      {topMonthLabel && topMonthHours && (
        <RecapHeading className={"mt-4 max-w-[1000px]"}>
          {t("recap.page.calendar.topMonth", {
            month: topMonthLabel,
            hours: topMonthHours,
          })}
        </RecapHeading>
      )}
      <RecapLead className={"mt-4 max-w-[680px]"}>
        {t("recap.page.calendar.description")}
      </RecapLead>

      {grid && (
        <Heatmap
          year={year}
          grid={grid}
          locale={locale}
          liveUntil={recap.isFinal ? null : recap.updatedAt}
          label={t("recap.page.calendar.gridLabel", { year })}
          less={t("recap.page.calendar.less")}
          more={t("recap.page.calendar.more")}
        />
      )}

      <div className={"mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"}>
        {calendar.topMonth && topMonthLabel && topMonthHours && (
          <CalendarFact
            value={t("events.card.recap.hours", { hours: topMonthHours })}
            text={t("recap.page.calendar.monthFact", { month: topMonthLabel })}
          />
        )}
        {streak && (
          <CalendarFact
            value={t("recap.page.calendar.streakValue", {
              days: streak.days,
            })}
            text={t("recap.page.calendar.streakFact", {
              start: streakStart ?? streak.start,
              end: streakEnd ?? streak.end,
            })}
          />
        )}
        {calendar.topWeekday && weekdayLabel && weekendShare && (
          <CalendarFact
            value={weekdayLabel}
            className={"capitalize"}
            text={t("recap.page.calendar.weekdayFact", {
              percent: weekendShare,
            })}
          />
        )}
      </div>
    </RecapSection>
  );
}

function Heatmap({
  year,
  grid,
  locale,
  liveUntil,
  label,
  less,
  more,
}: {
  year: number;
  grid: ReturnType<typeof buildCalendarGrid>;
  locale: string;
  /** Instant of the last update of a live Recap; later days are hollow. */
  liveUntil: string | null;
  label: string;
  less: string;
  more: string;
}) {
  const maxSeconds = Math.max(0, ...grid.days.map((day) => day.seconds));
  // The server's weekday is 0 = Sunday; the design starts the rows on Monday.
  const mondayOffset = (grid.offset + 6) % 7;
  const weeks = Math.ceil((mondayOffset + grid.days.length) / 7);
  const lastPlayedDate = liveUntil
    ? new Date(liveUntil).toISOString().slice(0, 10)
    : null;

  const monthLabels = Array.from({ length: 12 }, (_, month) => {
    const dayIndex = grid.days.findIndex(
      (day) => day.date === `${year}-${String(month + 1).padStart(2, "0")}-01`,
    );

    return {
      month,
      week: Math.floor((mondayOffset + Math.max(0, dayIndex)) / 7),
      name: (
        formatUtcDate(new Date(Date.UTC(year, month, 1)), locale, {
          month: "short",
        }) ?? ""
      ).replace(/\.$/, ""),
    };
  });
  // 2024-01-01 is a Monday: rows 0, 2, 4 and 6 are Mon, Wed, Fri and Sun.
  const weekdayLabels = [0, 2, 4, 6].map((row) => ({
    row,
    name: (
      formatUtcDate(new Date(Date.UTC(2024, 0, 1 + row)), locale, {
        weekday: "short",
      }) ?? ""
    ).replace(/\.$/, ""),
  }));

  return (
    <div className={"mt-10 md:mt-14"}>
      <div className={"overflow-x-auto pb-1"}>
        <div
          data-testid={"recap-calendar-grid"}
          role={"img"}
          aria-label={label}
          className={"grid min-w-[760px] items-center"}
          style={{
            gridTemplateColumns: `${LABEL_COLUMN} repeat(${weeks}, minmax(0, 1fr))`,
            gridTemplateRows: "auto repeat(7, auto)",
            columnGap: CELL_GAP,
            rowGap: CELL_GAP,
          }}
        >
          {monthLabels.map((month) => (
            <span
              key={`month-${month.month}`}
              aria-hidden
              className={
                "pb-2 text-xs leading-none font-bold tracking-[0.06em] whitespace-nowrap text-[#808080] uppercase"
              }
              style={{ gridRow: 1, gridColumn: month.week + 2 }}
            >
              {month.name}
            </span>
          ))}
          {weekdayLabels.map((weekday) => (
            <span
              key={`weekday-${weekday.row}`}
              aria-hidden
              className={
                "text-xs leading-none font-bold tracking-[0.06em] text-[#808080] uppercase"
              }
              style={{ gridRow: weekday.row + 2, gridColumn: 1 }}
            >
              {weekday.name}
            </span>
          ))}
          {grid.days.map((day) => {
            const level = getCalendarDayLevel(day.seconds, maxSeconds);
            const upcoming =
              lastPlayedDate !== null && day.date > lastPlayedDate;

            return (
              <div
                key={day.index}
                data-recap-day={day.index}
                data-utc-date={day.date}
                data-weekday={day.weekday}
                data-level={level}
                data-upcoming={upcoming || undefined}
                title={
                  formatUtcDate(day.date, locale, {
                    day: "numeric",
                    month: "short",
                  }) ?? undefined
                }
                className={
                  upcoming
                    ? "aspect-square rounded border border-[#262626]"
                    : "aspect-square rounded"
                }
                style={{
                  gridRow: ((day.weekday + 6) % 7) + 2,
                  gridColumn: Math.floor((mondayOffset + day.index) / 7) + 2,
                  ...(upcoming ? undefined : levelStyle(level)),
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        aria-hidden
        className={
          "mt-3 flex items-center justify-end gap-1.5 text-sm text-[#808080]"
        }
      >
        <span>{less}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={"size-3.5 rounded-[3px]"}
            style={levelStyle(level)}
          />
        ))}
        <span>{more}</span>
      </div>
    </div>
  );
}

function CalendarFact({
  value,
  text,
  className,
}: {
  value: string;
  text: string;
  className?: string;
}) {
  return (
    <RecapSurface className={"flex flex-col gap-3 md:p-7"}>
      <span
        className={`text-4xl leading-[46px] font-bold tracking-[-0.01em] text-white md:text-[40px] ${className ?? ""}`}
      >
        {value}
      </span>
      <span className={"text-base leading-normal text-[#adadad]"}>{text}</span>
    </RecapSurface>
  );
}
