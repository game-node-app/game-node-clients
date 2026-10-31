import { ProfileStatsDistributionRadarByTypeChart } from "#@/components";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import {
  ProfileMetricsDistributionTypeBy,
  useProfileMetricsDistributionByType,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByType";

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