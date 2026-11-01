// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { McpGuideScreen } from "../../../../../packages/ui/src/components/mcp/McpGuideScreen";
import { McpCopy } from "../../../../../packages/ui/src/components/mcp/McpCopy";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";
import { MCP_CLIENTS } from "../../../../../packages/ui/src/components/mcp/connection";
import { createI18nInstance } from "@repo/locales";
import { renderMcp, setupDom } from "./testUtils";
vi.mock(
  "../../../../../packages/ui/src/components/general/GameNodeLogo",
  () => ({ GameNodeLogo: () => null }),
);
beforeEach(() => {
  setupDom();
  setProjectContext({
    client: "mobile",
    serverUrl: "https://staging.example/base/",
    searchUrl: "",
    s3BucketUrl: "",
  });
});
afterEach(cleanup);
describe("public shared MCP guide", () => {
  it.each(["en", "pt-BR"] as const)(
    "shows each client's instructions and documentation in %s without auth",
    (language) => {
      const t = createI18nInstance({ language }).t;
      renderMcp(<McpGuideScreen />, language);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        t("mcp.title"),
      );
      for (const [key, client] of Object.entries(MCP_CLIENTS)) {
        fireEvent.click(screen.getByRole("button", { name: client.name }));
        expect(screen.getByRole("region", { name: client.name })).toBeTruthy();
        expect(
          screen
            .getByRole("link", { name: `${t("mcp.docs")} — ${client.name}` })
            .getAttribute("href"),
        ).toBe(client.docs);
        expect(
          screen.getAllByText(/https:\/\/staging.example\/base\/v1\/mcp/)
            .length,
        ).toBeGreaterThan(0);
        if (key === "claude" || key === "chatgpt")
          expect(
            screen.getByText(
              t(key === "claude" ? "mcp.claudeSteps" : "mcp.chatgptSteps"),
            ),
          ).toBeTruthy();
      }
      expect(
        screen.getByRole("link", { name: t("mcp.openClaude") }),
      ).toBeTruthy();
      expect(
        screen.getByRole("link", { name: t("mcp.openChatgpt") }),
      ).toBeTruthy();
    },
  );
  it("copies the selected hosted prompt with guided setup and read-only verification", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderMcp(<McpGuideScreen />);
    fireEvent.click(screen.getByRole("button", { name: "ChatGPT" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));
    await screen.findByText("Copied");
    expect(writeText.mock.calls[0][0]).toContain("provider’s graphical setup");
    expect(writeText.mock.calls[0][0]).toContain("Do not change my library");
    fireEvent.click(screen.getByRole("button", { name: "Claude Code" }));
    expect(screen.queryByText("Copied")).toBeNull();
  });
  it("keeps manual provider instructions visible when launching fails", async () => {
    const openExternal = vi
      .fn()
      .mockRejectedValue(new Error("browser unavailable"));
    renderMcp(<McpGuideScreen openExternal={openExternal} />);
    fireEvent.click(screen.getByRole("button", { name: "Open ChatGPT" }));
    await screen.findByRole("alert");
    expect(openExternal).toHaveBeenCalledWith(MCP_CLIENTS.chatgpt.launch);
    expect(
      screen.getByRole("link", { name: MCP_CLIENTS.chatgpt.launch }),
    ).toBeTruthy();
    expect(screen.getByText(/Opening the provider starts setup/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open Claude.ai" }));
    await waitFor(() =>
      expect(openExternal).toHaveBeenCalledWith(MCP_CLIENTS.claude.launch),
    );
  });
});
describe("clipboard feedback", () => {
  it("shows success only after writing completes", async () => {
    let resolve!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderMcp(<McpCopy value="public config" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.queryByText("Copied")).toBeNull();
    resolve();
    await screen.findByText("Copied");
    expect(writeText).toHaveBeenCalledWith("public config");
  });
  it.each(["denied", "unavailable", "throws"])(
    "exposes selectable exact content on %s clipboard",
    async (type) => {
      if (type === "unavailable")
        delete (navigator as { clipboard?: unknown }).clipboard;
      else
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText:
              type === "throws"
                ? () => {
                    throw new Error("denied");
                  }
                : vi.fn().mockRejectedValue(new Error("denied")),
          },
        });
      renderMcp(<McpCopy value="public config" />);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      await screen.findByRole("alert");
      expect(
        (
          screen.getByRole("textbox", {
            name: "Content to copy",
          }) as HTMLTextAreaElement
        ).value,
      ).toBe("public config");
      expect(screen.queryByText("Copied")).toBeNull();
    },
  );
});
