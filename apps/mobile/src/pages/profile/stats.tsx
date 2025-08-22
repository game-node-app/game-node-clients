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
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

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
      <ScrollableIonContent className={"ion-padding"}>
        <ProfileStatsView userId={userId} />
      </ScrollableIonContent>
    </IonPage>
  );
};

export default ProfileStatsPage;
