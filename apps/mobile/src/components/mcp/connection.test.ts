import { describe, expect, it } from "vitest";
import { createI18nInstance } from "@repo/locales";
import {
  getMcpConnection,
  getMcpPrompt,
  MCP_CLIENTS,
} from "../../../../../packages/ui/src/components/mcp/connection";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

describe("public MCP setup data", () => {
  it.each([
    "https://staging.example/api",
    "https://staging.example/api///",
    "https://staging.example/api/v1/mcp/",
  ])("uses the configured API base %s", (serverUrl) => {
    setProjectContext({
      client: "mobile",
      serverUrl,
      searchUrl: "",
      s3BucketUrl: "",
    });
    const data = getMcpConnection();
    expect(data.url).toBe("https://staging.example/api/v1/mcp");
    expect(data.codex).toContain(`--url '${data.url}'`);
    expect(data.claudeCode).toContain(
      `--transport http --scope user gamenode '${data.url}'`,
    );
    expect(data.toml).toBe(
      `[mcp_servers.gamenode]\nurl = ${JSON.stringify(data.url)}`,
    );
    expect(JSON.parse(data.json)).toEqual({
      mcpServers: { gamenode: { type: "http", url: data.url } },
    });
  });
  it.each(["en", "pt-BR"] as const)(
    "resolves all prompts and scope copy in %s without auth state",
    (language) => {
      const i18n = createI18nInstance({ language });
      for (const client of [...Object.keys(MCP_CLIENTS), "manual"] as const) {
        const prompt = getMcpPrompt(
          client as keyof typeof MCP_CLIENTS | "manual",
          i18n.t,
        );
        expect(prompt).toContain(getMcpConnection().url);
        expect(prompt).toContain("OAuth 2.1");
        expect(prompt).toContain("PKCE");
        expect(prompt).not.toMatch(
          /gamenode\.app|sig=|oauth_query|ba_param|cookie=|access_token=/,
        );
        expect(prompt).not.toContain("{{");
        if (client === "claude" || client === "chatgpt")
          expect(prompt).toContain(i18n.t("mcp.hostedPrompt"));
      }
      for (const scope of [
        "games:read",
        "library:read",
        "library:write",
        "reviews:write",
        "posts:write",
        "openid",
        "profile",
        "offline_access",
      ]) {
        expect(
          i18n.exists(`mcp.scopeDescriptions.${scope.replace(":", "_")}`, {
            lng: language,
            fallbackLng: false,
          }),
        ).toBe(true);
      }
    },
  );
});
