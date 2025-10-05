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
import { Container, Stack } from "@mantine/core";
import { ImporterScreen, getCapitalizedText } from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";

interface Props {
  source: string;
}

const ImporterBySourcePage = ({ source }: Props) => {
  return (
    <AppPage>
      <Stack className={"mb-8 min-h-screen"}>
        <ImporterScreen source={source} />
      </Stack>
    </AppPage>
  );
};

export default ImporterBySourcePage;
