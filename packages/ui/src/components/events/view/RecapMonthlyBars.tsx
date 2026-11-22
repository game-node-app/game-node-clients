import { useFormatLocale } from "#@/components/events/util/format";
import { cn } from "#@/util";
import { Box, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapMonthlyBarsProps {
  /**
   * Playtime seconds per month, January first (`calendar.monthlyPlaytimeSeconds`).
   * `null`/missing is a Recap generated before the calendar existed: the card
   * omits the strip and keeps its other numbers.
   */
  values: number[] | null | undefined;
  /**
   * Recap year. When it is the current year, the current month is highlighted
   * and the months still to come are drawn as dashed placeholders.
   */
  year?: number | null;
  /** Fills the card width instead of the 196 px design cap (mobile card). */
  stretch?: boolean;
  className?: string;
}

const MONTHS = 12;
/** Tallest bar of the strip (frame `5444:2138`); the strip is 96 px with the letters. */
const MAX_BAR_HEIGHT = 76;

/**
 * The 12-column monthly playtime strip of the Retrospectiva card (frame
 * `5444:2138`): brand bars scaled to the busiest month, a month initial under
 * each one, the current month in white and the future months dashed.
 */
export function RecapMonthlyBars({
  values,
  year,
  stretch = false,
  className,
}: RecapMonthlyBarsProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const source = (values ?? []).slice(0, MONTHS);

  if (source.length === 0) {
    return null;
  }

  const months = Array.from(
    { length: MONTHS },
    (_, index) => source[index] ?? 0,
  );
  const max = Math.max(...months, 1);
  const today = new Date();
  const currentMonth =
    year != null && year === today.getFullYear() ? today.getMonth() : null;
  const initials = new Intl.DateTimeFormat(locale, {
    month: "narrow",
    timeZone: "UTC",
  });

  return (
    <div
      data-testid={"recap-monthly-bars"}
      role={"img"}
      aria-label={t("events.card.recap.monthlyLabel")}
      className={cn(
        "grid w-full grid-cols-12",
        stretch ? "gap-1.5" : "max-w-[196px] gap-1",
        className,
      )}
    >
      {months.map((value, index) => {
        const isFuture = currentMonth != null && index > currentMonth;
        const isCurrent = index === currentMonth;
        const ratio = Number.isFinite(value) && value > 0 ? value / max : 0;

        return (
          <div key={index} aria-hidden={"true"} className={"min-w-0"}>
            <div className={"flex h-20 items-end"}>
              <Box
                style={{
                  height: isFuture
                    ? MAX_BAR_HEIGHT
                    : ratio > 0
                      ? Math.max(4, ratio * MAX_BAR_HEIGHT)
                      : 3,
                }}
                className={cn(
                  "w-full rounded-[3px]",
                  isFuture
                    ? "border border-dashed border-line-strong"
                    : ratio > 0
                      ? "bg-brand-5"
                      : "bg-line-strong",
                )}
              />
            </div>
            <Text
              fz={10}
              lh={"12px"}
              ta={"center"}
              fw={isCurrent ? 700 : 500}
              className={cn(
                "mt-1",
                isCurrent ? "text-foreground" : "text-dimmed-1",
              )}
            >
              {initials.format(new Date(Date.UTC(2000, index, 1)))}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
