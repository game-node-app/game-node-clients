// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSupporterSettingsHref } from "../../../../../packages/ui/src/components/supporter/util/useSupporterSettingsHref";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

function createWrapper(supporterSettingsHref?: string) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <UIProvider
        hooks={{
          useRouter: () => ({
            pathname: "/",
            asPath: "/",
            back: vi.fn(),
            push: async () => {},
            query: new URLSearchParams(),
          }),
          supporterSettingsHref,
        }}
      >
        {children}
      </UIProvider>
    );
  };
}

afterEach(cleanup);

describe("useSupporterSettingsHref", () => {
  it("returns the registry value when the app defines one", () => {
    const { result } = renderHook(() => useSupporterSettingsHref(), {
      wrapper: createWrapper("/preferences/supporter"),
    });

    expect(result.current).toBe("/preferences/supporter");
  });

  it("falls back to the canonical supporter settings URL", () => {
    const { result } = renderHook(() => useSupporterSettingsHref(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe("/home?settings=premium");
  });
});
