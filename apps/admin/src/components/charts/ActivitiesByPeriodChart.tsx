import React, { useMemo } from "react";
import { Activity } from "@repo/wrapper/server";
import ActivityType = Activity.type;
import { match } from "ts-pattern";
import CenteredLoading from "@/components/general/CenteredLoading";
import { BarChart } from "@mantine/charts";
import { useLatestActivities } from "@repo/ui";

interface ActivityPeriodItem {
  // MM/YYYY
  period: string;
  collectionEntryCount: number;
  reviewCount: number;
  followCount: number;
  postsCount: number;
}

const activitiesToChartData = (activities: Activity[]) => {
  const periodMap = new Map<string, ActivityPeriodItem>();

  // Sort by createdAt ASC
  // (meaning latest activities will be at the end of the chart)
  const sortedActivities = activities.toSorted((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  for (const activity of sortedActivities) {
    const createdAt = new Date(activity.createdAt);
    const createdAtMonth = `${createdAt.getMonth() + 1}`.padStart(2, "0");
    const periodString = `${createdAtMonth}/${createdAt.getFullYear()}`;
    const targetProperty: keyof ActivityPeriodItem = match<
      ActivityType,
      keyof ActivityPeriodItem
    >(activity.type)
      .with(ActivityType.COLLECTION_ENTRY, () => "collectionEntryCount")
      .with(ActivityType.REVIEW, () => "reviewCount")
      .with(ActivityType.FOLLOW, () => "followCount")
      .with(ActivityType.POST, () => "postsCount")
      .exhaustive();

    const periodValue = periodMap.get(periodString);
    if (periodValue == undefined) {
      const item: ActivityPeriodItem = {
        period: periodString,
        collectionEntryCount: 0,
        followCount: 0,
        reviewCount: 0,
        postsCount: 0,
        [targetProperty]: 1,
      };
      periodMap.set(periodString, item);
      continue;
    }

    const updatedItem: ActivityPeriodItem = {
      ...periodValue,
      [targetProperty]: (periodValue[targetProperty] as number) + 1,
    };

    periodMap.set(periodString, updatedItem);
  }

  return Array.from(periodMap.values());
};

const ActivitiesByPeriodChart = () => {
  const { isLoading, data } = useLatestActivities(undefined, 0, 9999999);

  const chartData = useMemo<ActivityPeriodItem[] | undefined>(() => {
    if (data) {
      return activitiesToChartData(data.data);
    }

    return undefined;
  }, [data]);

  if (isLoading) {
    return <CenteredLoading message={"Loading..."} />;
  } else if (!chartData) {
    return;
  }

  return (
    <BarChart
      h={300}
      data={chartData}
      dataKey="period"
      series={[
        {
          name: "collectionEntryCount",
          label: "Game added to collection",
          color: "violet.6",
        },
        {
          name: "reviewCount",
          label: "Review created",
          color: "blue.6",
        },
        { name: "followCount", label: "User follow", color: "teal.6" },
      ]}
      tickLine="y"
    />
  );
};

export default ActivitiesByPeriodChart;
