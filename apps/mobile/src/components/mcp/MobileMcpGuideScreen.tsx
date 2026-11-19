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

const StepNumber = ({ n }: { n: number }) => (
  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
    {n}
  </span>
);

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
  } = useMcpGuide({ openExternal });

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
          "flex w-full items-center gap-3 border-0 border-t border-solid border-line bg-transparent px-3.5 py-3 text-left first:border-t-0",
          active && "bg-brand/10",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            active ? "bg-brand text-white" : "bg-paper-4 text-neutral-300",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-medium text-white">
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
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              {t("mcp.eyebrow")}
            </span>
          </div>
          <h1 className="m-0 text-2xl font-bold leading-tight text-white">
            {t("mcp.title")}
          </h1>
          <Text size="sm" c="dimmed">
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
          <Text size="xs" c="dimmed">
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
                size="sm"
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
        {(
          Object.entries(MCP_CLIENTS) as [
            Exclude<McpClient, "manual">,
            (typeof MCP_CLIENTS)[keyof typeof MCP_CLIENTS],
          ][]
        ).map(([key, item]) =>
          option(
            key,
            item.name,
            "launch" in item ? (
              <IconWorld size={20} />
            ) : (
              <IconTerminal2 size={20} />
            ),
          ),
        )}
        {option("manual", t("mcp.manual"), <IconSettings size={20} />)}
      </CardSection>

      <section
        id="mcp-instructions"
        aria-label={client?.name || t("mcp.manual")}
        className="flex min-w-0 flex-col gap-5"
      >
        <CardSection
          title={`${t("mcp.add")} — ${client?.name || t("mcp.manual")}`}
        >
          <div className="flex min-w-0 flex-col gap-4 p-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center gap-2">
                <StepNumber n={1} />
                <h3 className="m-0 text-[15px] font-semibold text-white">
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
                <h3 className="m-0 text-[15px] font-semibold text-white">
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
                <h3 className="m-0 text-[15px] font-semibold text-white">
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
            <Accordion variant="contained">
              <Accordion.Item value="prompt">
                <Accordion.Control>{t("mcp.showPrompt")}</Accordion.Control>
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
        <Accordion variant="default">
          <Accordion.Item value="manual">
            <Accordion.Control>{t("mcp.manual")}</Accordion.Control>
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
          <Accordion.Item value="trouble">
            <Accordion.Control>{t("mcp.troubleshooting")}</Accordion.Control>
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
