import { Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DAILY_RESULT_STYLES } from "#@/components/daily/util/dailyModes";
import { toDailyAttemptSlots } from "#@/components/daily/util/toDailyAttemptSlots";
import { cn } from "#@/util/cn";

interface Props {
  /** Server guess results, in order. */
  results: string[];
  maxAttempts: number;
  hintUsed?: boolean;
  /** Outlines the next free slot. */
  inProgress?: boolean;
  className?: string;
}

/**
 * The attempts as a row of segments, like the grid in the share text.
 */
const DailyAttemptsTrack = ({
  results,
  maxAttempts,
  hintUsed,
  inProgress,
  className,
}: Props) => {
  const { t } = useTranslation();
  const slots = toDailyAttemptSlots(results, maxAttempts, hintUsed);
  const used = slots.filter((slot) => slot !== "empty").length;
  const current = inProgress ? slots.indexOf("empty") : -1;

  return (
    <Group
      role={"img"}
      aria-label={t("daily.attempts", { attempts: used, max: maxAttempts })}
      className={cn("gap-1.5 flex-nowrap w-full", className)}
    >
      {slots.map((slot, index) => (
        <div
          key={index}
          className={cn("h-2 flex-1 rounded-sm bg-paper-4", {
            "border border-brand-5": index === current,
          })}
          style={
            slot === "empty"
              ? undefined
              : {
                  background: `var(--mantine-color-${slot === "hint" ? "blue" : DAILY_RESULT_STYLES[slot].color}-filled)`,
                }
          }
        />
      ))}
    </Group>
  );
};

export { DailyAttemptsTrack };
