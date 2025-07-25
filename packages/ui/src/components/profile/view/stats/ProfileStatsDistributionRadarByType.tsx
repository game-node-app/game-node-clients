import React from "react";
import {
  ProfileMetricsDistributionTypeBy,
  useProfileMetricsDistributionByType,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByType";
import { RadarChart } from "@mantine/charts";
import { type ProfileMetricsTypeDistributionItem } from "@repo/wrapper/server";
import { CenteredLoading } from "#@/components/general/CenteredLoading";

interface Props {
  userId: string;
  by: ProfileMetricsDistributionTypeBy;
}

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

const ProfileStatsDistributionRadarByType = ({ userId, by }: Props) => {
  const { data, isLoading } = useProfileMetricsDistributionByType(userId, by);

  return (
    <>
      {isLoading && <CenteredLoading />}
      {data != undefined && (
        <RadarChart
          h={350}
          data={toRadarNamedDistribution(data.distribution)}
          dataKey={"criteriaName"}
          withPolarRadiusAxis
          series={[
            { name: "Total", color: "blue", opacity: 0.5 },
            {
              name: "Finished",
              color: "red",
              opacity: 0.4,
            },
          ]}
          withLegend
        />
      )}
    </>
  );
};

export { ProfileStatsDistributionRadarByType };
