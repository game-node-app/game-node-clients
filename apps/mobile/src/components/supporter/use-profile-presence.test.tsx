// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import {
  focusManager,
  notifyManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileService } from "@repo/wrapper/server";
import { useProfilePresence } from "../../../../../packages/ui/src/components/supporter/hooks/useProfilePresence";
import type { UIHookRegistry } from "../../../../../packages/ui/src/context/registry";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function createWrapper(client: QueryClient, isViewActive = true) {
  const hooks: UIHookRegistry = {
    useRouter: () => ({
      pathname: "/profile/user-1",
      asPath: "/profile/user-1",
      back: () => {},
      push: async () => {},
      query: new URLSearchParams(),
    }),
    useIsViewActive: () => isViewActive,
  };

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>
        <UIProvider hooks={hooks}>{children}</UIProvider>
      </QueryClientProvider>
    );
  };
}

const flush = async (ms = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  });
};

const presenceRequest = () =>
  vi
    .spyOn(ProfileService, "profilePresenceControllerGetPresenceV1")
    .mockResolvedValue({ playing: null });

beforeEach(() => {
  vi.useFakeTimers();
  // React Query batches observer notifications on a timer; run them inline so
  // fake-timer tests see the hook result without waiting.
  notifyManager.setScheduler((callback) => callback());
  focusManager.setFocused(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  focusManager.setFocused(undefined);
});

describe("useProfilePresence", () => {
  it("requests once on mount and at most once per 60 seconds", async () => {
    const client = createClient();
    const request = presenceRequest();

    const hook = renderHook(() => useProfilePresence("user-1", true), {
      wrapper: createWrapper(client),
    });

    await flush();

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith("user-1");
    expect(hook.result.current.queryKey).toEqual([
      "profile",
      "presence",
      "user-1",
    ]);

    await flush(59_000);

    expect(request).toHaveBeenCalledTimes(1);

    await flush(2_000);
    await flush();

    expect(request).toHaveBeenCalledTimes(2);
  });

  it("makes no request when the live profile preference is off", async () => {
    const client = createClient();
    const request = presenceRequest();

    renderHook(() => useProfilePresence("user-1", false), {
      wrapper: createWrapper(client),
    });

    await flush();
    await flush(120_000);

    expect(request).not.toHaveBeenCalled();
  });

  it("makes no request while the profile view is not active", async () => {
    const client = createClient();
    const request = presenceRequest();

    renderHook(() => useProfilePresence("user-1", true), {
      wrapper: createWrapper(client, false),
    });

    await flush();
    await flush(120_000);

    expect(request).not.toHaveBeenCalled();
  });

  it("stays disabled without a userId", async () => {
    const client = createClient();
    const request = presenceRequest();

    const hook = renderHook(() => useProfilePresence(undefined, true), {
      wrapper: createWrapper(client),
    });

    await flush();

    expect(request).not.toHaveBeenCalled();
    expect(hook.result.current.queryKey).toEqual(["profile", "presence", null]);
  });
});
