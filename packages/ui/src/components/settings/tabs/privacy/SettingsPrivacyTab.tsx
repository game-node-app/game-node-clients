import { SettingsPrivacyBlockedSection } from "#@/components/settings/tabs/privacy/SettingsPrivacyBlockedSection";
import { SettingsPrivacyDangerSection } from "#@/components/settings/tabs/privacy/SettingsPrivacyDangerSection";
import { SettingsPrivacyInteractionsSection } from "#@/components/settings/tabs/privacy/SettingsPrivacyInteractionsSection";
import { SettingsPrivacySessionsSection } from "#@/components/settings/tabs/privacy/SettingsPrivacySessionsSection";
import { SettingsPrivacyVisibilitySection } from "#@/components/settings/tabs/privacy/SettingsPrivacyVisibilitySection";

/**
 * Privacy and security. Sections follow `SETTINGS_PRIVACY_SECTIONS` order, so
 * the sidebar sub-items and the scroll-spy line up with what is on screen.
 */
export function SettingsPrivacyTab() {
  return (
    <>
      <SettingsPrivacyVisibilitySection />
      <SettingsPrivacyInteractionsSection />
      <SettingsPrivacyBlockedSection />
      <SettingsPrivacySessionsSection />
      <SettingsPrivacyDangerSection />
    </>
  );
}
