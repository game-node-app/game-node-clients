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
  LibraryView,
  LibraryViewLayout,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { LibraryViewRefresher } from "@/components/library/LibraryViewRefresher.tsx";

interface Props {
  userId?: string;
}

const LibraryPage = ({ userId }: Props) => {
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
          <LibraryViewRefresher userId={userIdToUse!} />
          {isOwnLibrary && <LibraryViewFab />}
          <LibraryViewLayout userId={userIdToUse} collectionId={undefined}>
            <LibraryView libraryUserId={userIdToUse!} />
          </LibraryViewLayout>
        </ScrollableIonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default LibraryPage;
