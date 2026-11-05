import { useTranslation } from "@repo/locales";
import { IconAt, IconMessage, IconUserPlus } from "@tabler/icons-react";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsPrivacySection } from "#@/components/settings/settingsTabs";
import {
  SettingsComingSoonTitle,
  SettingsDisabledSelect,
} from "#@/components/settings/tabs/privacy/SettingsPrivacyComingSoon";

/** Who can follow, comment and mention. No API yet: disabled, showing today's behaviour. */
export function SettingsPrivacyInteractionsSection() {
  const { t } = useTranslation();
  const everyoneLabel = t("settings.privacy.options.everyone");

  return (
    <SettingsSection
      sectionId={"interactions" satisfies SettingsPrivacySection}
      title={
        <SettingsComingSoonTitle>
          {t("settings.privacy.sections.interactions")}
        </SettingsComingSoonTitle>
      }
      description={t("settings.privacy.interactions.description")}
    >
      <SettingsCard>
        <SettingsRow
          disabled
          Icon={IconUserPlus}
          title={t("settings.privacy.interactions.follow.title")}
          description={t("settings.privacy.interactions.follow.description")}
          rightSection={<SettingsDisabledSelect label={everyoneLabel} />}
        />
        <SettingsRow
          disabled
          Icon={IconMessage}
          title={t("settings.privacy.interactions.comment.title")}
          description={t("settings.privacy.interactions.comment.description")}
          rightSection={<SettingsDisabledSelect label={everyoneLabel} />}
        />
        <SettingsRow
          disabled
          Icon={IconAt}
          title={t("settings.privacy.interactions.mention.title")}
          description={t("settings.privacy.interactions.mention.description")}
          rightSection={<SettingsDisabledSelect label={everyoneLabel} />}
        />
      </SettingsCard>
    </SettingsSection>
  );
}
