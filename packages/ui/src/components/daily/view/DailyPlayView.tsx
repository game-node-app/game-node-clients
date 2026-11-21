import { Button, Skeleton, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconArrowRight, IconPuzzleOff } from "@tabler/icons-react";
import { ErrorState } from "#@/components/general/ErrorState";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyPlay } from "#@/components/daily/hooks/useDailyPlay";
import { useDailyTodayResults } from "#@/components/daily/hooks/useDailyTodayResults";
import { DailyStatsLine } from "#@/components/daily/result/DailyStatsLine";
import { DailyStatsPanel } from "#@/components/daily/result/DailyStatsPanel";
import { DailySharePanel } from "#@/components/daily/result/DailyResultPanel";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { DailyHowToPlayModal } from "#@/components/daily/view/DailyHowToPlayModal";
import { DailyRankingResultCard } from "#@/components/daily/ranking/DailyRankingResultCard";
import { DailyPlayBoard } from "#@/components/daily/view/DailyPlayBoard";
import { DailyModeStepper } from "#@/components/daily/view/DailyModeStepper";
import { DailyPlayHeader } from "#@/components/daily/view/DailyPlayHeader";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { Link } from "#@/util/link";

interface Props {
  mode: DailyMode;
  /** Defaults to today's puzzle for the mode. */
  puzzleId?: number;
}

const DailyPlayView = ({ mode, puzzleId }: Props) => {
  const { t } = useTranslation();
  useDailyImportOnLogin();
  const { todayQuery, entries } = useDailyTodayResults();
  const [howToPlayOpened, howToPlay] = useDisclosure(false);
  const id =
    puzzleId ??
    todayQuery.data?.puzzles.find((puzzle) => puzzle.mode === mode)?.id;
  const play = useDailyPlay(id);
  const { data } = play;

  const missingPuzzle = puzzleId == undefined && todayQuery.isSuccess && !id;
  if (play.isError || (puzzleId == undefined && todayQuery.isError)) {
    return (
      <DailyErrorState
        // The play query is disabled until today's puzzle is known, so retry the failing one.
        onRetry={() =>
          todayQuery.isError ? todayQuery.refetch() : play.refetch()
        }
        retrying={todayQuery.isFetching || play.isFetching}
        backHref={"/daily"}
        backLabel={t("actions.goBack")}
      />
    );
  }
  if (missingPuzzle) {
    return (
      <ErrorState
        icon={IconPuzzleOff}
        color={"gray"}
        title={t("daily.noPuzzle")}
        actions={
          <Button component={Link} href={"/daily"} variant={"default"}>
            {t("actions.goBack")}
          </Button>
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

  const specs = data.mode === "specs";
  const isToday = puzzleId == undefined;

  // The next of today's modes still to finish, after this one.
  const position = entries.findIndex(({ puzzle }) => puzzle.mode === mode);
  const next = [
    ...entries.slice(position + 1),
    ...entries.slice(0, position),
  ].find(
    ({ result }) => result == undefined || result.status === "in_progress",
  );

  return (
    <Stack
      className={"w-full mx-auto mb-8 pt-2 sm:pt-6 items-center gap-6"}
      maw={specs ? 1080 : 760}
    >
      <DailyPlayHeader
        title={t("daily.title")}
        subtitle={t(`daily.modes.${data.mode}.name`)}
        countdown={
          todayQuery.data && {
            endsAt: todayQuery.data.nextResetAt,
            label: t("daily.nextIn"),
          }
        }
        archiveHref={`/daily/${data.mode}/archive`}
        onHowToPlay={howToPlay.open}
      />
      {isToday && <DailyModeStepper current={data.mode} />}

      <Stack className={"w-full gap-5"} maw={specs ? undefined : 640}>
        <DailyStatsLine number={data.number} community={data.community} />
        <DailyPlayBoard
          play={data}
          onGuess={play.guess}
          onSkip={play.skip}
          onUseHint={play.useHint}
          submitting={play.isSubmitting}
        >
          <DailySharePanel play={data} />
          <DailyStatsPanel
            mode={data.mode}
            maxAttempts={data.maxAttempts}
            highlight={data.status === "won" ? data.attempts : "lost"}
          />
          <DailyRankingResultCard ranking={data.ranking} />
          {isToday && (
            <Button
              component={Link}
              href={next ? `/daily/${next.puzzle.mode}` : "/daily"}
              size={"lg"}
              fz={14}
              fullWidth
              rightSection={<IconArrowRight size={16} />}
            >
              {next
                ? t("daily.result.nextMode", {
                    mode: t(`daily.modes.${next.puzzle.mode}.name`),
                  })
                : t("daily.result.backToHub")}
            </Button>
          )}
        </DailyPlayBoard>
      </Stack>
      <DailyHowToPlayModal opened={howToPlayOpened} onClose={howToPlay.close} />
    </Stack>
  );
};

export { DailyPlayView };
