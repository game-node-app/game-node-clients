import {
  formatPercentage,
  formatPlaytimeHours,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import {
  getRecapMonthGrid,
  getUtcMonthName,
  getUtcWeekdayName,
  type RecapMonthCell,
} from "#@/components/recap/stories/recapStories";
import { RecapStoryFrame } from "#@/components/recap/stories/RecapStoryFrame";
import {
  at,
  displayStyle,
  monoStyle,
  RECAP_COLORS,
} from "#@/components/wrapped/card/recapCardTheme";
import { useTranslation } from "@repo/locales";

interface Props {
  recap: YearRecap;
  locale: string;
}

// theme-exempt: recap calendar artwork heatmap
const CELL_BACKGROUND: Record<RecapMonthCell["level"], string> = {
  0: "rgba(244, 239, 232, 0.06)",
  1: "rgba(241, 80, 37, 0.28)",
  2: "rgba(241, 80, 37, 0.48)",
  3: "rgba(241, 80, 37, 0.72)",
  4: RECAP_COLORS.brand,
};

const WEEKDAY_HEADER_HEIGHT = 34;
const CELL_SIZE = 112;
const CELL_GAP = 12;

function StatCard({ children }: { children: string }) {
  return (
    <div
      style={{
        width: 300,
        height: 176,
        borderRadius: 24,
        background: RECAP_COLORS.panel,
        padding: 24,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span style={displayStyle(44, RECAP_COLORS.cream, 600)}>{children}</span>
    </div>
  );
}

/**
 * Story 3 — "Março": the busiest month as a grid of UTC days, with the month's
 * hours, the longest streak and the top weekday (frame `5414:911`).
 */
export function RecapStoryCalendar({ recap, locale }: Props) {
  const { t } = useTranslation();
  const topMonth = recap.calendar?.topMonth;
  if (!topMonth) return null;

  const monthName = getUtcMonthName(recap.year, topMonth.month, locale);
  const grid = getRecapMonthGrid(
    recap.year,
    topMonth.month,
    recap.dailyPlaytimeSeconds,
  );
  if (!monthName || !grid) return null;

  const monthHours =
    formatPlaytimeHours(topMonth.playtimeSeconds, locale) ?? "0";
  const streak = recap.calendar?.longestStreak;
  const topWeekday = recap.calendar?.topWeekday;
  const weekdayName =
    topWeekday != null ? getUtcWeekdayName(topWeekday.weekday, locale) : null;
  const weekendShare =
    recap.calendar && recap.calendar.weekendShare > 0
      ? formatPercentage(recap.calendar.weekendShare, locale)
      : null;

  const weekdayHeaders = Array.from({ length: 7 }, (_, weekday) =>
    getUtcWeekdayName(weekday, locale, "short"),
  );
  const leadingCells = Array.from({ length: grid.firstWeekday }, (_, index) => (
    <div key={`leading-${index}`} />
  ));
  const gridTop = 720 + WEEKDAY_HEADER_HEIGHT + 24;

  return (
    <RecapStoryFrame
      storyId={"calendar"}
      eyebrow={t("recap.stories.calendar.eyebrow")}
    >
      <div style={at(64, 200, 952)}>
        <div style={displayStyle(106)}>
          {t("recap.stories.calendar.title", { month: monthName })}
        </div>
      </div>

      <div
        style={{
          ...at(64, 470, 952),
          display: "flex",
          gap: 26,
        }}
      >
        <StatCard>
          {t("recap.stories.calendar.monthHours", { hours: monthHours })}
        </StatCard>
        {streak && streak.days > 0 && (
          <StatCard>
            {t("recap.stories.calendar.streak", { days: streak.days })}
          </StatCard>
        )}
        {weekdayName && (
          <StatCard>
            {t("recap.stories.calendar.weekday", { weekday: weekdayName })}
          </StatCard>
        )}
      </div>

      <div style={at(91, 720, 898)}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
            gap: CELL_GAP,
            height: WEEKDAY_HEADER_HEIGHT,
            alignItems: "center",
          }}
        >
          {weekdayHeaders.map((name, index) => (
            <div
              key={index}
              style={{
                ...monoStyle(20, RECAP_COLORS.dim),
                textAlign: "center",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      <div style={at(91, gridTop, 898)}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
            gap: CELL_GAP,
          }}
        >
          {leadingCells}
          {grid.cells.map((cell) => (
            <div
              key={cell.day}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: 18,
                background: CELL_BACKGROUND[cell.level],
                padding: 12,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={monoStyle(
                  20,
                  cell.level >= 3 ? RECAP_COLORS.ink : RECAP_COLORS.muted,
                )}
              >
                {cell.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {weekendShare && (
        <div style={at(64, 1580, 952)}>
          <div style={displayStyle(40, RECAP_COLORS.muted, 600)}>
            {t("recap.stories.calendar.weekend", {
              percentage: weekendShare,
            })}
          </div>
        </div>
      )}
    </RecapStoryFrame>
  );
}
