import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Container, Stack } from "@mantine/core";
import { ImporterScreen, getCapitalizedText } from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  source: string;
}

const ImporterBySourcePage = ({ source }: Props) => {
  const queryClient = useQueryClient();

  return (
    <AppPage>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises: Promise<unknown>[] = [
            queryClient.invalidateQueries({
              queryKey: ["importer", "entries", "unprocessed"],
            }),
          ];

          await Promise.all(promises);

          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Stack className={"mb-8 min-h-screen"}>
        <ImporterScreen source={source} />
      </Stack>
    </AppPage>
  );
};

export default ImporterBySourcePage;
