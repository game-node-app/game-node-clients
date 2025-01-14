import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import React from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonProgressBar,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useActivity } from "@/components/activity/hooks/useActivity";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { Container, Stack } from "@mantine/core";
import ActivityDetailView from "@/components/activity/ActivityDetailView";

interface Props {
    activityId: string;
}

const ActivityDetailPage = ({ activityId }: Props) => {
    const activityQuery = useActivity(activityId);
    const profileQuery = useUserProfile(activityQuery.data?.profileUserId);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot={"start"}>
                        <IonBackButton />
                    </IonButtons>
                    <IonTitle>{profileQuery.data?.username}&apos;s activity</IonTitle>
                    {(activityQuery.isLoading || profileQuery.isLoading) && <IonProgressBar type={"indeterminate"} />}
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className={"my-4"}>
                    <Stack className={"w-full h-full"}>
                        {(activityQuery.isError || profileQuery.isError) && (
                            <CenteredErrorMessage message={"Failed to fetch activity. Please try again."} />
                        )}
                        <ActivityDetailView activityId={activityId} />
                    </Stack>
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default ActivityDetailPage;
