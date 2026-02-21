import React from "react";
import type { ProfileMetricsTypeDistributionItem } from "@repo/wrapper/server";
import { RadarChart } from "@mantine/charts";

/**
 * Converted distribution item - necessary because RadarChart doesn't have a 'valueFormatter' or a 'label' prop on
 * the series object.
 */
interface NamedTypeDistribution extends ProfileMetricsTypeDistributionItem {
  Total: number;
  Finished: number;
}

const toRadarNamedDistribution = (
  distribution: ProfileMetricsTypeDistributionItem[],
) => {
  return distribution.map((item): NamedTypeDistribution => {
    return {
      ...item,
      Finished: item.finishedCount,
      Total: item.count,
    };
  });
};

interface Props {
  distribution: ProfileMetricsTypeDistributionItem[];
}

const ProfileStatsDistributionRadarByTypeChart = ({ distribution }: Props) => {
  return (
    <RadarChart
      h={350}
      data={toRadarNamedDistribution(distribution)}
      dataKey={"criteriaName"}
      withPolarRadiusAxis
      series={[
        { name: "Total", color: "#DD6747", opacity: 1 },
        {
          name: "Finished",
          color: "red",
          opacity: 0.4,
        },
      ]}
      withLegend
    />
  );
};

export { ProfileStatsDistributionRadarByTypeChart };
