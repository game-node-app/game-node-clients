import { useTranslation } from "@repo/locales";
import { IconChevronRight } from "@tabler/icons-react";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsPrivacySection } from "#@/components/settings/settingsTabs";
import {
  SettingsComingSoonTitle,
  SettingsDisabledSelect,
} from "#@/components/settings/tabs/privacy/SettingsPrivacyComingSoon";

/**
 * Profile visibility. There is no profile privacy API yet (only per-collection
 * visibility), so every control is disabled and shows today's behaviour.
 */
export function SettingsPrivacyVisibilitySection() {
  const { t } = useTranslation();
  const publicLabel = t("settings.privacy.options.public");

  return (
    <SettingsSection
      sectionId={"privacy" satisfies SettingsPrivacySection}
      title={
        <SettingsComingSoonTitle>
          {t("settings.privacy.sections.privacy")}
        </SettingsComingSoonTitle>
      }
      description={t("settings.privacy.visibility.description")}
    >
      <SettingsCard>
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.profile.title")}
          description={t("settings.privacy.visibility.profile.description")}
          rightSection={<SettingsDisabledSelect label={publicLabel} />}
        />
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.library.title")}
          description={t("settings.privacy.visibility.library.description")}
          rightSection={<SettingsDisabledSelect label={publicLabel} />}
        />
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.activity.title")}
          description={t("settings.privacy.visibility.activity.description")}
          rightSection={<SettingsDisabledSelect label={publicLabel} />}
        />
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.connections.title")}
          description={t("settings.privacy.visibility.connections.description")}
          rightSection={
            <SettingsButton
              variant={"ghost"}
              disabled
              rightSection={<IconChevronRight size={14} />}
              classNames={{ section: "ms-1.5" }}
            >
              {t("settings.privacy.visibility.connections.manage")}
            </SettingsButton>
          }
        />
      </SettingsCard>
    </SettingsSection>
  );
}
