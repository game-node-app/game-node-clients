import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Container } from "@mantine/core";
import React from "react";
import { ProfileStatsView } from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";

interface Props {
  userId: string;
}

const ProfileStatsPage = ({ userId }: Props) => {
  return (
    <AppPage>
      <ProfileStatsView userId={userId} />
    </AppPage>
  );
};

export default ProfileStatsPage;
