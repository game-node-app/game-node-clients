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
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
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

  return (
    <Paper
      id={"goal"}
      withBorder
      radius={"md"}
      p={"lg"}
      className={"w-full scroll-mt-4"}
    >
      <Stack gap={"sm"}>
        <Title order={2} size={"h3"}>
          {t("recap.goal.title", { year: goalYear })}
        </Title>

        {goalQuery.isPending ? (
          <Group gap={"xs"}>
            <Loader size={"sm"} />
            <Text size={"sm"} c={"dimmed"}>
              {t("recap.goal.loading")}
            </Text>
          </Group>
        ) : (
          <form onSubmit={onSave}>
            <Group align={"flex-end"} gap={"sm"} wrap={"wrap"}>
              <Controller
                control={control}
                name={"target"}
                render={({ field, fieldState }) => (
                  <NumberInput
                    label={t("recap.goal.targetLabel", { year: goalYear })}
                    min={RECAP_GOAL_MIN_TARGET}
                    max={RECAP_GOAL_MAX_TARGET}
                    allowDecimal={false}
                    clampBehavior={"strict"}
                    value={field.value}
                    onChange={(value) =>
                      field.onChange(
                        typeof value === "number" ? value : Number(value),
                      )
                    }
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    disabled={goalMutation.isPending}
                    w={{ base: "100%", xs: 220 }}
                  />
                )}
              />
              <Button type={"submit"} loading={goalMutation.isPending}>
                {t("recap.goal.save")}
              </Button>
            </Group>
          </form>
        )}

        {savedTarget == null && !goalQuery.isPending && (
          <Text size={"sm"} c={"dimmed"}>
            {t("recap.goal.suggestion", {
              target: suggestion,
              difference: suggestion - finishedGames,
              year,
            })}
          </Text>
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
          <Text size={"sm"} c={"teal"}>
            {t("recap.goal.saved")}
          </Text>
        )}
      </Stack>
    </Paper>
  );
};

export { RecapGoalCard };
