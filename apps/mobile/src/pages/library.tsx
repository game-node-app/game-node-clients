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
import { AppPage } from "@/components/general/AppPage.tsx";

interface Props {
  userId?: string;
}

const LibraryPage = (props: Props) => {
  const ownUserId = useUserId();
  const isOwnLibrary = props.userId === ownUserId;
  const userId = props.userId ?? ownUserId;

  const {
    routeInfo: { pathname },
  } = useIonRouter();

  const isInTab = pathname.split("/").length === 2;

  const profileQuery = useUserProfile(userId);

  return (
    <AppPage
      withMenuButton
      withSearch
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <SessionAuth
        requireAuth={props.userId == undefined || props.userId === "undefined"}
      >
        <LibraryViewRefresher userId={userId!} />
        {isOwnLibrary && <LibraryViewFab />}
        <LibraryViewLayout userId={userId}>
          <LibraryView libraryUserId={userId!} />
        </LibraryViewLayout>
      </SessionAuth>
    </AppPage>
  );
};

export default LibraryPage;
