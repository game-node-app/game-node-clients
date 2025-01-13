import React from "react";
import {
    ProfileMetricsDistributionTypeBy,
    useProfileMetricsDistributionByType,
} from "@/components/profile/hooks/useProfileMetricsDistributionByType";
import { Box } from "@mantine/core";
import { LineChart, RadarChart } from "@mantine/charts";
import { Game } from "@/wrapper/server";
import category = Game.category;
import {
    type ProfileMetricsTypeDistributionItem,
    ProfileMetricsTypeDistributionResponseDto,
} from "@/wrapper/server";
import CenteredLoading from "@/components/general/CenteredLoading";

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
    const metricsDistributionQuery = useProfileMetricsDistributionByType(
        userId,
        by,
    );

    const data = metricsDistributionQuery.data;

    return (
        <>
            {metricsDistributionQuery.isLoading && <CenteredLoading />}
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

export default ProfileStatsDistributionRadarByType;
