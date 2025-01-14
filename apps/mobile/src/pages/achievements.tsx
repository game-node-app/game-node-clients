import React from "react";

import AchievementsScreen from "@/components/achievement/AchievementsScreen";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Center } from "@mantine/core";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

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
