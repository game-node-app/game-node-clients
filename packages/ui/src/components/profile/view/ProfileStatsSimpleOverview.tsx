import React from "react";
import { useProfileMetricsOverview } from "#@/components/profile/hooks/useProfileMetricsOverview";
import { Group, Popover, Stack, Text } from "@mantine/core";
import { BarChart } from "@mantine/charts";

interface Props {
  userId: string;
}

const ProfileStatsSimpleOverview = ({ userId }: Props) => {
  const metricsOverviewQuery = useProfileMetricsOverview(userId);

  const playtimeValue = metricsOverviewQuery.data?.totalEstimatedPlaytime ?? 0;
  const playtimeValueHours = Math.ceil(playtimeValue / 3600);

  return (
    <Group className={"w-full"}>
      <Group className={"w-full justify-between flex-nowrap"}>
        <Stack className={"gap-1"}>
          <Text className={"text-md text-center"}>
            {metricsOverviewQuery.data?.totalPlayedGames}
          </Text>
          <Text className={"text-sm text-dimmed text-center"}>
            Total Games Played
          </Text>
        </Stack>
        <Stack className={"gap-1"}>
          <Text className={"text-sm text-center"}>
            {metricsOverviewQuery.data?.totalPlayedGamesInYear}
          </Text>
          <Text className={"text-sm text-dimmed text-center"}>
            Played this year
          </Text>
        </Stack>
        <Stack className={"gap-1"}>
          <Text className={"text-sm text-center"}>{playtimeValueHours}</Text>
          <Popover width="target" position="left" withArrow shadow="md">
            <Popover.Target>
              <Text className={"text-sm text-dimmed text-center"}>
                Total estimated playtime (in hours)*
              </Text>
            </Popover.Target>
            <Popover.Dropdown>
              <Text className={"break-keep text-sm"}>
                Based on data from available connections (e.g. Steam, PSN).
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
                label: "Backlog tracking",
                totalGames: metricsOverviewQuery.data.totalGames,
                totalFinishedGames:
                  metricsOverviewQuery.data.totalFinishedGames,
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

export { ProfileStatsSimpleOverview };
