import UserAvatarWithLevelInfo from "@/components/general/avatar/UserAvatarWithLevelInfo";
import { DetailsBox } from "@/components/general/DetailsBox";
import { useProfileMetricsOverview } from "@/components/profile/hooks/useProfileMetricsOverview";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import ProfileStatsDataIcon from "@/components/profile/view/stats/ProfileStatsDataIcon";
import ProfileStatsDistributionBarByType from "@/components/profile/view/stats/ProfileStatsDistributionBarByType";
import ProfileStatsDistributionLineByYear from "@/components/profile/view/stats/ProfileStatsDistributionLineByYear";
import ProfileStatsDistributionRadarByType from "@/components/profile/view/stats/ProfileStatsDistributionRadarByType";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Box, Container, Group, Paper, SimpleGrid } from "@mantine/core";
import { BarChart } from "@mantine/charts";

import { IconDeviceGamepad2, IconStack2, IconListCheck, IconClock } from "@tabler/icons-react";
import React from "react";

interface Props {
    userId: string;
}

const ProfileStatsPage = ({ userId }: Props) => {
    const profileQuery = useUserProfile(userId);

    const metricsOverviewQuery = useProfileMetricsOverview(userId);

    const playtimeInHours = metricsOverviewQuery.data?.totalEstimatedPlaytime
        ? Math.ceil(metricsOverviewQuery.data?.totalEstimatedPlaytime / 3600)
        : 0;

    console.log("On profile stats: ", userId);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot={"start"}>
                        <IonBackButton />
                    </IonButtons>
                    <IonTitle>Profile Stats</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className="">
                    <Paper className={"bg-[#161616]"}>
                        <Group
                            className={
                                "w-full h-full flex-nowrap justify-between lg:justify-between items-center p-2 lg:p-8 "
                            }
                        >
                            <Box className={"flex w-full justify-center lg:justify-start lg:w-1/3"}>
                                <UserAvatarWithLevelInfo userId={userId} />
                            </Box>
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
                                            totalGames: metricsOverviewQuery.data.totalGames,
                                            totalFinishedGames: metricsOverviewQuery.data.totalFinishedGames,
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
                        <ProfileStatsDistributionBarByType userId={userId} by={"platform"} orientation={"vertical"} />
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
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default ProfileStatsPage;
