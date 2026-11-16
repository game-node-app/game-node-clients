import type { useTranslation } from "@repo/locales";
import { z } from "zod";

/** Limits accepted by `PUT /v1/recap/goals/:year` on the server. */
export const RECAP_GOAL_MIN_TARGET = 1;
export const RECAP_GOAL_MAX_TARGET = 999;

/** The suggested target adds this many games to the ones finished in the year. */
export const RECAP_GOAL_SUGGESTION_MARGIN = 4;

/** The goal shown in the Recap of `recapYear` is for the following year. */
export function getRecapGoalYear(recapYear: number): number {
  return recapYear + 1;
}

/**
 * The server only accepts goals for the current UTC year or the next one, so
 * the card is hidden for older Recaps.
 */
export function isRecapGoalYearAccepted(
  goalYear: number,
  now: Date = new Date(),
): boolean {
  const currentYear = now.getUTCFullYear();
  return goalYear === currentYear || goalYear === currentYear + 1;
}

/**
 * Initial selector value: the saved target or, without a goal, the games
 * finished in the Recap year plus four, kept within the server limits.
 */
export function getInitialRecapGoalTarget(
  savedTarget: number | null | undefined,
  finishedGames: number,
): number {
  if (savedTarget != null) return savedTarget;

  return Math.min(
    RECAP_GOAL_MAX_TARGET,
    Math.max(
      RECAP_GOAL_MIN_TARGET,
      Math.floor(finishedGames) + RECAP_GOAL_SUGGESTION_MARGIN,
    ),
  );
}

const createRecapGoalFormSchema = (
  t: ReturnType<typeof useTranslation<"common">>["t"],
) =>
  z.object({
    target: z
      .number({ message: t("recap.goal.validation.number") })
      .int(t("recap.goal.validation.integer"))
      .min(RECAP_GOAL_MIN_TARGET, t("recap.goal.validation.min"))
      .max(RECAP_GOAL_MAX_TARGET, t("recap.goal.validation.max")),
  });

export type RecapGoalFormValues = z.infer<
  ReturnType<typeof createRecapGoalFormSchema>
>;

export { createRecapGoalFormSchema };
