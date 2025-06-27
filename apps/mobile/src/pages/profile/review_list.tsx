import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { Container } from "@mantine/core";
import {
  CenteredLoading,
  ProfileReviewListView,
  useUserProfile,
} from "@repo/ui";

interface Props {
  userId: string;
}

const ProfileReviewListPage = ({ userId }: Props) => {
  const profileQuery = useUserProfile(userId);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          {profileQuery.data && (
            <IonTitle>{profileQuery.data.username}&apos;s reviews</IonTitle>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        {profileQuery.isLoading && <CenteredLoading />}
        <ProfileReviewListView userId={userId} />
      </IonContent>
    </IonPage>
  );
};

export default ProfileReviewListPage;
