import React, { useMemo } from "react";
import { useUserProfiles } from "@/components/profile/hooks/useUserProfiles";
import CenteredLoading from "@/components/general/CenteredLoading";
import { LineChart, LineChartProps } from "@mantine/charts";
import { Profile } from "@/wrapper/server";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

interface JoinPeriodItem {
    createdAt: string;
    count: number;
}

const profileToPeriodItems = (profiles: Profile[]): JoinPeriodItem[] => {
    const periodMap = new Map<string, number>();

    // Sort by createdAt ASC
    // (meaning newer users will be at the end of the chart)
    const sortedProfiles = profiles.toSorted((a, b) => {
        const createDateA = new Date(a.createdAt);
        const createDateB = new Date(b.createdAt);

        return createDateA.getTime() - createDateB.getTime();
    });

    for (const profile of sortedProfiles) {
        const createdAtDate = new Date(profile.createdAt);
        const createdAtMonth = `${createdAtDate.getMonth() + 1}`.padStart(
            2,
            "0",
        );
        const periodString = `${createdAtMonth}/${createdAtDate.getFullYear()}`;
        const periodValue = periodMap.get(periodString);

        if (periodValue == undefined) {
            periodMap.set(periodString, 1);
            continue;
        }

        periodMap.set(periodString, periodValue + 1);
    }

    return Array.from(periodMap.entries()).map(([k, v]): JoinPeriodItem => {
        return {
            createdAt: k,
            count: v,
        };
    });
};

type Props = Omit<LineChartProps, "data" | "series" | "dataKey">;

const UserJoinPeriodChart = ({ ...others }: Props) => {
    const { isLoading, data, isError } = useUserProfiles();

    const profiles = useMemo(() => {
        if (!data) return [];
        return data.map((item) => item.profile);
    }, [data]);

    const chartData = useMemo<JoinPeriodItem[] | undefined>(() => {
        if (profiles) {
            return profileToPeriodItems(profiles);
        }

        return undefined;
    }, [profiles]);

    if (isLoading) {
        return <CenteredLoading message={"Loading..."} />;
    } else if (isError) {
        return (
            <CenteredErrorMessage
                message={"Failed to load users. Please try again."}
            />
        );
    } else if (chartData == undefined) {
        return null;
    }

    return (
        <LineChart
            h={250}
            w={"100%"}
            {...others}
            data={chartData}
            dataKey="createdAt"
            series={[{ name: "count", label: "Users", color: "indigo.6" }]}
            curveType="linear"
        />
    );
};

export default UserJoinPeriodChart;
