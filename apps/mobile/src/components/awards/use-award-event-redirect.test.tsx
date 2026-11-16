// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AwardsService, type AwardsEventDto } from "@repo/wrapper/server";
import { useAwardEventRedirect } from "../../../../../packages/ui/src/components/awards/hooks/useAwardEventRedirect";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

function event(phase: string): AwardsEventDto {
  return {
    id: 12,
    year: 2026,
    phase,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    resultsDate: "2026-12-27T00:00:00.000Z",
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as AwardsEventDto;
}

function createWrapper(push: (route: string) => Promise<void>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <UIProvider
          hooks={{
            useRouter: () => ({
              pathname: "/awards/2026",
              asPath: "/awards/2026",
              back: () => {},
              push,
              query: new URLSearchParams(),
            }),
          }}
        >
          {children}
        </UIProvider>
      </QueryClientProvider>
    );
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useAwardEventRedirect", () => {
  it.each([
    ["upcoming", "/awards/2026/nominations"],
    ["nominations", "/awards/2026/nominations"],
    ["nominations_closed", "/awards/2026/nominations"],
    ["voting", "/awards/2026/vote"],
    ["voting_closed", "/awards/2026/vote"],
    ["results", "/awards/2026/result"],
  ])("sends /awards/2026 to the %s screen", async (phase, target) => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetEventsByYearV1",
    ).mockResolvedValue(event(phase));
    const push = vi.fn(async () => {});

    renderHook(() => useAwardEventRedirect(2026), {
      wrapper: createWrapper(push),
    });

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(target, { replace: true }),
    );
  });

  it("does not redirect without an event", async () => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetEventsByYearV1",
    ).mockRejectedValue(new Error("not found"));
    const push = vi.fn(async () => {});

    renderHook(() => useAwardEventRedirect(undefined), {
      wrapper: createWrapper(push),
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(push).not.toHaveBeenCalled();
  });
});
