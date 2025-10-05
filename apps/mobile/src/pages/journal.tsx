import React from "react";
import { JournalOverviewView, useUserId, useUserProfile } from "@repo/ui";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { RouteComponentProps } from "react-router";
import { AppPage } from "@/components/general/AppPage.tsx";

interface Props {
  userId: string;
}

const JournalPage = ({ userId }: Props) => {
  const ownUserId = useUserId();

  const profileQuery = useUserProfile(userId);
  const isOwnJournal = userId === ownUserId;

  return (
    <AppPage>
      <JournalOverviewView userId={userId} />
    </AppPage>
  );
};

export { JournalPage };
