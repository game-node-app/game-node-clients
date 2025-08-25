import LibraryViewFab from "@/components/library/fab/LibraryViewFab";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  CollectionView,
  LibraryView,
  LibraryViewLayout,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

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

        <ScrollableIonContent
          className={"ion-padding"}
          fixedSlotPlacement={"before"}
        >
          {isOwnLibrary && <LibraryViewFab />}
          <LibraryViewLayout userId={userIdToUse} collectionId={collectionId}>
            {collectionId ? (
              <CollectionView
                libraryUserId={userIdToUse!}
                collectionId={collectionId}
              />
            ) : (
              <LibraryView libraryUserId={userIdToUse!} />
            )}
          </LibraryViewLayout>
        </ScrollableIonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default LibraryPage;
