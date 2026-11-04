import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { DailyPuzzleDto } from "@repo/wrapper/server";
import { IconCalendar, IconFlame, IconHelp } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { DailyHowToPlayModal } from "#@/components/daily/view/DailyHowToPlayModal";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { useDailyResults } from "#@/components/daily/hooks/useDailyResults";
import { useDailyTodayResults } from "#@/components/daily/hooks/useDailyTodayResults";
import { DailyCountdown } from "#@/components/daily/view/DailyCountdown";
import {
  computeDailyPlayStreak,
  toSaoPauloDate,
} from "#@/components/daily/util/computeDailyStats";
import {
  DAILY_DIFFICULTY_COLORS,
  DAILY_MODE_DIFFICULTY,
  DAILY_MODE_ICONS,
  DAILY_RESULT_STYLES,
  DAILY_STATUS_KIND,
} from "#@/components/daily/util/dailyModes";
import { Link } from "#@/util/link";

const DAILY_PLACEHOLDERS = [0, 1, 2, 3];
const ARCHIVE_HREF = "/daily/cover/archive";

interface ModeRowProps {
  puzzle: DailyPuzzleDto;
  result?: { status: string; attempts: number };
}

const DailyModeRow = ({ puzzle, result }: ModeRowProps) => {
  const { t } = useTranslation();
  const ModeIcon = DAILY_MODE_ICONS[puzzle.mode];
  const difficulty = DAILY_MODE_DIFFICULTY[puzzle.mode];
  const name = t(`daily.modes.${puzzle.mode}.name`);
  const statusColor =
    result?.status === "in_progress"
      ? "brand"
      : result && DAILY_RESULT_STYLES[DAILY_STATUS_KIND[result.status]].color;
  const status = !result
    ? t("daily.hub.attempts", { max: puzzle.maxAttempts })
    : result.status === "won"
      ? t("daily.hub.won", { attempts: result.attempts })
      : result.status === "lost"
        ? t("daily.hub.lost")
        : t("daily.hub.inProgress", {
            attempts: result.attempts,
            max: puzzle.maxAttempts,
          });

  return (
    <Paper
      withBorder
      radius={12}
      p={"md"}
      className={"relative flex items-center gap-3.5 !bg-paper-8"}
      style={
        statusColor
          ? { borderColor: `var(--mantine-color-${statusColor}-filled)` }
          : undefined
      }
    >
      <ThemeIcon
        size={52}
        radius={12}
        variant={"light"}
        color={statusColor ?? "brand"}
      >
        <ModeIcon size={24} />
      </ThemeIcon>
      <Stack className={"gap-1 flex-1 min-w-0"}>
        <Group className={"gap-2"}>
          {/* Stretched over the row, so the whole card opens the puzzle and the archive button stays separate. */}
          <Link
            href={`/daily/${puzzle.mode}`}
            className={
              "text-lg leading-tight font-bold text-inherit no-underline after:absolute after:inset-0 after:content-['']"
            }
          >
            {name}
          </Link>
          <Badge
            variant={"light"}
            color={DAILY_DIFFICULTY_COLORS[difficulty]}
            radius={"sm"}
            size={"sm"}
          >
            {t(`daily.difficulty.${difficulty}`)}
          </Badge>
        </Group>
        <Text fz={13} lh={1.3} c={"dimmed"} lineClamp={2}>
          {t(`daily.modes.${puzzle.mode}.description`)}
        </Text>
        <Text fz={12} lh={1.3} fw={500} c={statusColor ?? "dimmed"}>
          {status}
        </Text>
      </Stack>
      <ActionIcon
        component={Link}
        href={`/daily/${puzzle.mode}/archive`}
        variant={"default"}
        size={36}
        radius={8}
        className={"relative z-10"}
        aria-label={t("daily.archive.title", { mode: name })}
      >
        <IconCalendar size={16} />
      </ActionIcon>
    </Paper>
  );
};

