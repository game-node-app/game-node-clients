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
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage.tsx";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailPage = ({ userId, collectionEntryId }: Props) => {
  const profileQuery = useUserProfile(userId);

  return (
    <AppPage withSearch>
      <CollectionEntryDetailView
        userId={userId}
        collectionEntryId={collectionEntryId}
        withTitle={false}
        backgroundImageSize={ImageSize.SCREENSHOT_MED}
      />
    </AppPage>
  );
};

export default CollectionEntryDetailPage;
