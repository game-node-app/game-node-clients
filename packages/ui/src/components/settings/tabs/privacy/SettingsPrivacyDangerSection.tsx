import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconDownload, IconRefresh, IconTrash } from "@tabler/icons-react";
import { PreferencesRestartAccountModal } from "#@/components/preferences/handlers/account/PreferencesRestartAccountModal";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsPrivacySection } from "#@/components/settings/settingsTabs";

/**
 * Export (no API yet), restart (works, through the existing modal) and delete
 * (better-auth `deleteUser` depends on a server flag we haven't confirmed).
 */
export function SettingsPrivacyDangerSection() {
  const { t } = useTranslation();
  const [restartOpened, restartUtils] = useDisclosure();

  return (
    <SettingsSection
      sectionId={"danger" satisfies SettingsPrivacySection}
      title={t("settings.privacy.sections.danger")}
    >
      <PreferencesRestartAccountModal
        opened={restartOpened}
        onClose={restartUtils.close}
      />
      <SettingsCard danger>
        <SettingsRow
          disabled
          title={t("settings.privacy.danger.export.title")}
          titleBadges={<SettingsComingSoonBadge />}
          description={t("settings.privacy.danger.export.description")}
          rightSection={
            <SettingsButton
              variant={"secondary"}
              disabled
              leftSection={<IconDownload size={14} />}
            >
              {t("settings.privacy.danger.export.action")}
            </SettingsButton>
          }
        />
        <SettingsRow
          title={t("settings.privacy.danger.restart.title")}
          description={t("settings.privacy.danger.restart.description")}
          rightSection={
            <SettingsButton
              variant={"dangerOutline"}
              leftSection={<IconRefresh size={14} />}
              onClick={restartUtils.open}
            >
              {t("settings.privacy.danger.restart.action")}
            </SettingsButton>
          }
        />
        <SettingsRow
          disabled
          title={t("settings.privacy.danger.delete.title")}
          titleBadges={<SettingsComingSoonBadge />}
          description={t("settings.privacy.danger.delete.description")}
          rightSection={
            <SettingsButton
              variant={"danger"}
              disabled
              leftSection={<IconTrash size={14} />}
            >
              {t("settings.privacy.danger.delete.action")}
            </SettingsButton>
          }
        />
      </SettingsCard>
    </SettingsSection>
  );
}
