import React, { useState } from "react";
import { Box, Group, Stack, Tabs, Text } from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import {
    ProfileMetricsDistributionYearBy,
    useProfileMetricsDistributionByYear,
} from "@/components/profile/hooks/useProfileMetricsDistributionByYear";
import { LineChart, LineChartSeries } from "@mantine/charts";
import CenteredLoading from "@/components/general/CenteredLoading";
import { ProfileMetricsYearDistributionItem } from "@/wrapper/server";

interface Props {
    userId: string;
}

const RELEASE_YEAR_SERIES: LineChartSeries[] = [
    {
        name: "count",
        label: "Total",
        color: "blue",
    },
    {
        name: "reviewedCount",
        label: "Reviewed",
        color: "teal",
    },
];

const FINISH_YEAR_SERIES: LineChartSeries[] = [
    {
        name: "count",
        label: "Total",
        color: "blue",
    },
    {
        name: "reviewedCount",
        label: "Reviewed",
        color: "teal",
    },
];

const PLAYTIME_SERIES: LineChartSeries[] = [
    {
        name: "count",
        label: "Estimated playtime (in hours)*",
        color: "grape",
    },
];

const ProfileStatsDistributionLineByYear = ({ userId }: Props) => {
    const [currentTab, setCurrentTab] =
        useState<ProfileMetricsDistributionYearBy>("finish_year");

    const metricsReleaseYearDistributionQuery =
        useProfileMetricsDistributionByYear(userId, "release_year");
    const metricsFinishYearDistributionQuery =
        useProfileMetricsDistributionByYear(userId, "finish_year");
    const metricsPlaytimeYearDistributionQuery =
        useProfileMetricsDistributionByYear(userId, "playtime");

    return (
        <Stack>
            <Tabs
                color="orange"
                variant="pills"
                radius="xl"
                value={currentTab}
                onChange={(v) => {
                    if (v) setCurrentTab(v as ProfileMetricsDistributionYearBy);
                }}
            >
                <Group className={"w-full justify-end gap-1 mb-2"}>
                    <Tabs.Tab value="finish_year">Finish Year</Tabs.Tab>
                    <Tabs.Tab value="release_year">Release year</Tabs.Tab>
                    <Tabs.Tab value={"playtime"}>Playtime</Tabs.Tab>
                </Group>
                <Box className={"mt-4 w-full"}>
                    <Tabs.Panel value={"finish_year"}>
                        {metricsFinishYearDistributionQuery.isLoading && (
                            <CenteredLoading />
                        )}
                        {metricsFinishYearDistributionQuery.data && (
                            <LineChart
                                h={300}
                                dataKey={"year"}
                                data={
                                    metricsFinishYearDistributionQuery.data
                                        .distribution
                                }
                                series={FINISH_YEAR_SERIES}
                            />
                        )}
                    </Tabs.Panel>
                    <Tabs.Panel value={"release_year"}>
                        {metricsReleaseYearDistributionQuery.isLoading && (
                            <CenteredLoading />
                        )}
                        {metricsReleaseYearDistributionQuery.data && (
                            <LineChart
                                h={300}
                                dataKey={"year"}
                                data={
                                    metricsReleaseYearDistributionQuery.data
                                        .distribution
                                }
                                series={RELEASE_YEAR_SERIES}
                            />
                        )}
                    </Tabs.Panel>
                    <Tabs.Panel value={"playtime"}>
                        {metricsPlaytimeYearDistributionQuery.isLoading && (
                            <CenteredLoading />
                        )}
                        {metricsPlaytimeYearDistributionQuery.data && (
                            <LineChart
                                h={300}
                                data={metricsPlaytimeYearDistributionQuery.data.distribution.map(
                                    (item) => {
                                        return {
                                            ...item,
                                            // Converts minutes to hours
                                            count: Math.ceil(item.count / 3600),
                                        };
                                    },
                                )}
                                dataKey={"year"}
                                series={PLAYTIME_SERIES}
                                xAxisLabel={"Year added to collection"}
                            />
                        )}
                    </Tabs.Panel>
                </Box>
            </Tabs>
        </Stack>
    );
};

export default ProfileStatsDistributionLineByYear;
