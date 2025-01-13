import React from "react";
import { useProfileMetricsOverview } from "@/components/profile/hooks/useProfileMetricsOverview";
import {
    Group,
    Popover,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import { BarChart } from "@mantine/charts";
import { ProfileMetricsOverviewDto } from "@/wrapper/server";
import TextLink from "@/components/general/TextLink";

interface Props {
    userId: string;
}

const buildBarChartData = (data: ProfileMetricsOverviewDto) => {
    return [
        {
            label: "Total games",
            totalGames: data.totalGames,
            // totalFinishedGames: null,
        },
        {
            label: "Finished games",
            // totalGames: null,
            totalFinishedGames: data.totalFinishedGames,
        },
    ];
};

const ProfileStatsSimpleOverview = ({ userId }: Props) => {
    const metricsOverviewQuery = useProfileMetricsOverview(userId);

    const playtimeValue =
        metricsOverviewQuery.data?.totalEstimatedPlaytime ?? 0;
    const playtimeValueHours = Math.ceil(playtimeValue / 3600);

    return (
        <Group className={"w-full"}>
            <Group className={"w-full justify-between flex-nowrap"}>
                <Stack className={"gap-1"}>
                    <Text className={"text-md text-center"}>
                        {metricsOverviewQuery.data?.totalGames}
                    </Text>
                    <Text className={"text-sm text-dimmed text-center"}>
                        Total games
                    </Text>
                </Stack>
                <Stack className={"gap-1"}>
                    <Text className={"text-sm text-center"}>
                        {metricsOverviewQuery.data?.totalFinishedGames}
                    </Text>
                    <Text className={"text-sm text-dimmed text-center"}>
                        Finished games
                    </Text>
                </Stack>
                <Stack className={"gap-1"}>
                    <Text className={"text-sm text-center"}>
                        {playtimeValueHours}
                    </Text>
                    <Popover
                        width="target"
                        position="left"
                        withArrow
                        shadow="md"
                    >
                        <Popover.Target>
                            <Text className={"text-sm text-dimmed text-center"}>
                                Estimated playtime (in hours)*
                            </Text>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text className={"break-keep text-sm"}>
                                Based on data from available connections (e.g.
                                Steam, PSN).
                            </Text>
                            <Text className={"break-keep text-sm"}>
                                Actual playtime may be much greater.
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Stack>
            </Group>
            {metricsOverviewQuery.data && (
                <Group className={"w-full"}>
                    <BarChart
                        h={80}
                        data={[
                            {
                                label: "Played vs Finished",
                                totalGames:
                                    metricsOverviewQuery.data.totalGames,
                                totalFinishedGames:
                                    metricsOverviewQuery.data
                                        .totalFinishedGames,
                            },
                        ]}
                        dataKey={"label"}
                        orientation={"vertical"}
                        series={[
                            {
                                name: "totalGames",
                                color: "blue",
                                label: "Total games",
                            },
                            {
                                name: "totalFinishedGames",
                                color: "red",
                                label: "Finished games",
                            },
                        ]}
                        gridAxis={"y"}
                        barProps={{
                            barSize: 20,
                            height: 20,
                        }}
                        withYAxis={false}
                    />
                </Group>
            )}
        </Group>
    );
};

export default ProfileStatsSimpleOverview;
