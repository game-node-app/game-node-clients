import { AppPage } from "@/components/general/AppPage";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import PreferencesCustomCoversItems from "@/components/preferences/covers/PreferencesCustomCoversItems";
import PreferencesImporterItems from "@/components/preferences/importer/PreferencesImporterItems";
import PreferencesLibraryItems from "@/components/preferences/library/PreferencesLibraryItems";
import { PreferencesMiscItems } from "@/components/preferences/misc/PreferencesMiscItems";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import PreferencesSupporterItems from "@/components/preferences/supporter/PreferencesSupporterItems";
import { IonList } from "@ionic/react";
import PreferencesSignInMethodsItems from "@/components/preferences/auth/PreferencesSignInMethodsItems";
import { SessionAuth } from "@repo/ui";

const PreferencesPage = () => {
  return (
    <AppPage
      withSearch={false}
      contentProps={{
        className: "p-0",
      }}
    >
      <SessionAuth>
        <IonList className={"pt-0 mb-4"}>
          <PreferencesSupporterItems />
          <PreferencesProfileItems />
          <PreferencesLibraryItems />
          <PreferencesCustomCoversItems />
          <PreferencesConnectionsItems />
          <PreferencesImporterItems />
          <PreferencesSignInMethodsItems />
          <PreferencesMiscItems />
        </IonList>
      </SessionAuth>
    </AppPage>
  );
};

export default PreferencesPage;
