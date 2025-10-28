import React, { useMemo } from "react";
import { useHeatmap } from "#@/components/journal/heatmap/hooks/useHeatmap.ts";
import { CenteredLoading } from "#@/components";
import { Heatmap } from "@mantine/charts";
import { Box, Flex } from "@mantine/core";
import dayjs from "dayjs";

interface Props {
  userId: string;
}

const JournalHeatmap = ({ userId }: Props) => {
  const { data: heatmap, isLoading, isError } = useHeatmap(userId);

  const heatmapData = useMemo(() => {
    const items = heatmap?.items ?? [];
    const dataObj: Record<string, number> = {};

    for (const item of items) {
      dataObj[item.date] = item.count;
    }

    return dataObj;
  }, [heatmap]);

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (isError || heatmap?.items.length === 0) {
    return null;
  }

  return (
    <Box className={"overflow-x-auto pb-2"}>
      <Box className={"w-full justify-center"}>
        <Heatmap
          colors={["#fbb3a0", "#f36742", "#f14517", "#c02e06"]}
          data={heatmapData}
          withTooltip
          withMonthLabels
          rectSize={16}
          getTooltipLabel={(input) => {
            if (input.value === 0 || input.value == null) {
              return `${dayjs(input.date).format("LL")}`;
            }

            return `${dayjs(input.date).format("LL")}: ${input.value} games added/updated`;
          }}
        />
      </Box>
    </Box>
  );
};

export { JournalHeatmap };
