import React from "react";
import { JournalOverviewView, useUserId, useUserProfile } from "@repo/ui";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { RouteComponentProps } from "react-router";

interface Props {
  userId: string;
}

const JournalPage = ({ userId }: Props) => {
  const ownUserId = useUserId();

  const profileQuery = useUserProfile(userId);
  const isOwnJournal = userId === ownUserId;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>
            {isOwnJournal
              ? "Your Journal"
              : `${profileQuery.data?.username}'s Journal`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
        <JournalOverviewView userId={userId} />
      </ScrollableIonContent>
    </IonPage>
  );
};

export { JournalPage };
