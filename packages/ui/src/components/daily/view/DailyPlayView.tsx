import {
  Button,
  Grid,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconChevronLeft, IconPuzzleOff } from "@tabler/icons-react";
import { ErrorState } from "#@/components/general/ErrorState";
import { DailyGuessInput } from "#@/components/daily/guess/DailyGuessInput";
import { DailyGuessList } from "#@/components/daily/guess/DailyGuessList";
import { DailySpecsTable } from "#@/components/daily/guess/DailySpecsTable";
import { DailyImageHint } from "#@/components/daily/hint/DailyImageHint";
import { DailyKeywordsHint } from "#@/components/daily/hint/DailyKeywordsHint";
import { DailySpecsSummary } from "#@/components/daily/hint/DailySpecsSummary";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyPlay } from "#@/components/daily/hooks/useDailyPlay";
import { useDailyToday } from "#@/components/daily/hooks/useDailyToday";
import { DailyAttemptsTrack } from "#@/components/daily/result/DailyAttemptsTrack";
import { DailyStatsPanel } from "#@/components/daily/result/DailyStatsPanel";
import { DailyResultPanel } from "#@/components/daily/result/DailyResultPanel";
import { DailyCountdown } from "#@/components/daily/view/DailyCountdown";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { formatDailyDate } from "#@/components/daily/util/formatDailyDate";
import { Link } from "#@/util/link";

interface Props {
  mode: DailyMode;
  /** Defaults to today's puzzle for the mode. */
  puzzleId?: number;
}

const DailyPlayView = ({ mode, puzzleId }: Props) => {
  const { t, i18n } = useTranslation();
  useDailyImportOnLogin();
  const todayQuery = useDailyToday();
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
      <Stack className={"w-full mb-8"}>
        <Skeleton h={72} maw={320} />
        <Skeleton h={8} />
        <Skeleton h={360} />
      </Stack>
    );
  }

  const { hints } = data;
  const inProgress = data.status === "in_progress";
  const newestFirst = [...data.feedback].reverse();
  const latest = newestFirst[0];

  const header = (
    <Stack className={"gap-3"}>
      <Group className={"justify-between flex-nowrap items-start"}>
        <Stack className={"gap-1 items-start"}>
          <Button
            component={Link}
            href={"/daily"}
            variant={"subtle"}
            size={"compact-sm"}
            leftSection={<IconChevronLeft size={16} />}
          >
            GameNode Daily
          </Button>
          <Title order={2}>
            {`${t(`daily.modes.${data.mode}.name`)} #${data.number}`}
          </Title>
          <Text c={"dimmed"}>{formatDailyDate(data.date, i18n.language)}</Text>
        </Stack>
        <Button
          component={Link}
          href={`/daily/${data.mode}/archive`}
          variant={"subtle"}
        >
          {t("daily.archive.link")}
        </Button>
      </Group>
      <DailyAttemptsTrack
        results={data.feedback.map((feedback) => feedback.result)}
        maxAttempts={data.maxAttempts}
        hintUsed={data.hintAt != null}
        inProgress={inProgress}
      />
    </Stack>
  );

  const input = inProgress ? (
    <DailyGuessInput
      guessedIds={data.feedback.map((feedback) => feedback.gameId)}
      onGuess={play.guess}
      onSkip={play.skip}
      disabled={play.isSubmitting}
    />
  ) : (
    <DailyResultPanel play={data} nextResetAt={todayQuery.data?.nextResetAt} />
  );

  const stats = !inProgress && (
    <DailyStatsPanel
      mode={data.mode}
      maxAttempts={data.maxAttempts}
      highlight={data.status === "won" ? data.attempts : undefined}
    />
  );

  const hint =
    data.mode === "specs" ? (
      <DailySpecsSummary
        play={data}
        onUseHint={play.useHint}
        disabled={play.isSubmitting}
      />
    ) : data.mode === "keywords" ? (
      <DailyKeywordsHint
        keywords={hints.keywords}
        imageTokens={hints.imageTokens}
      />
    ) : (
      <DailyImageHint
        key={hints.imageTokens.length}
        tokens={hints.imageTokens}
        ratio={data.mode === "artwork" ? 16 / 9 : 3 / 4}
      />
    );

  return (
    <Stack className={"w-full mb-8 gap-5"}>
      {header}
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

      {data.mode === "specs" ? (
        <Stack>
          {hint}
          {input}
          {stats}
          <DailySpecsTable feedback={newestFirst} />
        </Stack>
      ) : (
        <Grid gap={"lg"}>
          <Grid.Col span={{ base: 12, lg: 7 }}>{hint}</Grid.Col>
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Stack>
              {input}
              {stats}
              <DailyGuessList feedback={newestFirst} />
            </Stack>
          </Grid.Col>
        </Grid>
      )}

      {inProgress && todayQuery.data && (
        <DailyCountdown
          nextResetAt={todayQuery.data.nextResetAt}
          className={"self-center"}
        />
      )}
    </Stack>
  );
};

export { DailyPlayView };
