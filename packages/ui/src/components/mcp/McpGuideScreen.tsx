import { useState } from "react";
import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Button,
  Code,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
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
      <Stack gap="xl">
        <Group>
          <div style={{ width: 48 }}>
            <GameNodeLogo />
          </div>
          <Title order={1}>{t("mcp.title")}</Title>
        </Group>
        <Text size="lg">{t("mcp.intro")}</Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {(["readExample", "writeExample", "publishExample"] as const).map(
            (key, i) => (
              <Paper key={key} withBorder p="md" radius="md">
                <Badge color={i ? "orange" : "gray"}>
                  {t(i ? "mcp.write" : "mcp.read")}
                </Badge>
                <Text mt="sm">{t(`mcp.${key}`)}</Text>
              </Paper>
            ),
          )}
        </SimpleGrid>
        <Title order={2}>{t("mcp.choose")}</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {(
            Object.entries(MCP_CLIENTS) as [
              Exclude<McpClient, "manual">,
              (typeof MCP_CLIENTS)[keyof typeof MCP_CLIENTS],
            ][]
          ).map(([key, item]) => (
            <Button
              key={key}
              variant={selected === key ? "filled" : "default"}
              aria-pressed={selected === key}
              aria-controls="mcp-instructions"
              leftSection={<IconRobot size={20} />}
              onClick={() => setSelected(key)}
            >
              {item.name}
            </Button>
          ))}
        </SimpleGrid>
        <Button
          variant="subtle"
          aria-pressed={selected === "manual"}
          aria-controls="mcp-instructions"
          onClick={() => setSelected("manual")}
        >
          {t("mcp.manual")}
        </Button>
        <Group grow>
          <Button {...launchProps(MCP_CLIENTS.claude.launch)}>
            {t("mcp.openClaude")}
          </Button>
          <Button {...launchProps(MCP_CLIENTS.chatgpt.launch)}>
            {t("mcp.openChatgpt")}
          </Button>
        </Group>
        <Text size="sm" c="dimmed">
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
        <Paper
          component="section"
          id="mcp-instructions"
          aria-label={client?.name || t("mcp.manual")}
          withBorder
          radius="md"
          p="lg"
          style={{ minWidth: 0 }}
        >
          <Stack>
            <Title order={3}>
              {t("mcp.add")} — {client?.name || t("mcp.manual")}
            </Title>
            {selected === "codex" || selected === "claudeCode" ? (
              <>
                <Text>{t("mcp.terminalHelp")}</Text>
                {snippet(connection[selected])}
              </>
            ) : (
              <>
                <Text>
                  {selected === "claude"
                    ? t("mcp.claudeSteps")
                    : selected === "chatgpt"
                      ? t("mcp.chatgptSteps")
                      : t("mcp.oauth")}
                </Text>
                {snippet(connection.url)}
              </>
            )}
            <Title order={3}>{t("mcp.authorizeStep")}</Title>
            <Text>{t("mcp.authorizeHelp")}</Text>
            <Title order={3}>{t("mcp.verify")}</Title>
            <Text>{t("mcp.verifyHelp")}</Text>
            {client && (
              <Anchor href={client.docs} target="_blank" rel="noreferrer">
                {t("mcp.docs")} — {client.name}
              </Anchor>
            )}
            <McpCopy key={prompt} value={prompt} label={t("mcp.copyPrompt")} />
            <Accordion>
              <Accordion.Item value="prompt">
                <Accordion.Control>{t("mcp.showPrompt")}</Accordion.Control>
                <Accordion.Panel>
                  <Text style={{ userSelect: "text" }}>{prompt}</Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Paper>
        <Accordion>
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