const DailyHomeView = () => {
  const { t } = useTranslation();
  useDailyImportOnLogin();
  const userId = useUserId();
  const { todayQuery, entries } = useDailyTodayResults();
  const resultsQuery = useDailyResults();
  const [local] = useDailyLocalResults();
  const [howToPlayOpened, howToPlay] = useDisclosure(false);

  const finishedToday = entries.filter(
    ({ result }) => result && result.status !== "in_progress",
  ).length;
  const streak = computeDailyPlayStreak(
    userId ? (resultsQuery.data?.data ?? []) : Object.values(local),
    toSaoPauloDate(new Date()),
  );

  const intro = (
    <Group className={"justify-between items-end flex-nowrap"}>
      <Stack className={"gap-1.5"}>
        <Title order={1} fz={{ base: 22, sm: 36 }}>
          GameNode Daily
        </Title>
        <Text fz={15} c={"dimmed"} visibleFrom={"sm"}>
          {t("daily.subtitle")}
        </Text>
      </Stack>
      <Group className={"gap-2 flex-nowrap"}>
        <Button
          variant={"default"}
          leftSection={<IconHelp size={16} />}
          onClick={howToPlay.open}
          visibleFrom={"sm"}
        >
          {t("daily.howToPlay.button")}
        </Button>
        <ActionIcon
          variant={"subtle"}
          color={"gray"}
          size={"lg"}
          onClick={howToPlay.open}
          hiddenFrom={"sm"}
          aria-label={t("daily.howToPlay.button")}
        >
          <IconHelp size={20} />
        </ActionIcon>
        <Button
          component={Link}
          href={ARCHIVE_HREF}
          variant={"default"}
          leftSection={<IconCalendar size={16} />}
          visibleFrom={"sm"}
        >
          {t("daily.archive.link")}
        </Button>
        <ActionIcon
          component={Link}
          href={ARCHIVE_HREF}
          variant={"subtle"}
          color={"gray"}
          size={"lg"}
          hiddenFrom={"sm"}
          aria-label={t("daily.archive.link")}
        >
          <IconCalendar size={20} />
        </ActionIcon>
      </Group>
    </Group>
  );

  const panel = (() => {
    if (todayQuery.isLoading) {
      return (
        <Stack className={"gap-3"}>
          {DAILY_PLACEHOLDERS.map((index) => (
            <Skeleton key={index} h={86} radius={12} />
          ))}
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
    return (
      <Paper
        withBorder
        radius={14}
        p={{ base: 0, sm: 20 }}
        className={
          "flex flex-col gap-3 !bg-transparent sm:!bg-paper-7 !border-0 sm:!border"
        }
      >
        <Group className={"justify-between"}>
          <Title order={2} fz={{ base: 22, sm: 20 }}>
            {t("daily.dailyNumber", { number: entries[0]?.puzzle.number })}
          </Title>
          <DailyCountdown nextResetAt={todayQuery.data.nextResetAt} />
        </Group>
        {entries.map(({ puzzle, result }) => (
          <DailyModeRow key={puzzle.id} puzzle={puzzle} result={result} />
        ))}
        <Group className={"gap-2"}>
          <IconFlame size={16} className={"text-brand-5"} />
          <Text fz={13} fw={500} c={"dimmed"}>
            {t(
              streak === 0
                ? "daily.hub.today"
                : streak === 1
                  ? "daily.hub.streakOne"
                  : "daily.hub.streak",
              { count: streak, finished: finishedToday, total: entries.length },
            )}
          </Text>
        </Group>
      </Paper>
    );
  })();

  return (
    <Stack
      className={
        "w-full max-w-[720px] mx-auto mb-8 pt-2 sm:pt-6 gap-4 sm:gap-7"
      }
    >
      {intro}
      {panel}
      <DailyHowToPlayModal opened={howToPlayOpened} onClose={howToPlay.close} />
    </Stack>
  );
};

export { DailyHomeView };
