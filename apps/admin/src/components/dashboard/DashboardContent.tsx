"use client";

import ActiveUsersSection from "@/components/dashboard/ActiveUsersSection";
import ActivitySection from "@/components/dashboard/ActivitySection";
import UserJoinSection from "@/components/dashboard/UserJoinSection";
import { Grid, GridCol } from "@mantine/core";

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
