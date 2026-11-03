import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { DailyGuessInput } from "#@/components/daily/guess/DailyGuessInput";
import { DailyGuessRow } from "#@/components/daily/guess/DailyGuessRow";
import { DailySpecsTable } from "#@/components/daily/guess/DailySpecsTable";
import { DailyImageHint } from "#@/components/daily/hint/DailyImageHint";
import { DailyKeywordsHint } from "#@/components/daily/hint/DailyKeywordsHint";
import { DailySpecsSummary } from "#@/components/daily/hint/DailySpecsSummary";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyPlay } from "#@/components/daily/hooks/useDailyPlay";
import { useDailyToday } from "#@/components/daily/hooks/useDailyToday";
import { DailyResultPanel } from "#@/components/daily/result/DailyResultPanel";
import { DailyCountdown } from "#@/components/daily/view/DailyCountdown";
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
  const todayQuery = useDailyToday();
  const id =
    puzzleId ??
    todayQuery.data?.puzzles.find((puzzle) => puzzle.mode === mode)?.id;
  const play = useDailyPlay(id);
  const { data } = play;

  const missingPuzzle = puzzleId == undefined && todayQuery.isSuccess && !id;
  if (play.isError || (puzzleId == undefined && todayQuery.isError)) {
    return <CenteredErrorMessage mt={"2rem"} message={t("daily.fetchError")} />;
  }
  if (missingPuzzle) {
    return <CenteredErrorMessage mt={"2rem"} message={t("daily.noPuzzle")} />;
  }
  if (!data) return <CenteredLoading className={"mt-8"} />;

  const { hints } = data;
  const inProgress = data.status === "in_progress";
  const newestFirst = [...data.feedback].reverse();

  return (
    <Stack className={"w-full mb-8"}>
      <Group className={"justify-between"}>
        <Stack className={"gap-0"}>
          <Title order={2}>
            {`${t(`daily.modes.${data.mode}.name`)} #${data.number}`}
          </Title>
          <Text c={"dimmed"}>
            {t("daily.attempts", {
              attempts: data.attempts,
              max: data.maxAttempts,
            })}
          </Text>
        </Stack>
        <Group className={"gap-2"}>
          <Link href={"/daily"}>
            <Button variant={"subtle"}>GameNode Daily</Button>
          </Link>
          <Link href={`/daily/${data.mode}/archive`}>
            <Button variant={"subtle"}>{t("daily.archive.link")}</Button>
          </Link>
        </Group>
      </Group>

      {(data.mode === "cover" || data.mode === "artwork") && (
        <DailyImageHint
          key={hints.imageTokens.length}
          tokens={hints.imageTokens}
        />
      )}
      {data.mode === "keywords" && (
        <DailyKeywordsHint
          keywords={hints.keywords}
          imageTokens={hints.imageTokens}
        />
      )}
      {data.mode === "specs" && (
        <DailySpecsSummary
          play={data}
          onUseHint={play.useHint}
          disabled={play.isSubmitting}
        />
      )}

      {inProgress ? (
        <DailyGuessInput
          guessedIds={data.feedback.map((feedback) => feedback.gameId)}
          onGuess={play.guess}
          onSkip={play.skip}
          disabled={play.isSubmitting}
        />
      ) : (
        <DailyResultPanel play={data} />
      )}

      {data.mode === "specs" ? (
        <DailySpecsTable feedback={newestFirst} />
      ) : (
        newestFirst.map((feedback, index) => (
          <DailyGuessRow key={newestFirst.length - index} feedback={feedback} />
        ))
      )}

      {todayQuery.data && (
        <DailyCountdown
          nextResetAt={todayQuery.data.nextResetAt}
          className={"text-center"}
        />
      )}
    </Stack>
  );
};

export { DailyPlayView };
