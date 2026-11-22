import type { AwardsPhase } from "#@/components/awards/types";
import {
  formatUtcDate,
  formatUtcDateRange,
  useFormatLocale,
} from "#@/components/events/util/format";
import { cn } from "#@/util";
import { IconCheck } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

export interface AwardsEventBandProps {
  year: number;
  phase: AwardsPhase;
  categoriesCount: number;
  nominationStartDate: string | null;
  nominationEndDate: string | null;
  votingStartDate: string;
  votingEndDate: string;
  resultsDate: string;
  className?: string;
}

type PhaseKey = "nominations" | "voting" | "results";
type StepState = "done" | "current" | "upcoming";

interface PhaseStep {
  key: PhaseKey;
  label: string;
  range: string | null;
  state: StepState;
}

/**
 * Where the event is on the Indicações → Votação → Resultado line: how many
 * steps are finished and which one is the "now" step (none between phases).
 */
function getProgress(phase: AwardsPhase): {
  completed: number;
  current: PhaseKey | null;
} {
  switch (phase) {
    case "nominations":
      return { completed: 0, current: "nominations" };
    case "nominations_closed":
      return { completed: 1, current: null };
    case "voting":
      return { completed: 1, current: "voting" };
    case "voting_closed":
      return { completed: 2, current: null };
    case "results":
      return { completed: 2, current: "results" };
    default:
      return { completed: 0, current: null };
  }
}

/**
 * Event band of the ballot frame (`event-band`, `5410:689`): eyebrow, title,
 * subtitle and the three-step phase timeline. Desktop only; the mobile frame
 * starts at the category.
 *
 * Legacy events without a nominations phase skip that step.
 */
export function AwardsEventBand({
  year,
  phase,
  categoriesCount,
  nominationStartDate,
  nominationEndDate,
  votingStartDate,
  votingEndDate,
  resultsDate,
  className,
}: AwardsEventBandProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();

  const { completed, current } = getProgress(phase);
  const hasNominations = !!(nominationStartDate || nominationEndDate);

  const draft: Omit<PhaseStep, "state">[] = [];

  if (hasNominations) {
    draft.push({
      key: "nominations",
      label: t("events.card.timeline.nominations"),
      range: formatUtcDateRange(nominationStartDate, nominationEndDate, locale),
    });
  }

  draft.push({
    key: "voting",
    label: t("events.card.timeline.voting"),
    range: formatUtcDateRange(votingStartDate, votingEndDate, locale),
  });

  draft.push({
    key: "results",
    label: t("events.card.timeline.results"),
    range: formatUtcDate(resultsDate, locale),
  });

  // `completed` counts the three canonical steps; without nominations the
  // first one does not exist, so one fewer step can be finished.
  const finished = hasNominations ? completed : Math.max(0, completed - 1);

  const steps: PhaseStep[] = draft.map((step, index) => ({
    ...step,
    state:
      step.key === current ? "current" : index < finished ? "done" : "upcoming",
  }));

  return (
    <div
      data-awards-event-band
      className={cn(
        "flex w-full flex-wrap items-end justify-between gap-x-10 gap-y-8",
        className,
      )}
    >
      <div
        className={
          "flex min-w-[360px] max-w-[720px] flex-1 basis-[360px] flex-col gap-4"
        }
      >
        <p
          className={
            "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-brand-3"
          }
        >
          {t("awards.ballot.band.eyebrow", { year })}
        </p>
        <h1
          className={
            "text-[40px] font-bold leading-[46px] tracking-[-0.4px] text-foreground"
          }
        >
          {t("awards.ballot.band.title", { year })}
        </h1>
        {categoriesCount > 0 && (
          <p className={"text-[20px] leading-normal text-nav-muted"}>
            {t("awards.ballot.band.subtitle", { count: categoriesCount })}
          </p>
        )}
      </div>
      <ol data-awards-phase-timeline className={"flex shrink-0"}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const range =
            step.state === "current" && step.range
              ? `${step.range} · ${t("awards.ballot.band.now")}`
              : step.range;

          return (
            <li
              key={step.key}
              data-step={step.key}
              data-state={step.state}
              className={"flex w-40 flex-col gap-3"}
            >
              <div className={"flex w-full items-center gap-2"}>
                {step.state === "done" ? (
                  <span
                    className={
                      "flex size-[22px] shrink-0 items-center justify-center rounded-full bg-state-played text-[var(--gn-state-played-filled-text)]"
                    }
                  >
                    <IconCheck size={14} stroke={3} aria-hidden={"true"} />
                  </span>
                ) : step.state === "current" ? (
                  <span
                    className={
                      "flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-brand"
                    }
                  >
                    <span className={"size-2 rounded-full bg-brand"} />
                  </span>
                ) : (
                  <span
                    className={
                      "size-[22px] shrink-0 rounded-full border-2 border-line-strong"
                    }
                  />
                )}
                {!isLast && (
                  <span
                    aria-hidden={"true"}
                    className={cn(
                      "h-0.5 min-w-px flex-1",
                      step.state === "done"
                        ? "bg-state-played"
                        : "bg-line-strong",
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "text-[16px] font-medium leading-normal",
                  step.state === "upcoming"
                    ? "text-nav-muted"
                    : "text-foreground",
                )}
              >
                {step.label}
              </p>
              {range && (
                <p
                  className={cn(
                    "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px]",
                    step.state === "current" ? "text-brand-3" : "text-dimmed-1",
                  )}
                >
                  {range}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
