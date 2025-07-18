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
import {
  CollectionEntryDetailView,
  getSizedImageUrl,
  ImageSize,
  useCollectionEntry,
  useGame,
  useUserProfile,
} from "@repo/ui";
import { Stack } from "@mantine/core";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailPage = ({ userId, collectionEntryId }: Props) => {
  const collectionEntryQuery = useCollectionEntry(collectionEntryId as string);

  const gameId = collectionEntryQuery.data?.gameId;

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
      screenshots: true,
    },
  });

  const profileQuery = useUserProfile(userId);

  const backgroundImageUrl = getSizedImageUrl(
    gameQuery.data?.screenshots?.at(0)?.url,
    ImageSize.SCREENSHOT_HUGE,
  );

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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "60vh",
            backgroundImage: `
              linear-gradient(180deg,rgba(0, 0, 0, 0.1) 0%, rgba(10, 10, 10, 0.6) 34%, rgba(25, 25, 25, 1) 87%), 
              url(${backgroundImageUrl})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: -10,
            opacity: 0.6,
          }}
        />
        <CollectionEntryDetailView
          userId={userId}
          collectionEntryId={collectionEntryId}
          withTitle={false}
        />
      </IonContent>
    </IonPage>
  );
};

export default CollectionEntryDetailPage;
