// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSupporterSettingsHref } from "../../../../../packages/ui/src/components/supporter/util/getSupporterSettingsHref";
import { useSupporterEntryHref } from "../../../../../packages/ui/src/components/supporter/util/useSupporterEntryHref";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, isPending: false },
  authPath: "/auth",
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

function wrapper({ children }: PropsWithChildren) {
  return (
    <UIProvider
      hooks={{
        authPath: mocks.authPath,
        useRouter: () => ({
          pathname: "/home",
          asPath: "/home",
          back: vi.fn(),
          push: async () => {},
          query: new URLSearchParams(),
        }),
      }}
    >
      {children}
    </UIProvider>
  );
}

beforeEach(() => {
  mocks.session = { data: null, isPending: false };
  mocks.authPath = "/auth";
});

afterEach(cleanup);

describe("getSupporterSettingsHref", () => {
  it("is the bare settings URL without params", () => {
    expect(getSupporterSettingsHref()).toBe("/home?settings=premium");
    expect(getSupporterSettingsHref({})).toBe("/home?settings=premium");
    expect(getSupporterSettingsHref({ interval: null, checkout: null })).toBe(
      "/home?settings=premium",
    );
  });

  it("adds a valid interval", () => {
    expect(getSupporterSettingsHref({ interval: "monthly" })).toBe(
      "/home?settings=premium&interval=monthly",
    );
    expect(getSupporterSettingsHref({ interval: "yearly" })).toBe(
      "/home?settings=premium&interval=yearly",
    );
  });

  it("adds a valid checkout result", () => {
    expect(getSupporterSettingsHref({ checkout: "success" })).toBe(
      "/home?settings=premium&checkout=success",
    );
    expect(getSupporterSettingsHref({ checkout: "cancel" })).toBe(
      "/home?settings=premium&checkout=cancel",
    );
  });

  it("combines interval and checkout in a stable order", () => {
    expect(
      getSupporterSettingsHref({ interval: "yearly", checkout: "success" }),
    ).toBe("/home?settings=premium&interval=yearly&checkout=success");
  });

  it("ignores values outside the contract", () => {
    expect(
      getSupporterSettingsHref({
        interval: "weekly" as never,
        checkout: "pending" as never,
      }),
    ).toBe("/home?settings=premium");
  });
});

describe("useSupporterEntryHref", () => {
  it("returns the settings href while the session is pending", () => {
    mocks.session = { data: null, isPending: true };

    const { result } = renderHook(() => useSupporterEntryHref("yearly"), {
      wrapper,
    });

    expect(result.current).toBe("/home?settings=premium&interval=yearly");
  });

  it("returns the settings href when signed in", () => {
    mocks.session = { data: { user: { id: "user-1" } }, isPending: false };

    const { result } = renderHook(() => useSupporterEntryHref("monthly"), {
      wrapper,
    });

    expect(result.current).toBe("/home?settings=premium&interval=monthly");
  });

  it("sends a signed-out visitor to sign-in with the settings URL as return target", () => {
    mocks.session = { data: null, isPending: false };

    const { result } = renderHook(() => useSupporterEntryHref("yearly"), {
      wrapper,
    });

    expect(result.current).toBe(
      `/auth?redirectTo=${encodeURIComponent(
        "/home?settings=premium&interval=yearly",
      )}`,
    );
  });

  it("uses the injected auth path", () => {
    mocks.session = { data: null, isPending: false };
    mocks.authPath = "/m/auth";

    const { result } = renderHook(() => useSupporterEntryHref(), {
      wrapper,
    });

    expect(result.current).toBe(
      `/m/auth?redirectTo=${encodeURIComponent("/home?settings=premium")}`,
    );
  });
});
