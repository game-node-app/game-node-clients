import React from "react";
import {
  ProfileMetricsDistributionTypeBy,
  useProfileMetricsDistributionByType,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByType";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { ProfileStatsDistributionRadarByTypeChart } from "#@/components";

interface Props {
  userId: string;
  by: ProfileMetricsDistributionTypeBy;
}

const ProfileStatsDistributionRadarByType = ({ userId, by }: Props) => {
  const { data, isLoading } = useProfileMetricsDistributionByType(userId, by);

  return (
    <>
      {isLoading && <CenteredLoading />}
      {data != undefined && (
        <ProfileStatsDistributionRadarByTypeChart
          distribution={data.distribution}
        ></ProfileStatsDistributionRadarByTypeChart>
      )}
    </>
  );
};

export { ProfileStatsDistributionRadarByType };
