import { useTranslation } from "@repo/locales";
import { IconChevronRight } from "@tabler/icons-react";
import { LibraryVisibilitySelect } from "#@/components/collection/collection-entry/visibility/LibraryVisibilitySelect";
import { ReviewsAlwaysPublicNote } from "#@/components/collection/collection-entry/visibility/ReviewsAlwaysPublicNote";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { useLibraryVisibilitySetting } from "#@/components/settings/hooks/useLibraryVisibilitySetting";
import { SettingsPrivacySection } from "#@/components/settings/settingsTabs";
import { SettingsDisabledSelect } from "#@/components/settings/tabs/privacy/SettingsPrivacyComingSoon";
import { Stack } from "@mantine/core";

/**
 * Visibility of the user's own profile and library.
 *
 * Only the library ceiling has a backend today ("Library and collections");
 * every other row stays disabled with a "Coming soon" badge.
 */
export function SettingsPrivacyVisibilitySection() {
  const { t } = useTranslation();
  const publicLabel = t("settings.privacy.options.public");
  const { visibility, hasProfile, isPending, setVisibility } =
    useLibraryVisibilitySetting();

  return (
    <SettingsSection
      sectionId={"privacy" satisfies SettingsPrivacySection}
      title={t("settings.privacy.sections.privacy")}
      description={t("settings.privacy.visibility.description")}
    >
      <SettingsCard>
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.profile.title")}
          description={t("settings.privacy.visibility.profile.description")}
          titleBadges={<SettingsComingSoonBadge />}
          rightSection={<SettingsDisabledSelect label={publicLabel} />}
        />
        <SettingsRow
          title={t("settings.privacy.visibility.library.title")}
          description={t("settings.privacy.visibility.library.description")}
          stackRightSection
          rightSection={
            <Stack gap={6} className={"w-full @[420px]:w-60"}>
              <LibraryVisibilitySelect
                value={visibility}
                onChange={setVisibility}
                disabled={!hasProfile || isPending}
              />
              <ReviewsAlwaysPublicNote />
            </Stack>
          }
        />
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.activity.title")}
          description={t("settings.privacy.visibility.activity.description")}
          titleBadges={<SettingsComingSoonBadge />}
          rightSection={<SettingsDisabledSelect label={publicLabel} />}
        />
        <SettingsRow
          disabled
          title={t("settings.privacy.visibility.connections.title")}
          description={t("settings.privacy.visibility.connections.description")}
          titleBadges={<SettingsComingSoonBadge />}
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
