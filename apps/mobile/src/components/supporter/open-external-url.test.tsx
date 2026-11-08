// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import {
  UIProvider,
  useOpenExternalUrl,
} from "../../../../../packages/ui/src/context/UIProvider";
import type { UIHookRegistry } from "../../../../../packages/ui/src/context/registry";
import { Browser } from "@capacitor/browser";
import { UI_HOOK_REGISTRY } from "../registry";

vi.mock("@capacitor/browser", () => ({
  Browser: { open: vi.fn() },
}));

function createHooks(overrides: Partial<UIHookRegistry> = {}): UIHookRegistry {
  return {
    useRouter: () => ({
      back: () => {},
      pathname: "",
      push: async () => {},
      query: new URLSearchParams(),
    }),
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useOpenExternalUrl", () => {
  it("defaults to window.location.assign", () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });

    const hook = renderHook(() => useOpenExternalUrl());

    hook.result.current("https://checkout.stripe.com/session");

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/session");
  });

  it("uses the hook injected by the app (mobile Browser.open style)", () => {
    const openExternalUrl = vi.fn(async () => {});
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UIProvider hooks={createHooks({ openExternalUrl })}>
        {children}
      </UIProvider>
    );

    const hook = renderHook(() => useOpenExternalUrl(), { wrapper });

    hook.result.current("https://billing.stripe.com/portal");

    expect(openExternalUrl).toHaveBeenCalledTimes(1);
    expect(openExternalUrl).toHaveBeenCalledWith(
      "https://billing.stripe.com/portal",
    );
  });

  it("opens checkout URLs with the mobile Browser.open override", async () => {
    await UI_HOOK_REGISTRY.openExternalUrl?.(
      "https://checkout.stripe.com/session",
    );

    expect(Browser.open).toHaveBeenCalledTimes(1);
    expect(Browser.open).toHaveBeenCalledWith({
      url: "https://checkout.stripe.com/session",
    });
  });
});
