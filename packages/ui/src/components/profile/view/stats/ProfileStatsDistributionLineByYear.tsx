import React, { useState } from "react";
import { Box, Group, Stack, Tabs, Text } from "@mantine/core";
import { DetailsBox } from "#@/components/general/DetailsBox";
import {
  ProfileMetricsDistributionYearBy,
  useProfileMetricsDistributionByYear,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByYear";
import { LineChart, LineChartSeries } from "@mantine/charts";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { ProfileMetricsYearDistributionItem } from "../../../../../../wrapper/src/server";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
}

const ProfileStatsDistributionLineByYear = ({ userId }: Props) => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] =
    useState<ProfileMetricsDistributionYearBy>("finish_year");

  const metricsReleaseYearDistributionQuery =
    useProfileMetricsDistributionByYear(userId, "release_year");
  const metricsFinishYearDistributionQuery =
    useProfileMetricsDistributionByYear(userId, "finish_year");
  const metricsPlaytimeYearDistributionQuery =
    useProfileMetricsDistributionByYear(userId, "playtime");

  const releaseYearSeries: LineChartSeries[] = [
    {
      name: "count",
      label: t("profile.stats.total"),
      color: "blue",
    },
    {
      name: "reviewedCount",
      label: t("profile.stats.reviewed"),
      color: "teal",
    },
  ];

  const finishYearSeries: LineChartSeries[] = [
    {
      name: "count",
      label: t("profile.stats.total"),
      color: "blue",
    },
    {
      name: "reviewedCount",
      label: t("profile.stats.reviewed"),
      color: "teal",
    },
  ];

  const playtimeSeries: LineChartSeries[] = [
    {
      name: "count",
      label: t("profile.stats.estimatedPlaytime"),
      color: "grape",
    },
  ];

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
          <Tabs.Tab value="finish_year">
            {t("profile.stats.finishYear")}
          </Tabs.Tab>
          <Tabs.Tab value="release_year">
            {t("profile.stats.releaseYear")}
          </Tabs.Tab>
          <Tabs.Tab value={"playtime"}>{t("profile.stats.playtime")}</Tabs.Tab>
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
                data={metricsFinishYearDistributionQuery.data.distribution}
                series={finishYearSeries}
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
                data={metricsReleaseYearDistributionQuery.data.distribution}
                series={releaseYearSeries}
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
                series={playtimeSeries}
                xAxisLabel={t("profile.stats.year")}
              />
            )}
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Stack>
  );
};

export { ProfileStatsDistributionLineByYear };
