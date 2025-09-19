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
  userId: string;
}

const LibraryPage = ({ userId }: Props) => {
  const ownUserId = useUserId();
  const isOwnLibrary = userId === ownUserId;

  const {
    routeInfo: { pathname },
  } = useIonRouter();

  const isInTab = pathname.split("/").length === 2;

  const profileQuery = useUserProfile(userId);

  return (
    <IonPage>
      <SessionAuth requireAuth={userId == undefined || userId === "undefined"}>
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

        <ScrollableIonContent
          className={"ion-padding"}
          fixedSlotPlacement={"before"}
        >
          <LibraryViewRefresher userId={userId!} />
          {isOwnLibrary && <LibraryViewFab />}
          <LibraryViewLayout userId={userId}>
            <LibraryView libraryUserId={userId!} />
          </LibraryViewLayout>
        </ScrollableIonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default LibraryPage;
