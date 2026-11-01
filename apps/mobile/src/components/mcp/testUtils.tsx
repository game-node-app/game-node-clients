import React from "react";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";

export function setupDom() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
  });
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
  });
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  HTMLElement.prototype.scrollIntoView = vi.fn();
}
export function renderMcp(
  children: React.ReactNode,
  language: "en" | "pt-BR" = "en",
) {
  return render(
    <I18nProvider language={language}>
      <MantineProvider>{children}</MantineProvider>
    </I18nProvider>,
  );
}
export function signedQuery() {
  const query = new URLSearchParams({
    client_id: "https://client.example/metadata.json",
    scope: "games:read library:read",
    redirect_uri: "http://127.0.0.1:1234/callback",
    state: "state-secret",
    code_challenge: "challenge-secret",
    code_challenge_method: "S256",
    exp: "9999999999999",
    ba_iat: "1234567890",
  });
  query.append("resource", "https://staging.example/v1/mcp");
  query.append("resource", "https://other.example/v1/mcp");
  for (const key of [...query.keys(), "ba_param"])
    query.append("ba_param", key);
  query.append("sig", "signature-secret");
  return query;
}
