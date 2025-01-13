"use client";

import { Flex, Grid, GridCol } from "@mantine/core";
import ActiveUsersSection from "@/components/dashboard/ActiveUsersSection";
import UserJoinSection from "@/components/dashboard/UserJoinSection";
import ActivitySection from "@/components/dashboard/ActivitySection";

export function DashboardContent() {
    return (
        <Grid>
            <GridCol span={{ sm: 12, md: 12, lg: 4 }}>
                <ActiveUsersSection />
            </GridCol>
            <GridCol span={{ sm: 12, md: 12, lg: 8 }}>
                <UserJoinSection />
            </GridCol>
            <GridCol span={{ sm: 12, md: 12, lg: 12 }}>
                <ActivitySection />
            </GridCol>
        </Grid>
    );
}
