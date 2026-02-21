import React, { useMemo } from "react";
import {
  BaseRecapStatsProps,
  ProfileStatsDistributionByTypeChart,
  ProfileStatsDistributionRadarByTypeChart,
  useRecap,
  useUrlState,
} from "#@/components";
import { Flex, Group, Radio, SimpleGrid, Stack, Switch } from "@mantine/core";

const RecapStatsChartsSection = ({
  userId,
  targetYear,
}: BaseRecapStatsProps) => {
  const { data: recap } = useRecap(userId, targetYear);

  const [params, setParams] = useUrlState<{
    graphType: "radar" | "vertical-bar" | "horizontal-bar";
  }>({
    graphType: "radar",
  });

  const distributions = useMemo(() => {
    if (recap == undefined) {
      return [];
    }

    return [
      recap.distributionByGenre,
      recap.distributionByMode,
      recap.distributionByPlatform,
      recap.distributionByTheme,
    ];
  }, [recap]);

  const TargetGraph =
    params.graphType === "radar"
      ? ProfileStatsDistributionRadarByTypeChart
      : ProfileStatsDistributionByTypeChart;

  return (
    <Stack className={"w-full"}>
      <Flex className={"gap-3 lg:me-3 flex-row justify-center lg:justify-end"}>
        <Radio.Group
          label={"Pick your graph type"}
          name={"graphType"}
          value={params.graphType}
          onChange={(value) => setParams({ graphType: value as never })}
        >
          <Flex className={"flex-col lg:flex-row gap-2"}>
            <Radio value={"radar"} label={"Radar"}></Radio>
            <Radio value={"vertical-bar"} label={"Vertical Bar"}></Radio>
            <Radio value={"horizontal-bar"} label={"Horizontal Bar"}></Radio>
          </Flex>
        </Radio.Group>
      </Flex>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {distributions.map((distribution, index) => (
          <TargetGraph
            key={index}
            distribution={distribution}
            orientation={
              params.graphType === "horizontal-bar" ? "horizontal" : "vertical"
            }
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export { RecapStatsChartsSection };
