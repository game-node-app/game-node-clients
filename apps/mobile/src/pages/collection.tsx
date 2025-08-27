import React from "react";
import {
  CollectionView,
  LibraryView,
  LibraryViewLayout,
  useCollection,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab.tsx";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher.tsx";

interface Props {
  userId: string;
  collectionId: string;
}

const CollectionPage = ({ userId, collectionId }: Props) => {
  const ownUserId = useUserId();
  const isOwnLibrary = userId === ownUserId;

  const profileQuery = useUserProfile(userId);
  const collectionQuery = useCollection(collectionId);

  return (
    <IonPage>
      <SessionAuth requireAuth={userId == undefined}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot={"start"}>
              <IonBackButton />
            </IonButtons>
            {isOwnLibrary ? (
              <IonTitle>{collectionQuery.data?.name}</IonTitle>
            ) : (
              <IonTitle>
                {collectionQuery.data?.name} -{" "}
                {`${profileQuery.data?.username}`}
              </IonTitle>
            )}
            {collectionQuery.isLoading && (
              <IonProgressBar type="indeterminate" />
            )}
          </IonToolbar>
        </IonHeader>
        <ScrollableIonContent
          className={"ion-padding"}
          fixedSlotPlacement={"before"}
        >
          <LibraryViewRefresher userId={userId} collectionId={collectionId} />
          {isOwnLibrary && <LibraryViewFab />}
          <LibraryViewLayout userId={userId} collectionId={collectionId}>
            <CollectionView
              libraryUserId={userId}
              collectionId={collectionId}
            />
          </LibraryViewLayout>
        </ScrollableIonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default CollectionPage;
