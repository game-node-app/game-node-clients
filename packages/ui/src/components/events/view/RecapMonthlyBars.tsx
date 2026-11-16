import { cn } from "#@/util";
import { Box, Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapMonthlyBarsProps {
  /**
   * Playtime seconds per month, January first (`calendar.monthlyPlaytimeSeconds`).
   * `null`/missing is a Recap generated before the calendar existed: the card
   * omits the strip and keeps its other numbers.
   */
  values: number[] | null | undefined;
  className?: string;
}

/**
 * The 12-bar monthly playtime strip of the Retrospectiva card (frame
 * `5444:2410`). Zero months keep a baseline mark so the rhythm of the year is
 * still readable.
 */
export function RecapMonthlyBars({ values, className }: RecapMonthlyBarsProps) {
  const { t } = useTranslation();
  const months = (values ?? []).slice(0, 12);

  if (months.length === 0) {
    return null;
  }

  const max = Math.max(...months, 1);

  return (
    <Group
      data-testid={"recap-monthly-bars"}
      gap={3}
      align={"flex-end"}
      wrap={"nowrap"}
      role={"img"}
      aria-label={t("events.card.recap.monthlyLabel")}
      className={cn("h-12 w-full", className)}
    >
      {months.map((value, index) => {
        const ratio = Number.isFinite(value) && value > 0 ? value / max : 0;

        return (
          <Box
            key={index}
            aria-hidden={"true"}
            style={{
              height: ratio > 0 ? `${Math.max(8, ratio * 100)}%` : "3px",
            }}
            className={cn(
              "min-w-0 flex-1 rounded-t-sm",
              ratio > 0 ? "bg-brand-5/80" : "bg-paper-4",
            )}
          />
        );
      })}
    </Group>
  );
}
