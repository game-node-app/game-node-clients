import React from "react";

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Center } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AchievementsScreen, useUserProfile } from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

interface Props {
  userId: string;
}

const AchievementsPage = ({ userId }: Props) => {
  const profileQuery = useUserProfile(userId);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          {profileQuery.data && (
            <IonTitle>
              {profileQuery.data.username}&apos;s achievements
            </IonTitle>
          )}
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
        <AchievementsScreen targetUserId={userId} />
      </ScrollableIonContent>
    </IonPage>
  );
};

export default AchievementsPage;
