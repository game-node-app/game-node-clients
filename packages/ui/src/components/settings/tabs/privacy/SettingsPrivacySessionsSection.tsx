import { useTranslation } from "@repo/locales";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsPrivacySection } from "#@/components/settings/settingsTabs";
import { SettingsSessionsCard } from "#@/components/settings/tabs/privacy/SettingsSessionsCard";
import { SettingsSignInMethodsCard } from "#@/components/settings/tabs/privacy/SettingsSignInMethodsCard";

/** Sign-in methods and active sessions. */
export function SettingsPrivacySessionsSection() {
  const { t } = useTranslation();

  return (
    <SettingsSection
      sectionId={"sessions" satisfies SettingsPrivacySection}
      title={t("settings.privacy.sections.sessions")}
      description={t("settings.privacy.signIn.description")}
    >
      <SettingsSignInMethodsCard />
      <SettingsSessionsCard />
    </SettingsSection>
  );
}
