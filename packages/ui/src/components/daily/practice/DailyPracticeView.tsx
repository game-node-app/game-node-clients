import { Button, Skeleton, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconClockPause, IconRefresh, IconTool } from "@tabler/icons-react";
import { ApiError } from "@repo/wrapper/server";
import { ErrorState } from "#@/components/general/ErrorState";
import type { DailyPracticeMode } from "#@/components/daily/practice/DailyPracticeSection";
import { useDailyPractice } from "#@/components/daily/practice/useDailyPractice";
import { DailyBackToHubButton } from "#@/components/daily/view/DailyBackToHubButton";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { DailyHowToPlayModal } from "#@/components/daily/view/DailyHowToPlayModal";
import { DailyPlayBoard } from "#@/components/daily/view/DailyPlayBoard";
import { DailyPlayHeader } from "#@/components/daily/view/DailyPlayHeader";
import { Link } from "#@/util/link";

interface Props {
  mode: DailyPracticeMode;
}

/** Statuses with their own message; anything else is a plain fetch error. */
const PRACTICE_ERRORS = {
  429: { key: "rateLimited", icon: IconClockPause },
  503: { key: "unavailable", icon: IconTool },
} as const;

/**
 * An unlimited Cover or Specs round: same board as the daily, a new round on
 * "Play again", and nothing counted towards stats or the ranking.
 */
const DailyPracticeView = ({ mode }: Props) => {
  const { t } = useTranslation();
  const practice = useDailyPractice(mode);
  const [howToPlayOpened, howToPlay] = useDisclosure(false);
  const { data, error } = practice;

  if (practice.isError) {
    const known =
      error instanceof ApiError
        ? PRACTICE_ERRORS[error.status as keyof typeof PRACTICE_ERRORS]
        : undefined;
    if (!known) {
      return (
        <DailyErrorState
          onRetry={() => practice.refetch()}
          retrying={practice.isFetching}
          backHref={"/daily"}
          backLabel={t("daily.result.backToHub")}
        />
      );
    }
    return (
      <ErrorState
        icon={known.icon}
        color={"gray"}
        title={t(`daily.practice.${known.key}.title`)}
        description={t(`daily.practice.${known.key}.description`)}
        actions={
          <>
            <Button
              leftSection={<IconRefresh size={18} />}
              loading={practice.isFetching}
              onClick={() => practice.refetch()}
            >
              {t("actions.retry")}
            </Button>
            <Button component={Link} href={"/daily"} variant={"default"}>
              {t("daily.result.backToHub")}
            </Button>
          </>
        }
      />
    );
  }
  if (!data) {
    return (
      <Stack className={"w-full max-w-[640px] mx-auto mb-8 items-center"}>
        <Skeleton h={48} />
        <Skeleton h={72} maw={400} />
        <Skeleton h={400} maw={300} />
      </Stack>
    );
  }

  const specs = mode === "specs";

  return (
    <Stack
      className={"w-full mx-auto mb-8 pt-2 sm:pt-6 items-center gap-6"}
      maw={specs ? 1080 : 760}
    >
      <DailyPlayHeader
        title={t(`daily.practice.${mode}.title`)}
        subtitle={t("daily.practice.noLimit")}
        onHowToPlay={howToPlay.open}
      />
      <Stack className={"w-full gap-5"} maw={specs ? undefined : 640}>
        <DailyPlayBoard
          // A new round starts with fresh hint images.
          key={data.roundId}
          play={data}
          onGuess={practice.guess}
          onSkip={practice.skip}
          onUseHint={practice.useHint}
          submitting={practice.isSubmitting}
        >
          <Button
            size={"lg"}
            fz={14}
            fullWidth
            leftSection={<IconRefresh size={16} />}
            loading={practice.isRestarting}
            onClick={practice.restart}
          >
            {t("daily.practice.playAgain")}
          </Button>
        </DailyPlayBoard>
        <DailyBackToHubButton />
      </Stack>
      <DailyHowToPlayModal opened={howToPlayOpened} onClose={howToPlay.close} />
    </Stack>
  );
};

export { DailyPracticeView };
