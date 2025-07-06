import { DetailsBox } from "@/components/general/DetailsBox";
import LibraryViewFab from "@/components/library/fab/LibraryViewFab";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { Container } from "@mantine/core";
import React from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  LibraryView,
  RecentCollectionEntriesView,
  useUserId,
  useUserProfile,
  LibraryHomeView,
} from "@repo/ui";
import { CollectionView } from "@/components/collection/view/CollectionView";

interface Props {
  userId?: string;
  /**
   * Routed collectionId. Only available when a user enters a direct
   * link to a collection.
   */
  collectionId?: string;
}

const LibraryPage = ({ userId, collectionId }: Props) => {
  const ownUserId = useUserId();
  const userIdToUse =
    userId == undefined && ownUserId != undefined ? ownUserId : userId;
  const isOwnLibrary = userIdToUse === ownUserId;

  const {
    routeInfo: { pathname },
  } = useIonRouter();

  const isInTab = pathname.split("/").length === 2;

  const profileQuery = useUserProfile(userIdToUse);

  return (
    <IonPage>
      <SessionAuth requireAuth={userId == undefined}>
        {isInTab && isOwnLibrary ? null : (
          <IonHeader>
            <IonToolbar>
              <IonButtons slot={"start"}>
                <IonBackButton />
              </IonButtons>
              {isOwnLibrary ? (
                <IonTitle>Your library</IonTitle>
              ) : (
                <IonTitle>
                  {`${profileQuery.data?.username}`}&apos;s library
                </IonTitle>
              )}
            </IonToolbar>
          </IonHeader>
        )}

        <IonContent className={"ion-padding"}>
          {isOwnLibrary && (
            <LibraryViewFab selectedCollectionId={collectionId} />
          )}
          <LibraryView userId={userIdToUse} collectionId={collectionId}>
            {collectionId ? (
              <CollectionView
                libraryUserId={userIdToUse!}
                collectionId={collectionId}
              />
            ) : (
              <LibraryHomeView userId={userIdToUse!} />
            )}
          </LibraryView>
        </IonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default LibraryPage;
