import React from "react";
import { IonList } from "@ionic/react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Stack } from "@mantine/core";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import PreferencesImporterItems from "@/components/preferences/importer/PreferencesImporterItems";
import { PreferencesWrappedItems } from "@/components/preferences/wrapped/PreferencesWrappedItems.tsx";
import { AppPage } from "@/components/general/AppPage";

const PreferencesPage = () => {
  return (
    <AppPage withSearch={false}>
      <SessionAuth>
        <Stack className={"mb-4 p-0"}>
          <IonList className={"pt-0"}>
            <PreferencesProfileItems />
            <PreferencesConnectionsItems />
            <PreferencesImporterItems />
            <PreferencesWrappedItems />
          </IonList>
        </Stack>
      </SessionAuth>
    </AppPage>
  );
};

export default PreferencesPage;
