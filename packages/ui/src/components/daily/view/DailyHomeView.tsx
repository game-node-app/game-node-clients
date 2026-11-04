import {
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import { DailyPuzzleDto, DailyService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { RoundedIcon } from "#@/components/general/RoundedIcon";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { useDailyToday } from "#@/components/daily/hooks/useDailyToday";
import { DailyAttemptsTrack } from "#@/components/daily/result/DailyAttemptsTrack";
import { DailyShareButton } from "#@/components/daily/result/DailyShareButton";
import { DailyStatusBadge } from "#@/components/daily/result/DailyStatusBadge";
import { DailyCountdown } from "#@/components/daily/view/DailyCountdown";
import { DAILY_MODE_ICONS } from "#@/components/daily/util/dailyModes";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

const DAILY_PLACEHOLDERS = [0, 1, 2, 3];

const DailyHomeView = () => {
  const { t } = useTranslation();
  useDailyImportOnLogin();
  const userId = useUserId();
  const todayQuery = useDailyToday();
  const [local] = useDailyLocalResults();

  const puzzles = todayQuery.data?.puzzles ?? [];
  const resultOf = (puzzle: DailyPuzzleDto) =>
    puzzle.result ?? local[puzzle.id];
  const started = puzzles.filter((puzzle) => resultOf(puzzle) != undefined);
  const finished = started.filter(
    (puzzle) => resultOf(puzzle)?.status !== "in_progress",
  );

  // Account results only carry the status; the attempts and the share text need every guess.
  const accountPlays = useQueries({
    queries: (userId ? started : []).map((puzzle) => ({
      queryKey: ["daily", "share", puzzle.id, userId],
      queryFn: () =>
        DailyService.dailyControllerPlayV1(puzzle.id, { guesses: [] }),
    })),
  });

  const sourceOf = (puzzle: DailyPuzzleDto) => {
    const play = accountPlays[started.indexOf(puzzle)]?.data;
    return play
      ? {
          results: play.feedback.map((item) => item.result),
          hintAt: play.hintAt,
        }
      : local[puzzle.id];
  };

  const shareEntries = finished.flatMap((puzzle) => {
    const source = sourceOf(puzzle);
    if (!source) return [];
    return {
      modeLabel: t(`daily.modes.${puzzle.mode}.name`),
      number: puzzle.number,
      maxAttempts: puzzle.maxAttempts,
      results: source.results,
      hintUsed: source.hintAt != null,
    };
  });

  if (todayQuery.isLoading) {
    return (
      <Stack className={"w-full mb-8"}>
        <Skeleton h={64} maw={480} />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {DAILY_PLACEHOLDERS.map((index) => (
            <Skeleton key={index} h={220} />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }
  if (todayQuery.isError || !todayQuery.data) {
    return (
      <DailyErrorState
        onRetry={() => todayQuery.refetch()}
        retrying={todayQuery.isFetching}
        backHref={"/home"}
        backLabel={t("actions.backHome")}
      />
    );
  }

  const solved = puzzles.filter(
    (puzzle) => resultOf(puzzle)?.status === "won",
  ).length;

  return (
    <Stack className={"w-full mb-8"}>
      <Group className={"justify-between items-end"}>
        <Stack className={"gap-1"}>
          <Title>GameNode Daily</Title>
          <Text c={"dimmed"}>{t("daily.subtitle")}</Text>
          <Text size={"sm"} fw={600}>
            {t("daily.todayProgress", { solved, total: puzzles.length })}
          </Text>
        </Stack>
        <Group className={"gap-2"}>
          <DailyCountdown nextResetAt={todayQuery.data.nextResetAt} />
          {shareEntries.length > 0 && (
            <DailyShareButton
              variant={"default"}
              entries={shareEntries}
              label={t("daily.share.today")}
            />
          )}
        </Group>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {puzzles.map((puzzle) => {
          const result = resultOf(puzzle);
          const source = sourceOf(puzzle);
          const inProgress = result?.status === "in_progress";
          return (
            <Paper
              key={puzzle.id}
              withBorder
              p={"md"}
              className={cn({ "!border-brand-5": inProgress })}
            >
              <Stack className={"h-full gap-3"}>
                <Group className={"flex-nowrap"}>
                  <RoundedIcon
                    icon={DAILY_MODE_ICONS[puzzle.mode]}
                    iconProps={{ size: 22 }}
                    wrapperProps={{ p: 8 }}
                  />
                  <Stack className={"gap-0"}>
                    <Title order={4}>
                      {t(`daily.modes.${puzzle.mode}.name`)}
                    </Title>
                    <Text size={"sm"} c={"dimmed"}>
                      #{puzzle.number}
                    </Text>
                  </Stack>
                </Group>
                <Text
                  size={"sm"}
                  c={"dimmed"}
                  lineClamp={2}
                  className={"flex-grow"}
                >
                  {t(`daily.modes.${puzzle.mode}.description`)}
                </Text>
                {result && !source ? (
                  <Skeleton h={8} />
                ) : (
                  <DailyAttemptsTrack
                    results={source?.results ?? []}
                    maxAttempts={puzzle.maxAttempts}
                    hintUsed={source?.hintAt != null}
                    inProgress={inProgress}
                  />
                )}
                <DailyStatusBadge result={result} />
                <Button
                  component={Link}
                  href={`/daily/${puzzle.mode}`}
                  variant={!result || inProgress ? "filled" : "default"}
                >
                  {!result
                    ? t("daily.play")
                    : inProgress
                      ? t("daily.continue")
                      : t("daily.seeResult")}
                </Button>
                <Button
                  component={Link}
                  href={`/daily/${puzzle.mode}/archive`}
                  variant={"subtle"}
                  size={"xs"}
                >
                  {t("daily.archive.link")}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};

export { DailyHomeView };
