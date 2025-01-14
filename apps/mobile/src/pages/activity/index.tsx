import React, { useState } from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonToolbar,
} from "@ionic/react";
import { ActivityFeedTabValue } from "@/components/activity/ActivityFeedLayout";
import { Container } from "@mantine/core";
import ActivityFeed from "@/components/activity/ActivityFeed";

const ActivityPage = () => {
    const [selectedActivityTab, setSelectedActivityTab] = useState<ActivityFeedTabValue>("all");

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot={"start"}>
                        <IonBackButton />
                    </IonButtons>
                    <IonSegment
                        value={selectedActivityTab}
                        onIonChange={(evt) =>
                            setSelectedActivityTab((evt.detail.value as ActivityFeedTabValue) ?? "all")
                        }
                    >
                        <IonSegmentButton value="all">
                            <IonLabel>All</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="following">
                            <IonLabel>Following</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className={"my-4"}>
                    <ActivityFeed criteria={selectedActivityTab} />
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default ActivityPage;
