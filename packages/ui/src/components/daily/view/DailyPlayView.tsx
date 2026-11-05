import { Button, Skeleton, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconArrowRight, IconPuzzleOff } from "@tabler/icons-react";
import { ErrorState } from "#@/components/general/ErrorState";
import { DailyGuessInput } from "#@/components/daily/guess/DailyGuessInput";
import { DailyGuessList } from "#@/components/daily/guess/DailyGuessList";
import { DailySpecsTable } from "#@/components/daily/guess/DailySpecsTable";
import { DailyImageHint } from "#@/components/daily/hint/DailyImageHint";
import { DailyKeywordsHint } from "#@/components/daily/hint/DailyKeywordsHint";
import { DailySpecsSummary } from "#@/components/daily/hint/DailySpecsSummary";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyPlay } from "#@/components/daily/hooks/useDailyPlay";
import { useDailyTodayResults } from "#@/components/daily/hooks/useDailyTodayResults";
import { DailyLives } from "#@/components/daily/result/DailyLives";
import { DailyStatsLine } from "#@/components/daily/result/DailyStatsLine";
import { DailyStatsPanel } from "#@/components/daily/result/DailyStatsPanel";
import {
  DailyResultPanel,
  DailySharePanel,
} from "#@/components/daily/result/DailyResultPanel";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { DailyHowToPlayModal } from "#@/components/daily/view/DailyHowToPlayModal";
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

  const { hints } = data;
  const inProgress = data.status === "in_progress";
  const newestFirst = [...data.feedback].reverse();
  const latest = newestFirst[0];
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

  const hint = specs ? (
    <DailySpecsSummary
      play={data}
      onUseHint={play.useHint}
      disabled={play.isSubmitting}
    />
  ) : data.mode === "keywords" ? (
    <DailyKeywordsHint
      keywords={hints.keywords}
      imageTokens={hints.imageTokens}
      attempts={data.attempts}
      maxAttempts={data.maxAttempts}
    />
  ) : (
    <DailyImageHint
      key={hints.imageTokens.length}
      tokens={hints.imageTokens}
      ratio={data.mode === "artwork" ? 16 / 9 : 3 / 4}
      maskTitle={data.mode === "cover"}
    />
  );
  const guesses = specs ? (
    <DailySpecsTable feedback={newestFirst} />
  ) : (
    <DailyGuessList feedback={newestFirst} />
  );

  return (
    <Stack
      className={"w-full mx-auto mb-8 pt-2 sm:pt-6 items-center gap-6"}
      maw={specs ? 1080 : 760}
    >
      <DailyPlayHeader
        mode={data.mode}
        nextResetAt={todayQuery.data?.nextResetAt}
        onHowToPlay={howToPlay.open}
      />
      {isToday && <DailyModeStepper current={data.mode} />}
      {/* Announces each new guess to screen readers. */}
      <div aria-live={"polite"} className={"sr-only"}>
        {latest &&
          (latest.name
            ? t("daily.announce.guess", {
                name: latest.name,
                result: t(`daily.results.${latest.result}`),
              })
            : t("daily.announce.skipped"))}
      </div>

      <Stack className={"w-full gap-5"} maw={specs ? undefined : 640}>
        <DailyStatsLine number={data.number} community={data.community} />
        {inProgress ? (
          <>
            {hint}
            <DailyGuessInput
              guessedIds={data.feedback.map((feedback) => feedback.gameId)}
              onGuess={play.guess}
              onSkip={play.skip}
              disabled={play.isSubmitting}
            />
            <DailyLives
              remaining={data.maxAttempts - data.attempts}
              max={data.maxAttempts}
              className={"justify-center"}
            />
            {guesses}
          </>
        ) : (
          <>
            <DailyResultPanel play={data} />
            {guesses}
            <DailySharePanel play={data} />
            <DailyStatsPanel
              mode={data.mode}
              maxAttempts={data.maxAttempts}
              highlight={data.status === "won" ? data.attempts : "lost"}
            />
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
          </>
        )}
      </Stack>
      <DailyHowToPlayModal opened={howToPlayOpened} onClose={howToPlay.close} />
    </Stack>
  );
};

export { DailyPlayView };
