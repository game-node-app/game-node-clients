// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSettingsModalState } from "../../../../../packages/ui/src/components/settings/hooks/useSettingsModalState";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

function renderSettingsModalState(query: string) {
  const push = vi.fn(async (_url: string, _options?: unknown) => {});
  const wrapper = ({ children }: PropsWithChildren) => (
    <UIProvider
      hooks={{
        useRouter: () => ({
          pathname: "/home",
          asPath: `/home?${query}`,
          back: vi.fn(),
          push,
          query: new URLSearchParams(query),
        }),
      }}
    >
      {children}
    </UIProvider>
  );

  return {
    ...renderHook(() => useSettingsModalState(), { wrapper }),
    push,
  };
}

function pushedHref(push: ReturnType<typeof vi.fn>) {
  return push.mock.calls[0][0] as string;
}

function pushedQuery(push: ReturnType<typeof vi.fn>) {
  const href = pushedHref(push);
  return new URLSearchParams(href.split("?")[1] ?? "");
}

afterEach(cleanup);

describe("useSettingsModalState checkout params", () => {
  it("clears checkout and interval when the Supporter tab is closed", () => {
    const { result, push } = renderSettingsModalState(
      "settings=premium&interval=yearly&checkout=success",
    );

    act(() => result.current.close());

    expect(push).toHaveBeenCalledWith("/home", {
      replace: true,
      shallow: true,
      scroll: false,
    });
  });

  it("clears checkout and interval when switching to another tab", () => {
    const { result, push } = renderSettingsModalState(
      "settings=premium&interval=monthly&checkout=cancel",
    );

    act(() => result.current.select("profile"));

    expect(pushedHref(push)).toBe("/home?settings=profile");
  });

  it("keeps them while navigating inside the Supporter tab", () => {
    const { result, push } = renderSettingsModalState(
      "settings=premium&interval=yearly&checkout=success",
    );

    act(() => result.current.select("premium", "plan"));

    const query = pushedQuery(push);
    expect(query.get("settings")).toBe("premium");
    expect(query.get("section")).toBe("plan");
    expect(query.get("interval")).toBe("yearly");
    expect(query.get("checkout")).toBe("success");
  });

  it("leaves params from other pages untouched", () => {
    const { result, push } = renderSettingsModalState(
      "settings=profile&interval=yearly",
    );

    act(() => result.current.select("notifications"));

    const query = pushedQuery(push);
    expect(query.get("settings")).toBe("notifications");
    expect(query.get("interval")).toBe("yearly");
  });

  it("does not clear an unrelated interval when another tab closes", () => {
    const { result, push } = renderSettingsModalState(
      "settings=profile&interval=yearly",
    );

    act(() => result.current.close());

    expect(pushedHref(push)).toBe("/home?interval=yearly");
  });
});
