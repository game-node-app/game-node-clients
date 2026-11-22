import type { ReactNode } from "react";
import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Button,
  Code,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  cn,
  GameNodeLogo,
  MCP_CLIENTS,
  MCP_EXAMPLES,
  MCP_SCOPES,
  McpCopy,
  useMcpGuide,
  type McpClient,
  type McpGuideScreenProps,
} from "@repo/ui";
import {
  IconCheck,
  IconExternalLink,
  IconSettings,
  IconTerminal2,
  IconWorld,
} from "@tabler/icons-react";
import { CardRow, CardSection } from "@/components/general/card";

/** Filled brand ThemeIcon, so the number gets the dark text from `variantColorResolver`. */
const StepNumber = ({ n }: { n: number }) => (
  <ThemeIcon size={24} radius="xl" aria-hidden className="shrink-0">
    <span className="text-xs font-bold">{n}</span>
  </ThemeIcon>
);

type ClientEntry = [
  Exclude<McpClient, "manual">,
  (typeof MCP_CLIENTS)[keyof typeof MCP_CLIENTS],
];
const CLIENTS = Object.entries(MCP_CLIENTS) as ClientEntry[];
// Hosted clients (they have a web flow, so a phone can finish setup) come first; terminal clients
// go behind a disclosure.
const HOSTED_CLIENTS = CLIENTS.filter(([, item]) => "launch" in item);
const TERMINAL_CLIENTS = CLIENTS.filter(([, item]) => !("launch" in item));

/**
 * Mobile presenter for the MCP guide: same state and copy as the shared screen (`useMcpGuide`),
 * laid out as compact dark cards like the Settings screen.
 */
