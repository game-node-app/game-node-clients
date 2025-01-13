import React from "react";
import { useRouter } from "next/router";
import {
    Box,
    Container,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import UserLevelInfo from "@/components/user-level/UserLevelInfo";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { useFeaturedObtainedAchievement } from "@/components/achievement/hooks/useFeaturedObtainedAchievement";
import ObtainedAchievementItem from "@/components/achievement/ObtainedAchievementItem";
import RoundedIcon from "@/components/general/RoundedIcon";
import {
    IconBrandXbox,
    IconClock,
    IconDeviceGamepad,
    IconDeviceGamepad2,
    IconListCheck,
    IconStack2,
} from "@tabler/icons-react";
import ProfileStatsDataIcon from "@/components/profile/view/stats/ProfileStatsDataIcon";
import { useProfileMetricsOverview } from "@/components/profile/hooks/useProfileMetricsOverview";
import { DetailsBox } from "@/components/general/DetailsBox";
import { BarChart } from "@mantine/charts";
import { useProfileMetricsDistributionByYear } from "@/components/profile/hooks/useProfileMetricsDistributionByYear";
import ProfileStatsDistributionLineByYear from "@/components/profile/view/stats/ProfileStatsDistributionLineByYear";
import ProfileStatsDistributionRadarByType from "@/components/profile/view/stats/ProfileStatsDistributionRadarByType";
import ProfileStatsDistributionBarByType from "@/components/profile/view/stats/ProfileStatsDistributionBarByType";
import { NextPageContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { ProfileMetricsService } from "@/wrapper/server";
import Link from "next/link";
import UserAvatarWithLevelInfo from "@/components/general/avatar/UserAvatarWithLevelInfo";

const DateFormatter = new Intl.DateTimeFormat("en-us");

export const getServerSideProps = async (context: NextPageContext) => {
    const query = context.query;
    const userId = query.userId as string;

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["profile", "metrics", userId],
        queryFn: async () => {
            return ProfileMetricsService.profileMetricsControllerGetStatsOverviewV1(
                userId,
            );
        },
    });

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
};

const Index = () => {
    const { query } = useRouter();
    const userId = query.userId as string;

    const onMobile = useOnMobile();

    const profileQuery = useUserProfile(userId);

    const metricsOverviewQuery = useProfileMetricsOverview(userId);

    const featuredAchievementQuery = useFeaturedObtainedAchievement(userId);

    const playtimeInHours = metricsOverviewQuery.data?.totalEstimatedPlaytime
        ? Math.ceil(metricsOverviewQuery.data?.totalEstimatedPlaytime / 3600)
        : 0;

    return (
        <Container className={"w-full h-full p-0 mb-12"}>
            <Paper className={"bg-[#161616]"}>
                <Group
                    className={
                        "w-full h-full flex-nowrap justify-between lg:justify-between items-center p-2 lg:p-8 "
                    }
                >
                    <Box
                        className={
                            "flex w-full justify-center lg:justify-start lg:w-1/3"
                        }
                    >
                        <UserAvatarWithLevelInfo userId={userId} />
                    </Box>

                    {!onMobile && featuredAchievementQuery.data && (
                        <Group className={"w-1/3"}>
                            <ObtainedAchievementItem
                                targetUserId={userId}
                                achievementId={
                                    featuredAchievementQuery.data.achievementId
                                }
                            />
                        </Group>
                    )}
                </Group>
            </Paper>
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
                <ProfileStatsDistributionLineByYear userId={userId} />
            </DetailsBox>
            <DetailsBox
                title={"Games by platform"}
                withDimmedTitle
                stackProps={{
                    className: "w-full mt-12 p-0",
                }}
            >
                <ProfileStatsDistributionBarByType
                    userId={userId}
                    by={"platform"}
                    orientation={onMobile ? "vertical" : "horizontal"}
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
                    <ProfileStatsDistributionRadarByType
                        userId={userId}
                        by={"genre"}
                    />
                    <ProfileStatsDistributionRadarByType
                        userId={userId}
                        by={"theme"}
                    />
                    <ProfileStatsDistributionRadarByType
                        userId={userId}
                        by={"mode"}
                    />
                </SimpleGrid>
            </DetailsBox>
        </Container>
    );
};

export default Index;
