import React from "react";
import { Center, Stack } from "@mantine/core";
import { ActivityList, CenteredErrorMessage, CenteredLoading, TextLink, useActivity, useUserProfile } from "@repo/ui";
import { getTabAwareHref } from "@/util/getTabAwareHref";

interface Props {
    activityId: string;
}

const ActivityDetailView = ({ activityId }: Props) => {
    const activityQuery = useActivity(activityId);
    const profileQuery = useUserProfile(activityQuery.data?.profileUserId);

    if (activityQuery.isLoading || profileQuery.isLoading) {
        return <CenteredLoading message={"Loading activity..."} />;
    } else if (activityQuery.isError || profileQuery.isError) {
        return <CenteredErrorMessage message={"Failed to fetch activity. Please try again."} />;
    } else if (activityQuery.data == undefined) {
        return null;
    }

    return (
        <Stack className={"w-full"}>
            <ActivityList items={[activityQuery.data]} />
            <Center>
                <TextLink href={"/activity"}>See more</TextLink>
            </Center>
        </Stack>
    );
};

export default ActivityDetailView;
