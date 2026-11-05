import { Box, Group, Stack, Tabs, Text, VisuallyHidden } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconExternalLink } from "@tabler/icons-react";
import { ReactNode, useState } from "react";
import { getMcpConnection, MCP_CLIENTS } from "#@/components/mcp/connection";
import {
  SettingsButton,
  SettingsCard,
  SettingsSection,
} from "#@/components/settings/common";
import { McpCodeField } from "#@/components/settings/tabs/mcp/McpCodeField";

type ConnectTab = "claude" | "claudeCode" | "cursor" | "chatgpt" | "others";

/**
 * Local list on purpose: `MCP_CLIENTS` drives the mobile guide (and its tests)
 * and has no Cursor entry.
 */
const CONNECT_TABS: { value: ConnectTab; name?: string; untested?: boolean }[] =
  [
    { value: "claude", name: "Claude" },
    { value: "claudeCode", name: MCP_CLIENTS.claudeCode.name },
    { value: "cursor", name: "Cursor", untested: true },
    { value: "chatgpt", name: MCP_CLIENTS.chatgpt.name, untested: true },
    { value: "others" },
  ];

function ExternalButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <SettingsButton
      component={"a"}
      href={href}
      target={"_blank"}
      rel={"noreferrer"}
      variant={"secondary"}
      rightSection={<IconExternalLink size={14} />}
      classNames={{ section: "ms-1.5" }}
    >
      {children}
    </SettingsButton>
  );
}

function DocsLink({ href, name }: { href: string; name: string }) {
  const { t } = useTranslation();
  return (
    <SettingsButton
      component={"a"}
      href={href}
      target={"_blank"}
      rel={"noreferrer"}
      variant={"ghost"}
      rightSection={<IconExternalLink size={14} />}
      classNames={{ section: "ms-1.5" }}
    >
      {t("mcp.docs")} — {name}
    </SettingsButton>
  );
}

function Step({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Group
      component={"li"}
      wrap={"nowrap"}
      align={"flex-start"}
      gap={12}
      className={"w-full"}
    >
      <Box
        aria-hidden
        className={
          "flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#222]"
        }
      >
        <Text fz={12} fw={600} c={"white"} lh={"normal"}>
          {index}
        </Text>
      </Box>
      <Stack gap={8} className={"min-w-0 flex-1 pt-0.5"}>
        <Text fz={13} fw={600} c={"white"} lh={"18px"}>
          {title}
        </Text>
        {children}
      </Stack>
    </Group>
  );
}

function StepText({ children }: { children: ReactNode }) {
  return (
    <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
      {children}
    </Text>
  );
}

function AddStepContent({ tab }: { tab: ConnectTab }) {
  const { t } = useTranslation();
  const connection = getMcpConnection();

  switch (tab) {
    case "claude":
      return (
        <>
          <StepText>{t("mcp.claudeSteps")}</StepText>
          <Group gap={8}>
            <ExternalButton href={MCP_CLIENTS.claude.launch}>
              {t("mcp.openClaude")}
            </ExternalButton>
            <DocsLink href={MCP_CLIENTS.claude.docs} name={"Claude"} />
          </Group>
        </>
      );
    case "claudeCode":
      return (
        <>
          <StepText>{t("mcp.terminalHelp")}</StepText>
          <McpCodeField value={connection.claudeCode} />
          <McpCodeField value={connection.json} label={t("mcp.json")} />
          <Group gap={8}>
            <DocsLink
              href={MCP_CLIENTS.claudeCode.docs}
              name={MCP_CLIENTS.claudeCode.name}
            />
          </Group>
        </>
      );
    case "cursor":
      return (
        <>
          <StepText>{t("settings.mcp.connect.cursorSteps")}</StepText>
          <McpCodeField
            value={connection.json}
            label={t("settings.mcp.connect.cursorJson")}
          />
        </>
      );
    case "chatgpt":
      return (
        <>
          <StepText>{t("mcp.chatgptSteps")}</StepText>
          <Group gap={8}>
            <ExternalButton href={MCP_CLIENTS.chatgpt.launch}>
              {t("mcp.openChatgpt")}
            </ExternalButton>
            <DocsLink
              href={MCP_CLIENTS.chatgpt.docs}
              name={MCP_CLIENTS.chatgpt.name}
            />
          </Group>
        </>
      );
    case "others":
      return (
        <>
          <StepText>{t("settings.mcp.connect.othersSteps")}</StepText>
          <StepText>{t("mcp.oauth")}</StepText>
          <McpCodeField value={connection.toml} label={t("mcp.toml")} />
          <Group gap={8}>
            <DocsLink
              href={MCP_CLIENTS.codex.docs}
              name={MCP_CLIENTS.codex.name}
            />
          </Group>
        </>
      );
  }
}

/** "How to connect": per-assistant setup steps in tabs. */
export function McpConnectTabs() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ConnectTab>("claude");

  return (
    <SettingsSection title={t("settings.mcp.connect.title")}>
      <Stack gap={10}>
        <SettingsCard withDividers={false}>
          <Tabs
            unstyled
            value={tab}
            onChange={(value) => value && setTab(value as ConnectTab)}
            keepMounted={false}
          >
            <Tabs.List
              className={
                "flex flex-nowrap gap-5 overflow-x-auto border-0 border-b border-solid border-[#2a2a2a] px-5"
              }
            >
              {CONNECT_TABS.map(({ value, name, untested }) => (
                <Tabs.Tab
                  key={value}
                  value={value}
                  className={
                    "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 border-b-2 border-solid border-transparent bg-transparent px-0 pb-2.5 pt-3 text-[14px] leading-normal text-[#adadad] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#f15025] data-[active]:border-[#f15025] data-[active]:font-semibold data-[active]:text-white"
                  }
                >
                  {name ?? t("settings.mcp.connect.others")}
                  {untested && (
                    <>
                      <Box
                        component={"span"}
                        aria-hidden
                        className={
                          "ms-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[#f5a524] align-middle"
                        }
                      />
                      <VisuallyHidden>
                        {t("settings.mcp.connect.untested")}
                      </VisuallyHidden>
                    </>
                  )}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {CONNECT_TABS.map(({ value }) => (
              <Tabs.Panel key={value} value={value}>
                <Stack
                  component={"ol"}
                  gap={16}
                  className={"m-0 list-none px-5 pb-5 pt-[18px]"}
                >
                  <Step index={1} title={t("mcp.add")}>
                    <AddStepContent tab={value} />
                  </Step>
                  <Step index={2} title={t("mcp.authorizeStep")}>
                    <StepText>{t("mcp.authorizeHelp")}</StepText>
                  </Step>
                  <Step index={3} title={t("mcp.verify")}>
                    <StepText>{t("mcp.verifyHelp")}</StepText>
                  </Step>
                </Stack>
              </Tabs.Panel>
            ))}
          </Tabs>
        </SettingsCard>
        <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
          {t("settings.mcp.connect.untestedLegend")}
        </Text>
      </Stack>
    </SettingsSection>
  );
}
