import { Box, SegmentedControl, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconUserOff } from "@tabler/icons-react";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsIconTile } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsPrivacySection } from "#@/components/settings/settingsTabs";
import { SettingsComingSoonTitle } from "#@/components/settings/tabs/privacy/SettingsPrivacyComingSoon";

/** Blocked and muted accounts. No block/mute API yet: disabled switcher and an empty list. */
export function SettingsPrivacyBlockedSection() {
  const { t } = useTranslation();

  return (
    <SettingsSection
      sectionId={"blocked" satisfies SettingsPrivacySection}
      title={
        <SettingsComingSoonTitle>
          {t("settings.privacy.sections.blocked")}
        </SettingsComingSoonTitle>
      }
      description={t("settings.privacy.blocked.description")}
    >
      <SettingsCard>
        <Box className={"px-5 py-3"}>
          <SegmentedControl
            disabled
            value={"blocked"}
            data={[
              {
                value: "blocked",
                label: t("settings.privacy.blocked.tabs.blocked"),
              },
              {
                value: "muted",
                label: t("settings.privacy.blocked.tabs.muted"),
              },
            ]}
            radius={8}
            classNames={{
              root: "gap-0.5 border border-solid border-[#2a2a2a] bg-[#0b0b0b] p-[3px]",
              indicator: "rounded-md bg-[#222] shadow-none",
              label: "px-3 py-[5px] text-[13px] font-medium",
            }}
          />
        </Box>
        <Stack align={"center"} gap={8} className={"px-5 py-8 text-center"}>
          <SettingsIconTile Icon={IconUserOff} />
          <Stack gap={4} align={"center"}>
            <Text fz={14} fw={600} c={"white"} lh={"normal"}>
              {t("settings.privacy.blocked.empty.title")}
            </Text>
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {t("settings.privacy.blocked.empty.description")}
            </Text>
          </Stack>
        </Stack>
      </SettingsCard>
    </SettingsSection>
  );
}
