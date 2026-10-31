import { ReactNode, useState } from "react";
import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Button,
  Code,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBookmarkPlus,
  IconExternalLink,
  IconPencil,
  IconSearch,
  IconSettings,
  IconTerminal2,
  IconWorld,
} from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import {
  getMcpConnection,
  getMcpPrompt,
  MCP_CLIENTS,
  MCP_SCOPES,
  McpClient,
} from "./connection";
import { McpCopy } from "./McpCopy";
import classes from "./McpGuide.module.css";

const EXAMPLES = [
  { key: "readExample", icon: IconSearch },
  { key: "writeExample", icon: IconBookmarkPlus },
  { key: "publishExample", icon: IconPencil },
] as const;

export interface McpGuideScreenProps {
  openExternal?: (url: string) => Promise<void>;
}

export function McpGuideScreen({ openExternal }: McpGuideScreenProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<McpClient>("codex");
  const [launchError, setLaunchError] = useState<string>();
  const connection = getMcpConnection();
  const client = selected === "manual" ? null : MCP_CLIENTS[selected];
  const prompt = getMcpPrompt(selected, t);
  const launch = (url: string) => {
    setLaunchError(undefined);
    void openExternal?.(url).catch(() => setLaunchError(url));
  };
  const launchProps = (url: string) => ({
    onClick: () => {
      setSelected(url === MCP_CLIENTS.claude.launch ? "claude" : "chatgpt");
      if (openExternal) launch(url);
    },
    ...(!openExternal
      ? {
          component: "a" as const,
          href: url,
          target: "_blank",
          rel: "noreferrer",
        }
      : {}),
  });
  const snippet = (value: string) => (
    <Stack gap="xs" style={{ minWidth: 0 }}>
      <Code
        block
        style={{ maxWidth: "100%", overflowX: "auto", whiteSpace: "pre" }}
      >
        {value}
      </Code>
      <McpCopy key={value} value={value} />
    </Stack>
  );

  const tile = (key: McpClient, name: string, icon: ReactNode) => (
    <UnstyledButton
      key={key}
      className={classes.tile}
      aria-pressed={selected === key}
      aria-controls="mcp-instructions"
      onClick={() => setSelected(key)}
    >
      <ThemeIcon variant="light" size="lg" radius="md">
        {icon}
      </ThemeIcon>
      {name}
    </UnstyledButton>
  );

  return (
    <Container
      size="md"
      py="xl"
      style={{
        width: "100%",
        minWidth: 0,
        overflowWrap: "anywhere",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <Stack gap={40}>
        <Stack component="header" gap="md" className={classes.hero}>
          <Group gap="sm">
            <div style={{ width: 40 }}>
              <GameNodeLogo />
            </div>
            <Text className={classes.eyebrow}>Model Context Protocol</Text>
          </Group>
          <Title order={1}>{t("mcp.title")}</Title>
          <Text size="lg" c="dimmed" maw={560}>
            {t("mcp.intro")}
          </Text>
          <Group mt="sm">
            <Button
              size="md"
              rightSection={<IconExternalLink size={18} />}
              {...launchProps(MCP_CLIENTS.claude.launch)}
            >
              {t("mcp.openClaude")}
            </Button>
            <Button
              size="md"
              variant="default"
              rightSection={<IconExternalLink size={18} />}
              {...launchProps(MCP_CLIENTS.chatgpt.launch)}
            >
              {t("mcp.openChatgpt")}
            </Button>
          </Group>
          <Text size="sm" c="dimmed" maw={560}>
            {t("mcp.hostedHelp")}
          </Text>
          {launchError && (
            <Alert color="red" role="alert">
              {t("mcp.launchError")}{" "}
              <Anchor href={launchError} target="_blank" rel="noreferrer">
                {launchError}
              </Anchor>
            </Alert>
          )}
        </Stack>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {EXAMPLES.map(({ key, icon: Icon }, i) => (
            <Stack key={key} gap="sm" p="lg" className={classes.card}>
              <Group justify="space-between">
                <ThemeIcon variant="light" size="lg" radius="md">
                  <Icon size={20} />
                </ThemeIcon>
                <Badge variant="light" color={i ? "brand" : "gray"}>
                  {t(i ? "mcp.write" : "mcp.read")}
                </Badge>
              </Group>
              <Text>{t(`mcp.${key}`)}</Text>
            </Stack>
          ))}
        </SimpleGrid>
        <Stack gap="md">
          <Title order={2}>{t("mcp.choose")}</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            {(
              Object.entries(MCP_CLIENTS) as [
                Exclude<McpClient, "manual">,
                (typeof MCP_CLIENTS)[keyof typeof MCP_CLIENTS],
              ][]
            ).map(([key, item]) =>
              tile(
                key,
                item.name,
                "launch" in item ? (
                  <IconWorld size={20} />
                ) : (
                  <IconTerminal2 size={20} />
                ),
              ),
            )}
          </SimpleGrid>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconSettings size={18} />}
            aria-pressed={selected === "manual"}
            aria-controls="mcp-instructions"
            onClick={() => setSelected("manual")}
            className="self-start"
          >
            {t("mcp.manual")}
          </Button>
        </Stack>
        <Stack
          component="section"
          id="mcp-instructions"
          aria-label={client?.name || t("mcp.manual")}
          p="lg"
          className={classes.card}
          style={{ minWidth: 0 }}
        >
          <Timeline active={2} bulletSize={28} lineWidth={2}>
            <Timeline.Item
              bullet={1}
              title={
                <Title order={3} size="h4">
                  {t("mcp.add")} — {client?.name || t("mcp.manual")}
                </Title>
              }
            >
              <Stack gap="sm" mt="xs" style={{ minWidth: 0 }}>
                {selected === "codex" || selected === "claudeCode" ? (
                  <>
                    <Text c="dimmed">{t("mcp.terminalHelp")}</Text>
                    {snippet(connection[selected])}
                  </>
                ) : (
                  <>
                    <Text c="dimmed">
                      {selected === "claude"
                        ? t("mcp.claudeSteps")
                        : selected === "chatgpt"
                          ? t("mcp.chatgptSteps")
                          : t("mcp.oauth")}
                    </Text>
                    {snippet(connection.url)}
                  </>
                )}
              </Stack>
            </Timeline.Item>
            <Timeline.Item
              bullet={2}
              title={
                <Title order={3} size="h4">
                  {t("mcp.authorizeStep")}
                </Title>
              }
            >
              <Text c="dimmed" mt="xs">
                {t("mcp.authorizeHelp")}
              </Text>
            </Timeline.Item>
            <Timeline.Item
              bullet={3}
              title={
                <Title order={3} size="h4">
                  {t("mcp.verify")}
                </Title>
              }
            >
              <Text c="dimmed" mt="xs">
                {t("mcp.verifyHelp")}
              </Text>
            </Timeline.Item>
          </Timeline>
          <Group justify="space-between" mt="md">
            {client && (
              <Anchor href={client.docs} target="_blank" rel="noreferrer">
                {t("mcp.docs")} — {client.name}
              </Anchor>
            )}
            <McpCopy key={prompt} value={prompt} label={t("mcp.copyPrompt")} />
          </Group>
          <Accordion variant="contained">
            <Accordion.Item value="prompt">
              <Accordion.Control>{t("mcp.showPrompt")}</Accordion.Control>
              <Accordion.Panel>
                <Text style={{ userSelect: "text" }}>{prompt}</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
        <Accordion variant="separated">
          <Accordion.Item value="manual">
            <Accordion.Control>{t("mcp.manual")}</Accordion.Control>
            <Accordion.Panel>
              <Stack style={{ minWidth: 0 }}>
                <Text>{t("mcp.serverName")}: GameNode</Text>
                <McpCopy value="gamenode" />
                <Text>{t("mcp.endpoint")}</Text>
                {snippet(connection.url)}
                <Text>{t("mcp.transport")}</Text>
                <Text>{t("mcp.oauth")}</Text>
                <Text>{t("mcp.toml")}</Text>
                {snippet(connection.toml)}
                <Text>{t("mcp.json")}</Text>
                {snippet(connection.json)}
                <Text>{t("mcp.scopes")}</Text>
                <Text>{MCP_SCOPES.join(" · ")}</Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="trouble">
            <Accordion.Control>{t("mcp.troubleshooting")}</Accordion.Control>
            <Accordion.Panel>{t("mcp.troubleHelp")}</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Container>
  );
}
