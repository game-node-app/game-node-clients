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
import { CollectionEntryDetailView, ImageSize, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailPage = ({ userId, collectionEntryId }: Props) => {
  const profileQuery = useUserProfile(userId);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>
            {profileQuery.data != undefined
              ? `${profileQuery.data?.username}'s Collection Entry`
              : ""}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        <CollectionEntryDetailView
          userId={userId}
          collectionEntryId={collectionEntryId}
          withTitle={false}
          backgroundImageSize={ImageSize.SCREENSHOT_MED}
        />
      </IonContent>
    </IonPage>
  );
};

export default CollectionEntryDetailPage;
