// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSupporterCheckoutTracking } from "./useSupporterCheckoutTracking";

const mocks = vi.hoisted(() => ({
  browserAddListener: vi.fn(),
  appAddListener: vi.fn(),
  browserFinished: undefined as (() => void) | undefined,
  appStateChange: undefined as
    | ((state: { isActive: boolean }) => void)
    | undefined,
  removeBrowser: vi.fn(),
  removeApp: vi.fn(),
}));

vi.mock("@repo/ui", () => ({
  SUPPORTER_QUERY_KEYS: { me: ["billing", "me"] },
}));
vi.mock("@capacitor/browser", () => ({
  Browser: { addListener: mocks.browserAddListener },
}));
vi.mock("@capacitor/app", () => ({
  App: { addListener: mocks.appAddListener },
}));

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "SupporterCheckoutTrackingWrapper";
  return Wrapper;
}

function renderTracking(client = createClient()) {
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const hook = renderHook(() => useSupporterCheckoutTracking(), {
    wrapper: createWrapper(client),
  });

  return { client, invalidate, hook };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.browserAddListener.mockImplementation(
    (_event: string, callback: () => void) => {
      mocks.browserFinished = callback;
      return Promise.resolve({ remove: mocks.removeBrowser });
    },
  );
  mocks.appAddListener.mockImplementation(
    (_event: string, callback: (state: { isActive: boolean }) => void) => {
      mocks.appStateChange = callback;
      return Promise.resolve({ remove: mocks.removeApp });
    },
  );
});

afterEach(cleanup);

describe("useSupporterCheckoutTracking", () => {
  it("registers the native browser and app state listeners", () => {
    renderTracking();

    expect(mocks.browserAddListener).toHaveBeenCalledWith(
      "browserFinished",
      expect.any(Function),
    );
    expect(mocks.appAddListener).toHaveBeenCalledWith(
      "appStateChange",
      expect.any(Function),
    );
  });

  it("does not refresh or enter the pending state before a checkout starts", () => {
    const { invalidate, hook } = renderTracking();

    act(() => mocks.browserFinished?.());
    act(() => mocks.appStateChange?.({ isActive: true }));

    expect(invalidate).not.toHaveBeenCalled();
    expect(hook.result.current.pendingCheckout).toBe(false);
  });

  it("refreshes billing status and enters the pending state when the browser finishes", () => {
    const { invalidate, hook } = renderTracking();

    act(() => hook.result.current.onCheckoutStarted());
    act(() => mocks.browserFinished?.());

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["billing", "me"],
    });
    expect(hook.result.current.pendingCheckout).toBe(true);
  });

  it("refreshes on app resume only when the app becomes active", () => {
    const { invalidate, hook } = renderTracking();

    act(() => hook.result.current.onCheckoutStarted());

    act(() => mocks.appStateChange?.({ isActive: false }));
    expect(invalidate).not.toHaveBeenCalled();
    expect(hook.result.current.pendingCheckout).toBe(false);

    act(() => mocks.appStateChange?.({ isActive: true }));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["billing", "me"],
    });
    expect(hook.result.current.pendingCheckout).toBe(true);
  });

  it("removes both native listeners on unmount", async () => {
    const { hook } = renderTracking();

    hook.unmount();

    await waitFor(() => {
      expect(mocks.removeBrowser).toHaveBeenCalledTimes(1);
      expect(mocks.removeApp).toHaveBeenCalledTimes(1);
    });
  });
});
