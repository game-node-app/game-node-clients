import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Container } from "@mantine/core";
import React from "react";
import { ProfileStatsView } from "@repo/ui";

interface Props {
  userId: string;
}

const ProfileStatsPage = ({ userId }: Props) => {
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
      <IonContent className={"ion-padding"}>
        <ProfileStatsView userId={userId} />
      </IonContent>
    </IonPage>
  );
};

export default ProfileStatsPage;
