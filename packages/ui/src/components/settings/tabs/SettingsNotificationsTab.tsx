import { useTranslation } from "@repo/locales";
import { IconBell, IconBrandAndroid, IconMail } from "@tabler/icons-react";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import {
  SettingsComingSoonBadge,
  SettingsPill,
} from "#@/components/settings/common/SettingsPill";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsLockedSwitch } from "#@/components/settings/tabs/notifications/SettingsLockedSwitch";
import { SettingsNotificationTypesTable } from "#@/components/settings/tabs/notifications/SettingsNotificationTypesTable";

/**
 * Notifications tab. There is no notification-preferences API yet, so this only
 * describes the current behavior (in-app only) and every control is disabled.
 */
export function SettingsNotificationsTab() {
  const { t } = useTranslation();

  return (
    <>
      <SettingsSection
        title={t("settings.notifications.channels.title")}
        description={t("settings.notifications.channels.description")}
      >
        <SettingsCard>
          <SettingsRow
            Icon={IconBell}
            title={t("settings.notifications.channels.inApp.title")}
            description={t("settings.notifications.channels.inApp.description")}
            rightSection={
              <SettingsPill>
                {t("settings.notifications.channels.inApp.alwaysOn")}
              </SettingsPill>
            }
          />
          <SettingsRow
            Icon={IconBrandAndroid}
            title={t("settings.notifications.channels.push.title")}
            titleBadges={<SettingsComingSoonBadge />}
            description={t("settings.notifications.channels.push.description")}
            disabled
            rightSection={
              <SettingsLockedSwitch
                label={t("settings.notifications.channels.push.title")}
              />
            }
          />
          <SettingsRow
            Icon={IconMail}
            title={t("settings.notifications.channels.email.title")}
            description={t("settings.notifications.channels.email.description")}
            disabled
            rightSection={<SettingsComingSoonBadge />}
          />
        </SettingsCard>
      </SettingsSection>
      <SettingsSection
        title={t("settings.notifications.types.title")}
        description={t("settings.notifications.types.description")}
        rightSection={<SettingsComingSoonBadge />}
      >
        <SettingsNotificationTypesTable />
      </SettingsSection>
    </>
  );
}
