import {
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { cn } from "#@/util";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

/** The three phases of the Awards shown by the cards' timeline. */
export type EventTimelineStep = "nominations" | "voting" | "results";

export interface EventPhaseTimelineProps {
  nominationStartDate: string | null;
  nominationEndDate: string | null;
  votingStartDate: string;
  votingEndDate: string;
  resultsDate: string;
  /** The step of the current phase; it paints the dot in the brand color. */
  active: EventTimelineStep;
  className?: string;
}

interface TimelineStep {
  key: EventTimelineStep;
  label: string;
  range: string | null;
}

/**
 * Indicações / Votação / Resultado timeline of the Awards cards (frame
 * `5444:2410`). Dates are UTC instants and are formatted in UTC, so the
 * 23:59:59Z end dates never move to the next day (design §13).
 *
 * Legacy events without a nominations phase skip that step instead of showing
 * an empty range.
 */
export function EventPhaseTimeline({
  nominationStartDate,
  nominationEndDate,
  votingStartDate,
  votingEndDate,
  resultsDate,
  active,
  className,
}: EventPhaseTimelineProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();

  const formatRange = (
    start: string | null,
    end: string | null,
  ): string | null => {
    const startLabel = formatUtcDate(start, locale);
    const endLabel = formatUtcDate(end, locale);

    if (startLabel && endLabel) {
      return `${startLabel} – ${endLabel}`;
    }

    return startLabel ?? endLabel;
  };

  const steps: TimelineStep[] = [];

  if (nominationStartDate || nominationEndDate) {
    steps.push({
      key: "nominations",
      label: t("events.card.timeline.nominations"),
      range: formatRange(nominationStartDate, nominationEndDate),
    });
  }

  steps.push({
    key: "voting",
    label: t("events.card.timeline.voting"),
    range: formatRange(votingStartDate, votingEndDate),
  });

  steps.push({
    key: "results",
    label: t("events.card.timeline.results"),
    range: formatUtcDate(resultsDate, locale),
  });

  const activeIndex = steps.findIndex((step) => step.key === active);

  return (
    <Group
      data-testid={"event-phase-timeline"}
      data-active={active}
      gap={0}
      align={"flex-start"}
      wrap={"nowrap"}
      className={cn("w-full", className)}
    >
      {steps.map((step, index) => {
        const isActive = step.key === active;
        const isDone = activeIndex >= 0 && index < activeIndex;

        return (
          <Stack
            key={step.key}
            gap={4}
            className={"min-w-0 flex-1"}
            data-step={step.key}
            data-active={isActive}
          >
            <Group gap={6} wrap={"nowrap"} className={"w-full"}>
              <Box
                aria-hidden={"true"}
                className={cn(
                  "size-2.5 shrink-0 rounded-full border",
                  isActive
                    ? "border-brand-5 bg-brand-5"
                    : isDone
                      ? "border-brand-5/60 bg-brand-5/60"
                      : "border-paper-4 bg-paper-4",
                )}
              />
              <Box
                aria-hidden={"true"}
                className={cn(
                  "h-px min-w-0 flex-1",
                  index === steps.length - 1
                    ? "bg-transparent"
                    : isDone
                      ? "bg-brand-5/40"
                      : "bg-paper-4",
                )}
              />
            </Group>
            <Text
              size={"xs"}
              fw={isActive ? 700 : 500}
              c={isActive ? undefined : "dimmed"}
              truncate
            >
              {step.label}
            </Text>
            {step.range && (
              <Text size={"xs"} c={"dimmed"} truncate>
                {step.range}
              </Text>
            )}
          </Stack>
        );
      })}
    </Group>
  );
}
