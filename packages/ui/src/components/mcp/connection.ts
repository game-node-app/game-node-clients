import { PROJECT_CONTEXT } from "#@/util/projectContext";

export const MCP_CLIENTS = {
  codex: {
    name: "Codex",
    docs: "https://learn.chatgpt.com/docs/extend/mcp?surface=cli",
  },
  claudeCode: {
    name: "Claude Code",
    docs: "https://code.claude.com/docs/en/mcp",
  },
  claude: {
    name: "Claude.ai",
    docs: "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp",
    launch: "https://claude.ai/customize/connectors",
  },
  chatgpt: {
    name: "ChatGPT",
    docs: "https://developers.openai.com/api/docs/guides/custom-mcp-server",
    launch: "https://chatgpt.com/plugins",
  },
};
export type McpClient = keyof typeof MCP_CLIENTS | "manual";
export const MCP_SCOPES = [
  "games:read",
  "library:read",
  "library:write",
  "reviews:write",
  "posts:write",
  "openid",
  "profile",
  "offline_access",
] as const;

export function getMcpConnection() {
  const url = `${PROJECT_CONTEXT.serverUrl
    .replace(/\/+$/, "")
    .replace(/\/v1\/mcp$/, "")}/v1/mcp`;
  // Quote public configuration as a single shell argument, including unusual base paths.
  const arg = `'${url.replace(/'/g, "'\\''")}'`;
  return {
    url,
    codex: `codex mcp add gamenode --url ${arg}\ncodex mcp login gamenode\ncodex mcp list`,
    claudeCode: `claude mcp add --transport http --scope user gamenode ${arg}\n# /mcp\nclaude mcp get gamenode`,
    toml: `[mcp_servers.gamenode]\nurl = ${JSON.stringify(url)}`,
    json: JSON.stringify(
      { mcpServers: { gamenode: { type: "http", url } } },
      null,
      2,
    ),
  };
}

export function getMcpPrompt(
  client: McpClient,
  t: (
    key: "mcp.prompt" | "mcp.manualClient" | "mcp.hostedPrompt",
    values?: Record<string, string>,
  ) => string,
) {
  return t("mcp.prompt", {
    client:
      client === "manual" ? t("mcp.manualClient") : MCP_CLIENTS[client].name,
    url: getMcpConnection().url,
    scopes: MCP_SCOPES.join(" "),
    hosted:
      client === "claude" || client === "chatgpt" ? t("mcp.hostedPrompt") : "",
  });
}
