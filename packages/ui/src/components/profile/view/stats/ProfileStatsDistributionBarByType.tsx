import React from "react";
import {
  ProfileMetricsDistributionTypeBy,
  useProfileMetricsDistributionByType,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByType";
import { BarChartProps } from "@mantine/charts";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { ProfileStatsDistributionByTypeChart } from "#@/components";

interface Props extends Omit<BarChartProps, "data" | "dataKey" | "series"> {
  userId: string;
  by: ProfileMetricsDistributionTypeBy;
}

const ProfileStatsDistributionBarByType = ({
  userId,
  by,
  ...barChartProps
}: Props) => {
  const metricsDistributionQuery = useProfileMetricsDistributionByType(
    userId,
    by,
  );

  return (
    <>
      {metricsDistributionQuery.isLoading && <CenteredLoading />}
      {metricsDistributionQuery.data != undefined && (
        <ProfileStatsDistributionByTypeChart
          distribution={metricsDistributionQuery.data.distribution}
          {...barChartProps}
        />
      )}
    </>
  );
};

export { ProfileStatsDistributionBarByType };
