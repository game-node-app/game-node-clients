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
import { Center } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AchievementsScreen, useUserProfile } from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage.tsx";

interface Props {
  userId: string;
}

const AchievementsPage = ({ userId }: Props) => {
  const profileQuery = useUserProfile(userId);
  return (
    <AppPage withSearch>
      <AchievementsScreen targetUserId={userId} />
    </AppPage>
  );
};

export default AchievementsPage;
