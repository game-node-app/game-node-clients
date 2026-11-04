import { useState } from "react";
import {
  Button,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconChevronLeft } from "@tabler/icons-react";
import { ErrorState } from "#@/components/general/ErrorState";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { GameViewPagination } from "#@/components/game/view/GameViewPagination";
import { useDailyArchive } from "#@/components/daily/hooks/useDailyArchive";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { DailyStatusBadge } from "#@/components/daily/result/DailyStatusBadge";
import {
  DAILY_MODE_ICONS,
  DAILY_MODES,
  type DailyMode,
} from "#@/components/daily/util/dailyModes";
import { formatDailyDate } from "#@/components/daily/util/formatDailyDate";
import { getPageAsOffset } from "#@/util/getOffsetAsPage";
import { Link, useRouter } from "#@/util/link";

const LIMIT = 20;
const SKELETONS = Array.from({ length: 8 }, (_, index) => index);

interface Props {
  mode: DailyMode;
}

const DailyArchiveView = ({ mode }: Props) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  useDailyImportOnLogin();
  const [page, setPage] = useState(1);
  const archiveQuery = useDailyArchive(
    mode,
    getPageAsOffset(page, LIMIT),
    LIMIT,
  );
  const [local] = useDailyLocalResults();
  const puzzles = archiveQuery.data?.data ?? [];
  const ModeIcon = DAILY_MODE_ICONS[mode];

  return (
    <Stack className={"w-full mb-8 gap-4"}>
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
          {t("daily.archive.title", { mode: t(`daily.modes.${mode}.name`) })}
        </Title>
      </Stack>
      <SegmentedControl
        className={"self-start max-w-full"}
        value={mode}
        onChange={(value) => {
          setPage(1);
          router.push(`/daily/${value}/archive`);
        }}
        data={DAILY_MODES.map((item) => ({
          value: item,
          label: t(`daily.modes.${item}.name`),
        }))}
      />
      {archiveQuery.isLoading && (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
          {SKELETONS.map((index) => (
            <Skeleton key={index} h={84} />
          ))}
        </SimpleGrid>
      )}
      {archiveQuery.isError && (
        <DailyErrorState
          onRetry={() => archiveQuery.refetch()}
          retrying={archiveQuery.isFetching}
          backHref={"/daily"}
          backLabel={t("actions.goBack")}
        />
      )}
      {archiveQuery.isSuccess && puzzles.length === 0 && (
        <ErrorState
          color={"gray"}
          icon={ModeIcon}
          title={t("daily.archive.empty")}
        />
      )}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        {puzzles.map((puzzle) => (
          <Link
            key={puzzle.id}
            href={`/daily/${mode}?puzzle=${puzzle.id}`}
            className={
              "block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-5"
            }
          >
            <Paper withBorder p={"sm"} className={"h-full"}>
              <Stack className={"gap-2"}>
                <Group className={"justify-between flex-nowrap"}>
                  <Text fw={700}>{`#${puzzle.number}`}</Text>
                  <Text size={"sm"} c={"dimmed"}>
                    {formatDailyDate(puzzle.date, i18n.language)}
                  </Text>
                </Group>
                <div>
                  <DailyStatusBadge
                    result={puzzle.result ?? local[puzzle.id]}
                  />
                </div>
              </Stack>
            </Paper>
          </Link>
        ))}
      </SimpleGrid>
      <GameViewPagination
        page={page}
        paginationInfo={archiveQuery.data?.pagination}
        onPaginationChange={setPage}
      />
    </Stack>
  );
};

export { DailyArchiveView };
