import React from "react";
import type { ProfileMetricsTypeDistributionItem } from "@repo/wrapper/server";
import { BarChart, BarChartProps } from "@mantine/charts";
import { useTranslation } from "@repo/locales";

interface Props extends Omit<BarChartProps, "data" | "dataKey" | "series"> {
  distribution: Array<ProfileMetricsTypeDistributionItem>;
}

const ProfileStatsDistributionByTypeChart = ({
  distribution,
  ...others
}: Props) => {
  const { t } = useTranslation();
  return (
    <BarChart
      h={300}
      barProps={{
        barSize: 30,
        height: 30,
      }}
      {...others}
      data={distribution}
      dataKey={"criteriaName"}
      series={[
        { name: "count", color: "blue", label: t("profile.stats.total") },
        {
          name: "finishedCount",
          color: "red",
          label: t("profile.stats.finishedGames"),
        },
      ]}
    />
  );
};

export { ProfileStatsDistributionByTypeChart };
