import { useTranslation } from "@repo/locales";
import { PreferredPlatformsView } from "#@/components/preferred-platform/view/PreferredPlatformsView";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";

export function SettingsLibraryTab() {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t("settings.library.preferredPlatforms.title")}
      description={t("settings.library.preferredPlatforms.description")}
    >
      <SettingsCard withDividers={false} className={"p-5"}>
        <PreferredPlatformsView />
      </SettingsCard>
    </SettingsSection>
  );
}
