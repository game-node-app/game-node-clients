import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconChevronRight,
  IconDeviceMobile,
  IconLock,
  IconShield,
} from "@tabler/icons-react";
import { getMcpConnection } from "#@/components/mcp/connection";
import { MCP_EXAMPLES } from "#@/components/mcp/McpGuideScreen";
import {
  SettingsButton,
  SettingsCard,
  SettingsNewBadge,
  SettingsPill,
  SettingsRow,
  SettingsSection,
} from "#@/components/settings/common";
import { McpCodeField } from "#@/components/settings/tabs/mcp/McpCodeField";
import { McpConnectedApps } from "#@/components/settings/tabs/mcp/McpConnectedApps";
import { McpConnectTabs } from "#@/components/settings/tabs/mcp/McpConnectTabs";
import { McpCopyButton } from "#@/components/settings/tabs/mcp/McpCopyButton";
import {
  getMcpPermissionKey,
  isMcpWriteScope,
  MCP_PERMISSION_ICONS,
  MCP_PERMISSION_SCOPES,
} from "#@/components/settings/tabs/mcp/mcpPermissions";

const ANDROID_APP_URL =
  "https://play.google.com/store/apps/details?id=app.gamenode";

/** MCP tab: connected assistants, server address, setup guide and permissions. */
export function SettingsMcpTab() {
  const { t } = useTranslation();
  const connection = getMcpConnection();

  return (
    <>
      <SettingsSection
        title={
          <>
            {t("settings.mcp.intro.title")}
            <SettingsNewBadge className={"ms-2 align-middle"} />
          </>
        }
        description={t("settings.mcp.intro.description")}
      />

      <McpConnectedApps />

      <SettingsSection title={t("settings.mcp.server.title")}>
        <Stack gap={10}>
          <McpCodeField value={connection.url} />
          <Group gap={8} wrap={"nowrap"}>
            <IconLock size={12} className={"shrink-0 text-[#7a7a7a]"} />
            <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
              {t("settings.mcp.server.noPassword")}
            </Text>
          </Group>
        </Stack>
      </SettingsSection>

      <McpConnectTabs />

      <SettingsSection title={t("settings.mcp.examples.title")}>
        <Stack gap={10}>
          {MCP_EXAMPLES.map(({ key }) => {
            const example = t(`mcp.${key}`);
            return (
              <Group
                key={key}
                wrap={"nowrap"}
                gap={10}
                className={
                  "w-full rounded-lg border border-solid border-[#2a2a2a] bg-[#1a1a1a] py-[5px] pe-1.5 ps-3.5"
                }
              >
                <Text
                  fz={13}
                  lh={"18px"}
                  c={"white"}
                  className={"min-w-0 flex-1 select-text py-1"}
                >
                  “{example}”
                </Text>
                <McpCopyButton value={example} iconOnly />
              </Group>
            );
          })}
        </Stack>
      </SettingsSection>

      <SettingsSection
        title={t("settings.mcp.permissions.title")}
        description={t("settings.mcp.permissions.description")}
      >
        <SettingsCard>
          {MCP_PERMISSION_SCOPES.map((scope) => {
            const key = getMcpPermissionKey(scope);
            const write = isMcpWriteScope(scope);
            return (
              <SettingsRow
                key={scope}
                Icon={MCP_PERMISSION_ICONS[scope]}
                title={t(`settings.mcp.scopes.${key}.title`)}
                description={t(`mcp.scopeDescriptions.${key}`)}
                rightSection={
                  <SettingsPill tone={write ? "accent" : "neutral"}>
                    {t(
                      write
                        ? "settings.mcp.permissions.write"
                        : "settings.mcp.permissions.read",
                    )}
                  </SettingsPill>
                }
                className={"py-3"}
              />
            );
          })}
        </SettingsCard>
      </SettingsSection>

      <Group
        wrap={"nowrap"}
        align={"flex-start"}
        gap={10}
        className={
          "w-full rounded-lg border border-solid border-[#2a2a2a] bg-[#0b0b0b] px-3.5 py-3"
        }
      >
        <IconShield size={16} className={"mt-px shrink-0 text-[#d9d9d9]"} />
        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text fz={14} fw={600} c={"white"} lh={"normal"}>
            {t("settings.mcp.notice.title")}
          </Text>
          <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
            {t("settings.mcp.notice.description")}
          </Text>
        </Stack>
      </Group>

      <SettingsCard>
        <SettingsRow
          Icon={IconDeviceMobile}
          title={t("settings.mcp.mobile.title")}
          description={t("settings.mcp.mobile.description")}
          rightSection={
            <SettingsButton
              component={"a"}
              href={ANDROID_APP_URL}
              target={"_blank"}
              rel={"noreferrer"}
              variant={"ghost"}
              leftSection={<IconChevronRight size={14} />}
            >
              {t("settings.mcp.mobile.open")}
            </SettingsButton>
          }
        />
      </SettingsCard>
    </>
  );
}
