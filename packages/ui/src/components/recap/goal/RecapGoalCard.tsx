import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  createRecapGoalFormSchema,
  getInitialRecapGoalTarget,
  getRecapGoalYear,
  isRecapGoalYearAccepted,
  RECAP_GOAL_MAX_TARGET,
  RECAP_GOAL_MIN_TARGET,
  type RecapGoalFormValues,
} from "#@/components/recap/goal/recapGoal";
import { useRecapGoal } from "#@/components/recap/hooks/useRecapGoal";
import { useRecapGoalMutation } from "#@/components/recap/hooks/useRecapGoalMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  NumberInput,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

export interface RecapGoalCardProps {
  /** The Recap year shown on the page; the goal is for the following year. */
  year: number;
  /** Owner of the Recap. The card is hidden for another user's Recap. */
  userId: string;
  /** Games finished in `year`, from the loaded Recap; used for the suggestion. */
  finishedGames: number;
}

/**
 * "Goal for {year + 1}" block of the Recap. Only the signed-in owner sees it,
 * and only while the goal year is one the server accepts (current UTC year or
 * the next one). The anchor is `#goal`, which the goal reminder link opens.
 */
const RecapGoalCard = ({ year, userId, finishedGames }: RecapGoalCardProps) => {
  const { t } = useTranslation();
  const loggedUserId = useUserId();
  const goalYear = getRecapGoalYear(year);
  const canSeeGoal =
    !!loggedUserId &&
    loggedUserId === userId &&
    isRecapGoalYearAccepted(goalYear);

  // A visitor or an old Recap must not read the goal: passing no year disables
  // both the read and the mutation.
  const goalQuery = useRecapGoal(canSeeGoal ? goalYear : undefined);
  const goalMutation = useRecapGoalMutation(canSeeGoal ? goalYear : undefined);

  const schema = useMemo(() => createRecapGoalFormSchema(t), [t]);
  const savedTarget = goalQuery.data?.target ?? null;
  const suggestion = getInitialRecapGoalTarget(null, finishedGames);
  const initialTarget = getInitialRecapGoalTarget(savedTarget, finishedGames);

  const { control, handleSubmit, reset } = useForm<RecapGoalFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: { target: initialTarget },
  });

  useEffect(() => {
    reset({ target: initialTarget });
  }, [initialTarget, reset]);

  if (!canSeeGoal) return null;

  const onSave = handleSubmit((values) => {
    goalMutation.mutate(
      { target: values.target },
      // The previous saved goal stays on screen when the server refuses it.
      { onError: () => reset({ target: initialTarget }) },
    );
  });

  const progressText =
    goalQuery.data != null && savedTarget != null
      ? t("recap.goal.progress", {
          finished: goalQuery.data.finished,
          target: savedTarget,
        })
      : undefined;
  const finishedGamesCount = goalQuery.data?.finished;

  const headlineTarget = savedTarget ?? suggestion;

  return (
    <div
      id={"goal"}
      className={
        "flex w-full scroll-mt-4 flex-col gap-5 rounded-2xl border border-line bg-paper-0 p-5 md:p-8"
      }
    >
      <p
        className={
          "m-0 text-xs leading-none font-bold tracking-[0.06em] text-muted uppercase"
        }
      >
        {t("recap.goal.title", { year: goalYear })}
      </p>
      <h3 className={"m-0 text-2xl leading-8 font-medium text-foreground"}>
        {headlineTarget - finishedGames > 0
          ? t("recap.goal.suggestion", {
              target: headlineTarget,
              difference: headlineTarget - finishedGames,
              year,
            })
          : t("recap.goal.headline", {
              target: headlineTarget,
              year: goalYear,
            })}
      </h3>

      <p className={"m-0 text-base leading-normal text-muted"}>
        {t("recap.goal.reminder")}
      </p>

      {goalQuery.isPending ? (
        <Group gap={"xs"}>
          <Loader size={"sm"} />
          <Text size={"sm"} c={"dimmed"}>
            {t("recap.goal.loading")}
          </Text>
        </Group>
      ) : (
        <form onSubmit={onSave} className={"mt-auto"}>
          <div className={"flex flex-wrap items-end justify-between gap-3"}>
            <Controller
              control={control}
              name={"target"}
              render={({ field, fieldState }) => (
                <NumberInput
                  aria-label={t("recap.goal.targetLabel", { year: goalYear })}
                  min={RECAP_GOAL_MIN_TARGET}
                  max={RECAP_GOAL_MAX_TARGET}
                  allowDecimal={false}
                  clampBehavior={"strict"}
                  hideControls
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(
                      typeof value === "number" ? value : Number(value),
                    )
                  }
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  disabled={goalMutation.isPending}
                  w={156}
                  size={"md"}
                  radius={"md"}
                  styles={{
                    input: { textAlign: "center", fontWeight: 500 },
                    section: { pointerEvents: "all" },
                  }}
                  leftSection={
                    <ActionIcon
                      variant={"subtle"}
                      color={"gray"}
                      aria-label={t("recap.goal.decrease")}
                      disabled={
                        goalMutation.isPending ||
                        (field.value ?? 0) <= RECAP_GOAL_MIN_TARGET
                      }
                      onClick={() =>
                        field.onChange(
                          Math.max(
                            RECAP_GOAL_MIN_TARGET,
                            (field.value ?? 0) - 1,
                          ),
                        )
                      }
                    >
                      <IconMinus size={14} />
                    </ActionIcon>
                  }
                  rightSection={
                    <ActionIcon
                      variant={"subtle"}
                      color={"gray"}
                      aria-label={t("recap.goal.increase")}
                      disabled={
                        goalMutation.isPending ||
                        (field.value ?? 0) >= RECAP_GOAL_MAX_TARGET
                      }
                      onClick={() =>
                        field.onChange(
                          Math.min(
                            RECAP_GOAL_MAX_TARGET,
                            (field.value ?? 0) + 1,
                          ),
                        )
                      }
                    >
                      <IconPlus size={14} />
                    </ActionIcon>
                  }
                  leftSectionWidth={40}
                  rightSectionWidth={40}
                />
              )}
            />
            <Button
              type={"submit"}
              size={"md"}
              radius={"md"}
              variant={"default"}
              loading={goalMutation.isPending}
            >
              {t("recap.goal.save")}
            </Button>
          </div>
        </form>
      )}

      {progressText != null &&
        savedTarget != null &&
        finishedGamesCount != null && (
          <Stack gap={6}>
            <Text size={"sm"}>{progressText}</Text>
            <Progress
              value={Math.min(
                100,
                Math.round((finishedGamesCount / savedTarget) * 100),
              )}
              aria-label={progressText}
            />
          </Stack>
        )}

      {goalMutation.isSuccess && (
        <Text size={"sm"} className={"text-status-success-text"}>
          {t("recap.goal.saved")}
        </Text>
      )}
    </div>
  );
};

export { RecapGoalCard };
