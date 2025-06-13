import React from "react";
import {
  DetailsBox,
  ProfileStatsDataIcon,
  ProfileStatsDistributionBarByType,
  ProfileStatsDistributionLineByYear,
  ProfileStatsDistributionRadarByType,
  useProfileMetricsOverview,
  UserAvatarWithLevelInfo,
} from "@repo/ui";
import { Box, Group, Paper, SimpleGrid, Stack } from "@mantine/core";
import {
  IconClock,
  IconDeviceGamepad2,
  IconListCheck,
  IconStack2,
} from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";

interface Props {
  userId: string;
  withUserLevel?: boolean;
}

const ProfileStatsView = ({ userId, withUserLevel = true }: Props) => {
  const metricsOverviewQuery = useProfileMetricsOverview(userId);

  const playtimeInHours = metricsOverviewQuery.data?.totalEstimatedPlaytime
    ? Math.ceil(metricsOverviewQuery.data?.totalEstimatedPlaytime / 3600)
    : 0;

  return (
    <Stack className="w-full h-full">
      {withUserLevel && (
        <Paper className={"bg-paper"}>
          <Group
            className={
              "w-full h-full flex-nowrap justify-between lg:justify-between items-center p-2 lg:p-8 "
            }
          >
            <Box
              className={"flex w-full justify-center lg:justify-start lg:w-1/3"}
            >
              <UserAvatarWithLevelInfo userId={userId as string} />
            </Box>
          </Group>
        </Paper>
      )}
      <SimpleGrid
        cols={{
          base: 2,
          lg: 4,
        }}
        className={"mt-10 w-full"}
      >
        <ProfileStatsDataIcon
          description={"Games"}
          icon={IconDeviceGamepad2}
          count={metricsOverviewQuery.data?.totalGames}
        />
        <ProfileStatsDataIcon
          description={"Collections"}
          icon={IconStack2}
          count={metricsOverviewQuery.data?.totalCollections}
        />
        <ProfileStatsDataIcon
          description={"Finished Games"}
          icon={IconListCheck}
          count={metricsOverviewQuery.data?.totalFinishedGames}
        />
        <ProfileStatsDataIcon
          description={"Estimated Playtime (in hours)*"}
          icon={IconClock}
          count={playtimeInHours}
        />
      </SimpleGrid>
      <DetailsBox
        enabled={metricsOverviewQuery.data != undefined}
        title={"Backlog"}
        withDimmedTitle
        stackProps={{
          className: "w-full mt-8",
        }}
      >
        {metricsOverviewQuery.data && (
          <Group className={"w-full"}>
            <BarChart
              h={80}
              data={[
                {
                  label: "Backlog tackling",
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
                  label: "Total",
                },
                {
                  name: "totalFinishedGames",
                  color: "red",
                  label: "Finished",
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
      </DetailsBox>
      <DetailsBox
        title={"Games by year"}
        withDimmedTitle
        stackProps={{
          className: "w-full mt-8 p-0",
        }}
      >
        <ProfileStatsDistributionLineByYear userId={userId as string} />
      </DetailsBox>
      <DetailsBox
        title={"Games by platform"}
        withDimmedTitle
        stackProps={{
          className: "w-full mt-12 p-0",
        }}
      >
        <ProfileStatsDistributionBarByType
          userId={userId as string}
          by={"platform"}
          orientation={"vertical"}
        />
      </DetailsBox>
      <DetailsBox
        title={"Library distribution"}
        withDimmedTitle
        stackProps={{
          className: "p-0 mt-12 w-full",
        }}
      >
        <SimpleGrid
          cols={{
            base: 1,
            lg: 2,
          }}
          className={"w-full"}
        >
          <ProfileStatsDistributionRadarByType userId={userId} by={"genre"} />
          <ProfileStatsDistributionRadarByType userId={userId} by={"theme"} />
          <ProfileStatsDistributionRadarByType userId={userId} by={"mode"} />
        </SimpleGrid>
      </DetailsBox>
    </Stack>
  );
};

export { ProfileStatsView };
