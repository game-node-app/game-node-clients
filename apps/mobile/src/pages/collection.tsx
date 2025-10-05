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
import { AppPage } from "@/components/general/AppPage.tsx";

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
    <AppPage
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <SessionAuth requireAuth={userId == undefined}>
        <LibraryViewRefresher userId={userId} collectionId={collectionId} />
        {isOwnLibrary && <LibraryViewFab />}
        <LibraryViewLayout userId={userId} collectionId={collectionId}>
          <CollectionView libraryUserId={userId} collectionId={collectionId} />
        </LibraryViewLayout>
      </SessionAuth>
    </AppPage>
  );
};

export default CollectionPage;
