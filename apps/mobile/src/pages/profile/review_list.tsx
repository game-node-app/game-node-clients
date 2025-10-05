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
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";

interface Props {
  userId: string;
}

const ProfileReviewListPage = ({ userId }: Props) => {
  const profileQuery = useUserProfile(userId);
  return (
    <AppPage>
      {profileQuery.isLoading && <CenteredLoading />}
      <ProfileReviewListView userId={userId} />
    </AppPage>
  );
};

export default ProfileReviewListPage;
