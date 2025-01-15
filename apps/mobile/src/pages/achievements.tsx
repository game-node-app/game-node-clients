import React from "react";

import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Center } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AchievementsScreen, useUserProfile } from "@repo/ui";

interface Props {
    userId: string;
}

const AchievementsPage = ({ userId }: Props) => {
    const profileQuery = useUserProfile(userId);
    return (
        <IonPage>
            <SessionAuth requireAuth={userId == undefined}>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot={"start"}>
                            <IonBackButton />
                        </IonButtons>
                        {profileQuery.data && <IonTitle>{profileQuery.data.username}&apos;s achievements</IonTitle>}
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Center>
                        <AchievementsScreen targetUserId={userId} />
                    </Center>
                </IonContent>
            </SessionAuth>
        </IonPage>
    );
};

export default AchievementsPage;
