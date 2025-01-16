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
import { Container } from "@mantine/core";
import { ImporterScreen, getCapitalizedText } from "@repo/ui";

interface Props {
  source: string;
}

const ImporterBySourcePage = ({ source }: Props) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Import games from {getCapitalizedText(source)}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container fluid className={"mb-4 min-h-screen"}>
          <ImporterScreen source={source} />
        </Container>
      </IonContent>
    </IonPage>
  );
};

export default ImporterBySourcePage;
