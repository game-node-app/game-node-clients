import { AppPage } from "@/components/general/AppPage";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import PreferencesCustomCoversItems from "@/components/preferences/covers/PreferencesCustomCoversItems";
import PreferencesImporterItems from "@/components/preferences/importer/PreferencesImporterItems";
import PreferencesLibraryItems from "@/components/preferences/library/PreferencesLibraryItems";
import { PreferencesMiscItems } from "@/components/preferences/misc/PreferencesMiscItems";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import PreferencesSupporterItems from "@/components/preferences/supporter/PreferencesSupporterItems";
import PreferencesSignInMethodsItems from "@/components/preferences/auth/PreferencesSignInMethodsItems";
import { useTranslation } from "@repo/locales";
import { SessionAuth } from "@repo/ui";

const PreferencesPage = () => {
  const { t } = useTranslation();

  return (
    <AppPage
      withSearch={false}
      title={t("navigation.settings")}
      contentProps={{
        className: "p-0",
      }}
    >
      <SessionAuth>
        {/* Each block is a CardSection card; the gap between them lives here only. */}
        <div className="flex flex-col gap-6 pb-32 pt-2">
          <PreferencesSupporterItems />
          <PreferencesProfileItems />
          <PreferencesLibraryItems />
          <PreferencesCustomCoversItems />
          <PreferencesConnectionsItems />
          <PreferencesImporterItems />
          <PreferencesSignInMethodsItems />
          <PreferencesMiscItems />
        </div>
      </SessionAuth>
    </AppPage>
  );
};

export default PreferencesPage;
