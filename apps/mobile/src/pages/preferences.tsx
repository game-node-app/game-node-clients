import { AppPage } from "@/components/general/AppPage";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import PreferencesImporterItems from "@/components/preferences/importer/PreferencesImporterItems";
import PreferencesLibraryItems from "@/components/preferences/library/PreferencesLibraryItems";
import { PreferencesMiscItems } from "@/components/preferences/misc/PreferencesMiscItems";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import { IonList } from "@ionic/react";
import { Stack } from "@mantine/core";
import { Capacitor } from "@capacitor/core";
import { SessionAuth, SignInMethodsSection } from "@repo/ui";

const PreferencesPage = () => {
  return (
    <AppPage
      withSearch={false}
      contentProps={{
        className: "p-0",
      }}
    >
      <SessionAuth>
        <Stack className={"mb-4 p-0"}>
          <IonList className={"pt-0"}>
            <PreferencesProfileItems />
            <PreferencesLibraryItems />
            <PreferencesConnectionsItems />
            <PreferencesImporterItems />
            <PreferencesMiscItems />
          </IonList>
          <div className={"px-4"}>
            <SignInMethodsSection
              relativeCallbacks={Capacitor.isNativePlatform()}
            />
          </div>
        </Stack>
      </SessionAuth>
    </AppPage>
  );
};

export default PreferencesPage;