const MobileMcpGuideScreen = ({ openExternal }: McpGuideScreenProps) => {
  const { t } = useTranslation();
  const {
    selected,
    setSelected,
    launchError,
    connection,
    client,
    prompt,
    launchProps,
  } = useMcpGuide({ openExternal, defaultClient: "claude" });

  const snippet = (value: string) => (
    <Stack gap="xs" className="min-w-0">
      <Code
        block
        style={{ maxWidth: "100%", overflowX: "auto", whiteSpace: "pre" }}
      >
        {value}
      </Code>
      <McpCopy key={value} value={value} />
    </Stack>
  );

  const option = (key: McpClient, name: string, icon: ReactNode) => {
    const active = selected === key;
    return (
      <button
        key={key}
        type="button"
        aria-pressed={active}
        aria-controls="mcp-instructions"
        onClick={() => setSelected(key)}
        className={cn(
          "gn-row flex w-full items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left",
          active && "bg-brand/10",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            active
              ? "bg-brand text-on-brand-alt"
              : "bg-paper-4 text-legacy-neutral-300",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-medium text-foreground">
          {name}
        </span>
        {active && <IconCheck size={18} className="shrink-0 text-brand" />}
      </button>
    );
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-8 pt-4 [overflow-wrap:anywhere]">
      <CardSection accent>
        <header className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 shrink-0">
              <GameNodeLogo />
            </div>
            <h1 className="m-0 text-2xl font-bold leading-tight text-foreground">
              {t("mcp.title")}
            </h1>
          </div>
          <Text size="sm" c="dimmed" style={{ textWrap: "balance" }}>
            {t("mcp.intro")}
          </Text>
          <div className="flex flex-col gap-2">
            <Button
              fullWidth
              rightSection={<IconExternalLink size={18} />}
              {...launchProps(MCP_CLIENTS.claude.launch)}
            >
              {t("mcp.openClaude")}
            </Button>
            <Button
              fullWidth
              variant="default"
              rightSection={<IconExternalLink size={18} />}
              {...launchProps(MCP_CLIENTS.chatgpt.launch)}
            >
              {t("mcp.openChatgpt")}
            </Button>
          </div>
          <Text size="xs" c="dimmed" style={{ textWrap: "pretty" }}>
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
        </header>
      </CardSection>

      <CardSection>
        {MCP_EXAMPLES.map(({ key, icon: Icon }, i) => (
          <CardRow
            key={key}
            icon={<Icon size={20} />}
            title={t(`mcp.${key}`)}
            footer={
              <Badge
                mt={6}
                size="md"
                variant="light"
                color={i ? "brand" : "gray"}
              >
                {t(i ? "mcp.write" : "mcp.read")}
              </Badge>
            }
          />
        ))}
      </CardSection>

      <CardSection title={t("mcp.choose")}>
        {HOSTED_CLIENTS.map(([key, item]) =>
          option(key, item.name, <IconWorld size={20} />),
        )}
        <Accordion
          variant="unstyled"
          defaultValue={
            HOSTED_CLIENTS.some(([key]) => key === selected) ? null : "other"
          }
          classNames={{ content: "p-0" }}
        >
          <Accordion.Item value="other" className="gn-row">
            <Accordion.Control className="gn-row px-3.5 py-3">
              {t("mcp.otherAssistants")}
            </Accordion.Control>
            <Accordion.Panel className="gn-row">
              {TERMINAL_CLIENTS.map(([key, item]) =>
                option(key, item.name, <IconTerminal2 size={20} />),
              )}
              {option("manual", t("mcp.manual"), <IconSettings size={20} />)}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </CardSection>

      <section
        id="mcp-instructions"
        aria-label={client?.name || t("mcp.manual")}
        className="min-w-0"
      >
        <CardSection>
          <div className="flex min-w-0 flex-col gap-4 p-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center gap-2">
                <StepNumber n={1} />
                <h3 className="m-0 text-[15px] font-semibold text-foreground">
                  {t("mcp.add")} — {client?.name || t("mcp.manual")}
                </h3>
              </div>
              {selected === "codex" || selected === "claudeCode" ? (
                <>
                  <Text size="sm" c="dimmed">
                    {t("mcp.terminalHelp")}
                  </Text>
                  {snippet(connection[selected])}
                </>
              ) : (
                <>
                  <Text size="sm" c="dimmed">
                    {selected === "claude"
                      ? t("mcp.claudeSteps")
                      : selected === "chatgpt"
                        ? t("mcp.chatgptSteps")
                        : t("mcp.oauth")}
                  </Text>
                  {snippet(connection.url)}
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <StepNumber n={2} />
                <h3 className="m-0 text-[15px] font-semibold text-foreground">
                  {t("mcp.authorizeStep")}
                </h3>
              </div>
              <Text size="sm" c="dimmed">
                {t("mcp.authorizeHelp")}
              </Text>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <StepNumber n={3} />
                <h3 className="m-0 text-[15px] font-semibold text-foreground">
                  {t("mcp.verify")}
                </h3>
              </div>
              <Text size="sm" c="dimmed">
                {t("mcp.verifyHelp")}
              </Text>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {client && (
                <Anchor
                  size="sm"
                  href={client.docs}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("mcp.docs")} — {client.name}
                </Anchor>
              )}
              <McpCopy
                key={prompt}
                value={prompt}
                label={t("mcp.copyPrompt")}
              />
            </div>
            <Accordion variant="unstyled" classNames={{ content: "px-0" }}>
              <Accordion.Item value="prompt">
                <Accordion.Control className="px-0 py-2 text-sm">
                  {t("mcp.showPrompt")}
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm" style={{ userSelect: "text" }}>
                    {prompt}
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </CardSection>
      </section>

      <CardSection>
        <Accordion variant="unstyled" classNames={{ content: "px-3.5" }}>
          <Accordion.Item value="manual" className="gn-row">
            <Accordion.Control className="px-3.5 py-3">
              {t("mcp.manual")}
            </Accordion.Control>
            <Accordion.Panel>
              <Stack className="min-w-0">
                <Text size="sm">{t("mcp.serverName")}: GameNode</Text>
                <McpCopy value="gamenode" />
                <Text size="sm">{t("mcp.endpoint")}</Text>
                {snippet(connection.url)}
                <Text size="sm">{t("mcp.transport")}</Text>
                <Text size="sm">{t("mcp.oauth")}</Text>
                <Text size="sm">{t("mcp.toml")}</Text>
                {snippet(connection.toml)}
                <Text size="sm">{t("mcp.json")}</Text>
                {snippet(connection.json)}
                <Text size="sm">{t("mcp.scopes")}</Text>
                <Text size="sm">{MCP_SCOPES.join(" · ")}</Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="trouble" className="gn-row">
            <Accordion.Control className="px-3.5 py-3">
              {t("mcp.troubleshooting")}
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">{t("mcp.troubleHelp")}</Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </CardSection>
    </div>
  );
};

export { MobileMcpGuideScreen };
