import { AppPage } from "@/components/general/AppPage";
import { CardSection } from "@/components/general/card";
import PreferencesSignInMethodsItems from "@/components/preferences/auth/PreferencesSignInMethodsItems";
import PreferencesConnectionsItems from "@/components/preferences/connections/PreferencesConnectionsItems";
import PreferencesAppearanceItems from "@/components/preferences/appearance/PreferencesAppearanceItems";
import PreferencesLibraryItems from "@/components/preferences/library/PreferencesLibraryItems";
import { PreferencesMiscItems } from "@/components/preferences/misc/PreferencesMiscItems";
import PreferencesProfileItems from "@/components/preferences/profile/PreferencesProfileItems";
import PreferencesSupporterItems from "@/components/preferences/supporter/PreferencesSupporterItems";
import { useTranslation } from "@repo/locales";
import { SessionAuth } from "@repo/ui";

const PreferencesPage = () => {
  const { t } = useTranslation();

  return (
    <AppPage withSearch={false} title={t("navigation.settings")}>
      <SessionAuth>
        {/*
          Supporter is a promo entry point, so it stays on its own at the top. The rest is grouped
          into four cards. The gap between blocks lives here only, and the horizontal gutter is
          AppPage's `ion-padding`.
        */}
        <div className="flex flex-col gap-6 pb-32">
          <PreferencesSupporterItems />
          <CardSection title={t("preferences.categories.account")}>
            <PreferencesProfileItems />
            <PreferencesSignInMethodsItems />
          </CardSection>
          <CardSection title={t("mobile.preferences.libraryAndDisplay")}>
            <PreferencesLibraryItems />
            <PreferencesAppearanceItems />
          </CardSection>
          <CardSection title={t("mobile.preferences.platformsAndImport")}>
            <PreferencesConnectionsItems />
          </CardSection>
          <CardSection title={t("mobile.preferences.appsAndTools")}>
            <PreferencesMiscItems />
          </CardSection>
        </div>
      </SessionAuth>
    </AppPage>
  );
};

export default PreferencesPage;
