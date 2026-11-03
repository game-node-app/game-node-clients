import {
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import { DailyPuzzleDto, DailyService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { useDailyToday } from "#@/components/daily/hooks/useDailyToday";
import { DailyShareButton } from "#@/components/daily/result/DailyShareButton";
import { DailyStatusBadge } from "#@/components/daily/result/DailyStatusBadge";
import { DailyCountdown } from "#@/components/daily/view/DailyCountdown";
import { Link } from "#@/util/link";

const DailyHomeView = () => {
  const { t } = useTranslation();
  useDailyImportOnLogin();
  const userId = useUserId();
  const todayQuery = useDailyToday();
  const [local] = useDailyLocalResults();

  const puzzles = todayQuery.data?.puzzles ?? [];
  const resultOf = (puzzle: DailyPuzzleDto) =>
    puzzle.result ?? local[puzzle.id];
  const finished = puzzles.filter((puzzle) => {
    const status = resultOf(puzzle)?.status;
    return status != undefined && status !== "in_progress";
  });

  // Account results only carry the status; the share text needs every guess.
  const accountPlays = useQueries({
    queries: (userId ? finished : []).map((puzzle) => ({
      queryKey: ["daily", "share", puzzle.id, userId],
      queryFn: () =>
        DailyService.dailyControllerPlayV1(puzzle.id, { guesses: [] }),
    })),
  });

  const shareEntries = finished.flatMap((puzzle, index) => {
    const play = accountPlays[index]?.data;
    const source = play
      ? {
          results: play.feedback.map((item) => item.result),
          hintAt: play.hintAt,
        }
      : local[puzzle.id];
    if (!source) return [];
    return {
      modeLabel: t(`daily.modes.${puzzle.mode}.name`),
      number: puzzle.number,
      maxAttempts: puzzle.maxAttempts,
      results: source.results,
      hintUsed: source.hintAt != null,
    };
  });

  if (todayQuery.isLoading) return <CenteredLoading className={"mt-8"} />;
  if (todayQuery.isError || !todayQuery.data) {
    return <CenteredErrorMessage mt={"2rem"} message={t("daily.fetchError")} />;
  }

  return (
    <Stack className={"w-full mb-8"}>
      <Stack className={"gap-1"}>
        <Title>GameNode Daily</Title>
        <Text c={"dimmed"}>{t("daily.subtitle")}</Text>
        <DailyCountdown nextResetAt={todayQuery.data.nextResetAt} />
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {puzzles.map((puzzle) => (
          <Paper key={puzzle.id} withBorder p={"md"}>
            <Stack className={"h-full gap-2"}>
              <Group className={"justify-between flex-nowrap"}>
                <Title order={4}>{t(`daily.modes.${puzzle.mode}.name`)}</Title>
                <Text c={"dimmed"}>#{puzzle.number}</Text>
              </Group>
              <Text size={"sm"} c={"dimmed"} className={"flex-grow"}>
                {t(`daily.modes.${puzzle.mode}.description`)}
              </Text>
              <Group className={"justify-between"}>
                <DailyStatusBadge result={resultOf(puzzle)} />
                <Group className={"gap-2"}>
                  <Link href={`/daily/${puzzle.mode}/archive`}>
                    <Button variant={"subtle"} size={"xs"}>
                      {t("daily.archive.link")}
                    </Button>
                  </Link>
                  <Link href={`/daily/${puzzle.mode}`}>
                    <Button size={"xs"}>{t("daily.play")}</Button>
                  </Link>
                </Group>
              </Group>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
      {shareEntries.length > 0 && (
        <Group>
          <DailyShareButton
            entries={shareEntries}
            label={t("daily.share.all")}
          />
        </Group>
      )}
    </Stack>
  );
};

export { DailyHomeView };
