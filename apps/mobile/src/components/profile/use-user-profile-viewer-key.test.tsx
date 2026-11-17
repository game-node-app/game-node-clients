// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileService } from "@repo/wrapper/server";
import type { ProfileResponseDto } from "../../../../../packages/wrapper/src/server";
import {
  getUserProfileQueryKey,
  useUserProfile,
} from "../../../../../packages/ui/src/components/profile/hooks/useUserProfile";

const session = vi.hoisted(() => ({
  viewerId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.viewerId }),
);

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: React.PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

beforeEach(() => {
  session.viewerId = undefined;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.viewerId = undefined;
});

describe("useUserProfile viewer-aware key", () => {
  it("keys the profile read by the viewer, with a null marker while signed out", async () => {
    const findProfile = vi
      .spyOn(ProfileService, "profileControllerFindOneByIdV1")
      .mockResolvedValue({ userId: "user-1" } as unknown as ProfileResponseDto);

    const client = createClient();
    const hook = renderHook(() => useUserProfile("user-1"), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(hook.result.current.queryKey).toEqual([
      "userProfile",
      "user-1",
      null,
    ]);
    expect(
      client.getQueryCache().find({
        queryKey: ["userProfile", "user-1", null],
      }),
    ).toBeDefined();

    session.viewerId = "viewer-1";
    hook.rerender();

    await waitFor(() =>
      expect(hook.result.current.queryKey).toEqual([
        "userProfile",
        "user-1",
        "viewer-1",
      ]),
    );
    expect(
      client.getQueryCache().find({
        queryKey: getUserProfileQueryKey("user-1", "viewer-1"),
      }),
    ).toBeDefined();
    expect(findProfile).toHaveBeenCalledTimes(2);
  });

  it("builds a JSON-serializable key for web SSR dehydration", () => {
    const key = getUserProfileQueryKey("user-1", null);

    expect(JSON.parse(JSON.stringify(key))).toEqual(key);
    expect(key).not.toContain(undefined);
  });
});
