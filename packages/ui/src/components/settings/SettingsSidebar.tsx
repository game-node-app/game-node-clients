import { Box, Stack, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconBug } from "@tabler/icons-react";
import { authClient } from "#@/components/auth/authClient";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { SettingsNewBadge } from "#@/components/settings/common/SettingsPill";
import {
  SETTINGS_TAB_CONFIGS,
  SettingsPrivacySection,
  SettingsTab,
  SettingsTabConfig,
} from "#@/components/settings/settingsTabs";
import { cn } from "#@/util";

export const SETTINGS_REPORT_BUG_URL =
  "https://github.com/game-node-app/game-node-clients/issues/new";

interface Props {
  activeTab: SettingsTab | null;
  /** Sub-item highlighted under the active tab (scroll-spy or `?section=`). */
  activeSection?: string | null;
  onSelect: (tab: SettingsTab, section?: string) => void;
  className?: string;
}

function SettingsSidebarItem({
  config,
  active,
  onClick,
}: {
  config: SettingsTabConfig;
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const { Icon, tab, highlight, isNew } = config;

  return (
    <UnstyledButton
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-8 w-full items-center gap-2.5 rounded-md border border-solid px-2.5 py-1.5 text-left transition-colors",
        highlight
          ? active
            ? "border-[rgba(185,138,255,0.95)] bg-gradient-to-r from-[rgba(151,71,255,0.26)] via-[rgba(151,71,255,0.12)] via-60% to-[rgba(241,80,37,0.1)] shadow-[0_0_16px_0_rgba(151,71,255,0.32)]"
            : "border-[rgba(151,71,255,0.45)] bg-gradient-to-r from-[rgba(151,71,255,0.12)] to-[rgba(151,71,255,0)] hover:border-[rgba(185,138,255,0.75)]"
          : active
            ? "border-transparent bg-[#222]"
            : "border-transparent hover:bg-[#1a1a1a]",
      )}
    >
      <Icon
        size={16}
        className={cn(
          "shrink-0",
          highlight
            ? "text-[#c7a6ff]"
            : active
              ? "text-[#f15025]"
              : "text-[#adadad]",
        )}
      />
      <Text
        fz={14}
        lh={"normal"}
        fw={active ? 600 : highlight ? 500 : 400}
        className={cn(
          "min-w-0 flex-1",
          active
            ? "text-white"
            : highlight
              ? "text-[#e4d5ff]"
              : "text-[#adadad]",
        )}
      >
        {t(`settings.tabs.${tab}.label`)}
      </Text>
      {isNew && <SettingsNewBadge />}
    </UnstyledButton>
  );
}

function SettingsSidebarSubItems({
  tab,
  sections,
  activeSection,
  onSelect,
}: {
  tab: SettingsTab;
  sections: readonly SettingsPrivacySection[];
  activeSection?: string | null;
  onSelect: (tab: SettingsTab, section?: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap={0} className={"w-full ps-9"}>
      {sections.map((section) => {
        const active = section === activeSection;
        return (
          <UnstyledButton
            key={section}
            onClick={() => onSelect(tab, section)}
            className={cn(
              "w-full border-0 border-l-2 border-solid py-[5px] ps-2.5 text-left",
              active ? "border-[#f15025]" : "border-[#2a2a2a]",
            )}
          >
            <Text
              fz={13}
              lh={"18px"}
              className={active ? "text-white" : "text-[#7a7a7a]"}
            >
              {t(`settings.privacy.sections.${section}`)}
            </Text>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
}

/** Left column of the settings modal: user, tab list and footer links. */
export function SettingsSidebar({
  activeTab,
  activeSection,
  onSelect,
  className,
}: Props) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { data: profile } = useUserProfile(userId);
  const session = authClient.useSession();
  const email = session.data?.user.email;

  return (
    <Stack
      gap={14}
      className={cn(
        "h-full w-full border-0 border-r border-solid border-[#2a2a2a] bg-[#111] px-2.5 py-4",
        className,
      )}
    >
      <Box className={"flex items-center gap-2.5 px-1.5 py-1"}>
        <UserAvatar userId={userId} size={32} />
        <Stack gap={2} className={"min-w-0 flex-1"}>
          <Text fz={14} fw={600} c={"white"} lh={"normal"} truncate>
            {profile?.username}
          </Text>
          {email && (
            <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"} truncate>
              {email}
            </Text>
          )}
        </Stack>
      </Box>
      <Box className={"h-px w-full bg-[#2a2a2a]"} />
      <Stack gap={2} component={"nav"} aria-label={t("settings.title")}>
        <Text
          fz={11}
          fw={600}
          lh={"normal"}
          className={"pb-1.5 ps-2.5 uppercase tracking-[0.6px] text-[#7a7a7a]"}
        >
          {t("settings.sectionLabel")}
        </Text>
        {SETTINGS_TAB_CONFIGS.map((config) => {
          const active = config.tab === activeTab;
          return (
            <Box key={config.tab}>
              <SettingsSidebarItem
                config={config}
                active={active}
                onClick={() => onSelect(config.tab)}
              />
              {active && config.sections && (
                <SettingsSidebarSubItems
                  tab={config.tab}
                  sections={config.sections}
                  activeSection={activeSection}
                  onSelect={onSelect}
                />
              )}
            </Box>
          );
        })}
      </Stack>
      <Box className={"min-h-px flex-1"} />
      <Stack gap={2}>
        <UnstyledButton
          component={"a"}
          href={SETTINGS_REPORT_BUG_URL}
          target={"_blank"}
          rel={"noreferrer"}
          className={
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-[#1a1a1a]"
          }
        >
          <IconBug size={16} className={"text-[#adadad]"} />
          <Text fz={14} lh={"normal"} className={"text-[#adadad]"}>
            {t("settings.reportBug")}
          </Text>
        </UnstyledButton>
        <Text fz={12} lh={"normal"} className={"ps-2.5 pt-1.5 text-[#7a7a7a]"}>
          GameNode
        </Text>
      </Stack>
    </Stack>
  );
}
