import React from "react";
import {
    ProfileMetricsDistributionTypeBy,
    useProfileMetricsDistributionByType,
} from "@/components/profile/hooks/useProfileMetricsDistributionByType";
import { BarChart, BarChartProps, LineChart } from "@mantine/charts";
import CenteredLoading from "@/components/general/CenteredLoading";

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
                <BarChart
                    h={300}
                    barProps={{
                        barSize: 30,
                        height: 30,
                    }}
                    {...barChartProps}
                    data={metricsDistributionQuery.data.distribution}
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
            )}
        </>
    );
};

export default ProfileStatsDistributionBarByType;
