import {
  formatUtcDate,
  formatUtcDateRange,
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
  /** The step of the current phase; its bar is painted in the brand color. */
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
 * `5444:2056`): three 4 px bars, the current (and finished) phases in brand.
 * Dates are UTC instants and are formatted in UTC, so the 23:59:59Z end dates
 * never move to the next day (design §13).
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

  const steps: TimelineStep[] = [];

  if (nominationStartDate || nominationEndDate) {
    steps.push({
      key: "nominations",
      label: t("events.card.timeline.nominations"),
      range: formatUtcDateRange(nominationStartDate, nominationEndDate, locale),
    });
  }

  steps.push({
    key: "voting",
    label: t("events.card.timeline.voting"),
    range: formatUtcDateRange(votingStartDate, votingEndDate, locale),
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
      gap={6}
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
            gap={8}
            className={"min-w-0 flex-1"}
            data-step={step.key}
            data-active={isActive}
          >
            <Box
              aria-hidden={"true"}
              className={cn(
                "h-1 w-full rounded-[2px]",
                isActive || isDone ? "bg-brand-5" : "bg-line-strong",
              )}
            />
            <Stack gap={2}>
              <Text
                fz={12}
                lh={"normal"}
                fw={isActive ? 600 : 500}
                truncate
                className={isActive ? "text-white" : "text-nav-muted"}
              >
                {step.label}
              </Text>
              {step.range && (
                <Text
                  fz={12}
                  lh={"normal"}
                  truncate
                  className={"text-dimmed-1"}
                >
                  {step.range}
                </Text>
              )}
            </Stack>
          </Stack>
        );
      })}
    </Group>
  );
}
