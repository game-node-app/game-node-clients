import { useState } from "react";
import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import { GameViewPagination } from "#@/components/game/view/GameViewPagination";
import { useDailyArchive } from "#@/components/daily/hooks/useDailyArchive";
import { useDailyImportOnLogin } from "#@/components/daily/hooks/useDailyImportOnLogin";
import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { DailyStatusBadge } from "#@/components/daily/result/DailyStatusBadge";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { getPageAsOffset } from "#@/util/getOffsetAsPage";
import { Link } from "#@/util/link";

const LIMIT = 20;

interface Props {
  mode: DailyMode;
}

const DailyArchiveView = ({ mode }: Props) => {
  const { t } = useTranslation();
  useDailyImportOnLogin();
  const [page, setPage] = useState(1);
  const archiveQuery = useDailyArchive(
    mode,
    getPageAsOffset(page, LIMIT),
    LIMIT,
  );
  const [local] = useDailyLocalResults();
  const puzzles = archiveQuery.data?.data ?? [];

  return (
    <Stack className={"w-full mb-8"}>
      <Title order={2}>
        {t("daily.archive.title", { mode: t(`daily.modes.${mode}.name`) })}
      </Title>
      {archiveQuery.isLoading && <CenteredLoading className={"mt-8"} />}
      {archiveQuery.isError && (
        <DailyErrorState
          onRetry={() => archiveQuery.refetch()}
          retrying={archiveQuery.isFetching}
          backHref={"/daily"}
          backLabel={t("actions.goBack")}
        />
      )}
      {archiveQuery.isSuccess && puzzles.length === 0 && (
        <Text c={"dimmed"}>{t("daily.archive.empty")}</Text>
      )}
      {puzzles.map((puzzle) => (
        <Link key={puzzle.id} href={`/daily/${mode}?puzzle=${puzzle.id}`}>
          <Paper withBorder p={"sm"}>
            <Group className={"justify-between"}>
              <Text fw={600}>{`#${puzzle.number} · ${puzzle.date}`}</Text>
              <DailyStatusBadge result={puzzle.result ?? local[puzzle.id]} />
            </Group>
          </Paper>
        </Link>
      ))}
      <GameViewPagination
        page={page}
        paginationInfo={archiveQuery.data?.pagination}
        onPaginationChange={setPage}
      />
    </Stack>
  );
};

export { DailyArchiveView };
