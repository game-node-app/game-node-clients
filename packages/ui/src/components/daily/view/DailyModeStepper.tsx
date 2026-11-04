import { Fragment } from "react";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useDailyTodayResults } from "#@/components/daily/hooks/useDailyTodayResults";
import {
  type DailyMode,
  DAILY_MODE_ICONS,
} from "#@/components/daily/util/dailyModes";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

interface Props {
  current: DailyMode;
}

/** Only finished modes and the current one get a color, so the current step stands out. */
const STATUS_COLORS: Record<string, string> = {
  won: "teal",
  lost: "red",
};

/**
 * Today's four modes in order, with each one's result; every step opens its mode.
 */
const DailyModeStepper = ({ current }: Props) => {
  const { t } = useTranslation();
  const { entries } = useDailyTodayResults();
  if (entries.length === 0) return null;

  return (
    <Group
      component={"nav"}
      aria-label={"GameNode Daily"}
      className={"justify-center items-start flex-nowrap gap-1"}
    >
      {entries.map(({ puzzle, result }, index) => {
        const isCurrent = puzzle.mode === current;
        const finished = result != undefined && result.status !== "in_progress";
        const previous = entries[index - 1]?.result;
        const color =
          (result && STATUS_COLORS[result.status]) ??
          (isCurrent ? "brand" : undefined);
        const status = finished
          ? t(
              result.status === "won"
                ? "daily.stepper.won"
                : "daily.status.lost",
            )
          : isCurrent
            ? t("daily.stepper.playing")
            : result
              ? t("daily.status.inProgress")
              : t("daily.stepper.toPlay");
        const ModeIcon = DAILY_MODE_ICONS[puzzle.mode];

        return (
          <Fragment key={puzzle.id}>
            {index > 0 && (
              <div
                aria-hidden
                className={cn(
                  "mt-[23px] h-0.5 w-4 sm:w-10 shrink-0",
                  previous && previous.status !== "in_progress"
                    ? "bg-dimmed"
                    : "bg-[var(--mantine-color-default-border)]",
                )}
              />
            )}
            <Link
              href={`/daily/${puzzle.mode}`}
              aria-current={isCurrent ? "step" : undefined}
              className={
                "flex w-[68px] sm:w-[84px] flex-col items-center gap-1.5 text-inherit no-underline"
              }
            >
              <ThemeIcon
                size={48}
                radius={"xl"}
                variant={"light"}
                color={color ?? "gray"}
                style={{
                  border: `${isCurrent ? 2 : 1.5}px solid ${
                    color
                      ? `var(--mantine-color-${color}-filled)`
                      : "var(--mantine-color-default-border)"
                  }`,
                }}
              >
                <ModeIcon size={20} />
              </ThemeIcon>
              <Text
                fz={12}
                lh={1.2}
                fw={isCurrent ? 700 : 500}
                c={isCurrent ? undefined : "dimmed"}
                className={"max-w-full truncate"}
              >
                {t(`daily.modes.${puzzle.mode}.name`)}
              </Text>
              <Text fz={11} lh={1.2} c={color ?? "dimmed"}>
                {status}
              </Text>
            </Link>
          </Fragment>
        );
      })}
    </Group>
  );
};

export { DailyModeStepper };
