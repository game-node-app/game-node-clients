import { useState } from "react";
import { useTranslation } from "@repo/locales";
import {
  getMcpConnection,
  getMcpPrompt,
  MCP_CLIENTS,
  McpClient,
} from "./connection";

export interface UseMcpGuideOptions {
  openExternal?: (url: string) => Promise<void>;
  /**
   * Client whose instructions are shown first. Web keeps the terminal client (`codex`); phones
   * have no terminal, so mobile preselects a hosted client.
   * @default "codex"
   */
  defaultClient?: McpClient;
}

/**
 * State and launch logic of the MCP guide, shared by the default screen and per-app presenters.
 */
export function useMcpGuide({
  openExternal,
  defaultClient = "codex",
}: UseMcpGuideOptions) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<McpClient>(defaultClient);
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

  return {
    selected,
    setSelected,
    launchError,
    connection,
    client,
    prompt,
    launchProps,
  };
}
