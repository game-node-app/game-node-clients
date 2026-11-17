import {
  BackToTopButton,
  CenteredLoading,
  JournalMonthHeader,
  JournalOverviewItem,
  JournalYearHeader,
  LibraryHiddenState,
  useIsLibraryHidden,
  useProgressiveRender,
} from "#@/components";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type {
  JournalOverviewResponseDto,
  JournalEntryStatusDto,
} from "@repo/wrapper/server";
import { useMemo } from "react";

interface Props {
  userId: string;
}

type Row =
  | { type: "year"; key: string; year: number; totalGames: number }
  | { type: "month"; key: string; year: number; month: number }
  | {
      type: "entry";
      key: string;
      day: number;
      entry: JournalEntryStatusDto;
    };

/**
 * Flattens the year > month > day tree into rows, so the list can be rendered
 * progressively (each entry fires its own requests).
 */
function buildRows(data: JournalOverviewResponseDto | undefined) {
  const rows: Row[] = [];
  for (const yearGroup of data?.years ?? []) {
    const gameIds = new Set<number>();
    for (const monthGroup of yearGroup.months) {
      for (const dayGroup of monthGroup.days) {
        for (const entry of dayGroup.entries) gameIds.add(entry.gameId);
      }
    }

    rows.push({
      type: "year",
      key: `y_${yearGroup.year}`,
      year: yearGroup.year,
      totalGames: gameIds.size,
    });

    for (const monthGroup of yearGroup.months) {
      rows.push({
        type: "month",
        key: `m_${yearGroup.year}_${monthGroup.month}`,
        year: yearGroup.year,
        month: monthGroup.month,
      });
      for (const dayGroup of monthGroup.days) {
        for (const entry of dayGroup.entries) {
          rows.push({
            type: "entry",
            key: `e_${yearGroup.year}_${monthGroup.month}_${dayGroup.day}_${entry.collectionEntryId}_${entry.status}`,
            day: dayGroup.day,
            entry,
          });
        }
      }
    }
  }
  return rows;
}

const JournalOverviewView = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { isHidden, profile } = useIsLibraryHidden(userId);
  const { data, isLoading } = useJournalOverview(userId);

  const rows = useMemo(() => buildRows(data), [data]);

  const { visibleCount, sentinelRef, hasMore } = useProgressiveRender(
    rows.length,
  );

  if (isHidden) {
    return <LibraryHiddenState profile={profile} />;
  }

  return (
    <Stack className={"gap-2"}>
      <BackToTopButton />
      {isLoading && <CenteredLoading message={t("journal.loading")} />}
      {rows.slice(0, visibleCount).map((row) => {
        switch (row.type) {
          case "year":
            return (
              <JournalYearHeader
                key={row.key}
                year={row.year}
                subtitle={t("journal.overview.gamesCount", {
                  count: row.totalGames,
                })}
              />
            );
          case "month":
            return (
              <JournalMonthHeader
                key={row.key}
                year={row.year}
                month={row.month}
              />
            );
          case "entry":
            return (
              <JournalOverviewItem
                key={row.key}
                userId={userId}
                targetDay={row.day}
                item={row.entry}
              />
            );
        }
      })}
      {hasMore && <div ref={sentinelRef} className={"h-px"} />}
    </Stack>
  );
};

export { JournalOverviewView };
