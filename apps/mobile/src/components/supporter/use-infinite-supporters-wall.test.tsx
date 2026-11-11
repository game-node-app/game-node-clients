// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SupportersService,
  type PaginatedSupportersResponseDto,
} from "@repo/wrapper/server";
import { useInfiniteSupportersWall } from "../../../../../packages/ui/src/components/supporter/hooks/useInfiniteSupportersWall";

function wallPage(
  offset: number,
  hasNextPage: boolean,
): PaginatedSupportersResponseDto {
  return {
    data: [
      {
        userId: `user-${offset}`,
        username: `user-${offset}`,
        avatar: null,
      },
    ],
    pagination: { totalItems: 200, totalPages: 5, hasNextPage },
  };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useInfiniteSupportersWall", () => {
  it("advances offsets by limit and stops after the last page", async () => {
    const request = vi
      .spyOn(SupportersService, "supportersControllerGetWallV1")
      .mockImplementation(((offset = 0) =>
        Promise.resolve(
          wallPage(offset, offset === 0),
        )) as unknown as typeof SupportersService.supportersControllerGetWallV1);

    const hook = renderHook(() => useInfiniteSupportersWall({ limit: 48 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(hook.result.current.queryKey).toEqual(["supporters", "wall", 48]);
    expect(request).toHaveBeenNthCalledWith(1, 0, 48);

    await act(async () => {
      await hook.result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(hook.result.current.data?.pages).toHaveLength(2),
    );
    expect(request).toHaveBeenNthCalledWith(2, 48, 48);

    await waitFor(() => expect(hook.result.current.hasNextPage).toBe(false));
  });

  it("offers no next page when the first page is the last one", async () => {
    const request = vi
      .spyOn(SupportersService, "supportersControllerGetWallV1")
      .mockResolvedValue(wallPage(0, false));

    const hook = renderHook(() => useInfiniteSupportersWall({ limit: 24 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(request).toHaveBeenCalledWith(0, 24);
    expect(hook.result.current.hasNextPage).toBe(false);
  });
});
