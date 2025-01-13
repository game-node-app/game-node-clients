import React from "react";
import { Center, Stack } from "@mantine/core";
import ActivityList from "@/components/activity/ActivityList";
import { useActivity } from "@/components/activity/hooks/useActivity";
import CenteredLoading from "@/components/general/CenteredLoading";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { DetailsBox } from "@/components/general/DetailsBox";
import TextLink from "@/components/general/TextLink";

interface Props {
    activityId: string;
}

const ActivityDetailView = ({ activityId }: Props) => {
    const activityQuery = useActivity(activityId);
    const profileQuery = useUserProfile(activityQuery.data?.profileUserId);

    if (activityQuery.isLoading || profileQuery.isLoading) {
        return <CenteredLoading message={"Loading activity..."} />;
    } else if (activityQuery.isError || profileQuery.isError) {
        return (
            <CenteredErrorMessage
                message={"Failed to fetch activity. Please try again."}
            />
        );
    } else if (activityQuery.data == undefined) {
        return null;
    }

    return (
        <Stack className={"w-full"}>
            <DetailsBox
                title={`${profileQuery.data?.username}'s Activity`}
                stackProps={{
                    className: "",
                }}
            >
                <ActivityList items={[activityQuery.data]} />
            </DetailsBox>
            <Center>
                <TextLink href={"/activity/all"}>See more </TextLink>
            </Center>
        </Stack>
    );
};

export default ActivityDetailView;
