import React from "react";
import type { ProfileMetricsTypeDistributionItem } from "@repo/wrapper/server";
import { BarChart, BarChartProps } from "@mantine/charts";

interface Props extends Omit<BarChartProps, "data" | "dataKey" | "series"> {
  distribution: Array<ProfileMetricsTypeDistributionItem>;
}

const ProfileStatsDistributionByTypeChart = ({
  distribution,
  ...others
}: Props) => {
  return (
    <BarChart
      h={300}
      barProps={{
        barSize: 30,
        height: 30,
      }}
      {...others}
      data={distribution}
      dataKey={"criteriaName"}
      series={[
        { name: "count", color: "blue", label: "Total" },
        {
          name: "finishedCount",
          color: "red",
          label: "Finished",
        },
      ]}
    />
  );
};

export { ProfileStatsDistributionByTypeChart };
