// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { createI18nInstance } from "@repo/locales";
import { MCP_CLIENTS } from "../../../../../packages/ui/src/components/mcp/connection";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";
import { MobileMcpGuideScreen } from "./MobileMcpGuideScreen";
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

describe("mobile MCP guide", () => {
  it("preselects the hosted client that matches the primary call to action", () => {
    renderMcp(<MobileMcpGuideScreen />, "en", true);
    const claude = screen.getByRole("button", { name: "Claude.ai" });
    expect(claude.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("region", { name: "Claude.ai" })).toBeTruthy();
    // No terminal instructions up front on a phone.
    expect(
      screen.queryByText(/Run these commands in your terminal/),
    ).toBeNull();
  });

  it("lists hosted assistants first and keeps terminal ones in a collapsed disclosure", () => {
    renderMcp(<MobileMcpGuideScreen />, "en", true);
    const names = screen
      .getAllByRole("button", { pressed: false })
      .concat(screen.getAllByRole("button", { pressed: true }))
      .map((button) => button.textContent);
    expect(names).toContain("ChatGPT");
    const disclosure = screen.getByRole("button", {
      name: "Other assistants",
    });
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    // Terminal clients are not exposed until the disclosure is opened.
    expect(screen.queryByRole("button", { name: "Codex" })).toBeNull();
    fireEvent.click(disclosure);
    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Codex" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Claude Code" })).toBeTruthy();
  });

  it("shows the setup heading once, without the protocol eyebrow", () => {
    renderMcp(<MobileMcpGuideScreen />, "en", true);
    expect(screen.getAllByText("Add GameNode — Claude.ai")).toHaveLength(1);
    expect(screen.queryByText("Model Context Protocol")).toBeNull();
  });

  it.each(["en", "pt-BR"] as const)(
    "shows each client's instructions and documentation in %s",
    (language) => {
      const t = createI18nInstance({ language }).t;
      renderMcp(<MobileMcpGuideScreen />, language, true);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        t("mcp.title"),
      );
      fireEvent.click(
        screen.getByRole("button", { name: t("mcp.otherAssistants") }),
      );
      for (const client of Object.values(MCP_CLIENTS)) {
        const picker = screen.getByRole("button", { name: client.name });
        fireEvent.click(picker);
        expect(picker.getAttribute("aria-pressed")).toBe("true");
        expect(picker.getAttribute("aria-controls")).toBe("mcp-instructions");
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
      }
      fireEvent.click(
        screen
          .getAllByRole("button", { name: t("mcp.manual") })
          .find((button) => button.hasAttribute("aria-pressed"))!,
      );
      expect(
        screen.getByRole("region", { name: t("mcp.manual") }),
      ).toBeTruthy();
      expect(
        screen.getByRole("link", { name: t("mcp.openClaude") }),
      ).toBeTruthy();
      expect(
        screen.getByRole("link", { name: t("mcp.openChatgpt") }),
      ).toBeTruthy();
    },
  );

  it("copies the selected hosted prompt", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderMcp(<MobileMcpGuideScreen />, "en", true);
    fireEvent.click(screen.getByRole("button", { name: "ChatGPT" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));
    await screen.findByText("Copied");
    expect(writeText.mock.calls[0][0]).toContain("provider’s graphical setup");
    fireEvent.click(screen.getByRole("button", { name: "Other assistants" }));
    fireEvent.click(screen.getByRole("button", { name: "Claude Code" }));
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("keeps manual instructions visible when launching fails", async () => {
    const openExternal = vi
      .fn()
      .mockRejectedValue(new Error("browser unavailable"));
    renderMcp(<MobileMcpGuideScreen openExternal={openExternal} />);
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
