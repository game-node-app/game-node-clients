import {
  JournalAchievementsGameGroupView,
  JournalMonthHeader,
  JournalYearHeader,
  useProgressiveRender,
} from "#@/components";
import { Stack } from "@mantine/core";
import {
  JournalAchievementsGameGroup,
  JournalAchievementsYearGroup,
} from "@repo/wrapper/server";
import { useMemo } from "react";

interface Props {
  userId: string;
  groups: JournalAchievementsYearGroup[];
}

type Row =
  | { type: "year"; key: string; year: number; totalObtained: number }
  | { type: "month"; key: string; year: number; month: number }
  | { type: "game"; key: string; gameGroup: JournalAchievementsGameGroup };

/**
 * Year > month > game layout. The tree is flattened into rows so it can be
 * rendered progressively as the user scrolls.
 */
const JournalAchievementsDetailedLayoutView = ({ userId, groups }: Props) => {
  const rows = useMemo(() => {
    const rows: Row[] = [];
    for (const yearGroup of groups) {
      rows.push({
        type: "year",
        key: `y_${yearGroup.year}`,
        year: yearGroup.year,
        totalObtained: yearGroup.totalObtained,
      });
      for (const monthGroup of yearGroup.months) {
        rows.push({
          type: "month",
          key: `m_${yearGroup.year}_${monthGroup.month}`,
          year: yearGroup.year,
          month: monthGroup.month,
        });
        for (const gameGroup of monthGroup.games) {
          rows.push({
            type: "game",
            key: `g_${yearGroup.year}_${monthGroup.month}_${gameGroup.externalGameId}`,
            gameGroup,
          });
        }
      }
    }
    return rows;
  }, [groups]);

  const { visibleCount, sentinelRef, hasMore } = useProgressiveRender(
    rows.length,
  );

  return (
    <Stack className={"gap-2 w-full"}>
      {rows.slice(0, visibleCount).map((row) => {
        switch (row.type) {
          case "year":
            return (
              <JournalYearHeader
                key={row.key}
                year={row.year}
                subtitle={`${row.totalObtained} achievements`}
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
          case "game":
            return (
              <JournalAchievementsGameGroupView
                key={row.key}
                userId={userId}
                gameGroup={row.gameGroup}
              />
            );
        }
      })}
      {hasMore && <div ref={sentinelRef} className={"h-px"} />}
    </Stack>
  );
};

export { JournalAchievementsDetailedLayoutView };
