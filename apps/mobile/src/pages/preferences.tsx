import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonRouterLink,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Container, Stack } from "@mantine/core";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import PreferencesImporterItems from "@/components/preferences/importer/PreferencesImporterItems";
import { PreferencesWrappedItems } from "@/components/preferences/wrapped/PreferencesWrappedItems.tsx";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

const PreferencesPage = () => {
  return (
    <IonPage>
      <SessionAuth>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot={"start"}>
              <IonBackButton />
            </IonButtons>
            <IonTitle>Preferences</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ScrollableIonContent className={"ion-padding"}>
          <Stack className={"mb-4 p-0"}>
            <IonList className={"pt-0"}>
              <PreferencesProfileItems />
              <PreferencesConnectionsItems />
              <PreferencesImporterItems />
              <PreferencesWrappedItems />
            </IonList>
          </Stack>
        </ScrollableIonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default PreferencesPage;
