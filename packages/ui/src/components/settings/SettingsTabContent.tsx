import { SettingsTab } from "#@/components/settings/settingsTabs";
import { SettingsAppearanceTab } from "#@/components/settings/tabs/SettingsAppearanceTab";
import { SettingsConnectionsTab } from "#@/components/settings/tabs/SettingsConnectionsTab";
import { SettingsLibraryTab } from "#@/components/settings/tabs/SettingsLibraryTab";
import { SettingsMcpTab } from "#@/components/settings/tabs/SettingsMcpTab";
import { SettingsNotificationsTab } from "#@/components/settings/tabs/SettingsNotificationsTab";
import { SettingsPremiumTab } from "#@/components/settings/tabs/SettingsPremiumTab";
import { SettingsProfileTab } from "#@/components/settings/tabs/SettingsProfileTab";
import { SettingsPrivacyTab } from "#@/components/settings/tabs/privacy/SettingsPrivacyTab";

/** Body of the settings panel for the given tab. */
export function SettingsTabContent({ tab }: { tab: SettingsTab }) {
  switch (tab) {
    case "premium":
      return <SettingsPremiumTab />;
    case "profile":
      return <SettingsProfileTab />;
    case "connections":
      return <SettingsConnectionsTab />;
    case "library":
      return <SettingsLibraryTab />;
    case "notifications":
      return <SettingsNotificationsTab />;
    case "privacy":
      return <SettingsPrivacyTab />;
    case "appearance":
      return <SettingsAppearanceTab />;
    case "mcp":
      return <SettingsMcpTab />;
  }
}
