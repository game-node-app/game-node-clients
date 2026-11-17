// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileResponseDto, ProfileService } from "@repo/wrapper/server";
import { useLibraryVisibilitySetting } from "../../../../../packages/ui/src/components/settings/hooks/useLibraryVisibilitySetting";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const notifications = vi.hoisted(() => ({ show: vi.fn() }));
vi.mock("@mantine/notifications", () => ({ notifications }));

const VIEWER_ID = "viewer-1";
const PROFILE_KEY = ["userProfile", VIEWER_ID, VIEWER_ID];
const LIBRARY_KEY = ["library", VIEWER_ID, VIEWER_ID];

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: VIEWER_ID } },
      isPending: false,
    }),
  },
}));

function profile(libraryVisibility?: string) {
  return {
    userId: VIEWER_ID,
    username: "viewer",
    libraryVisibility,
    canViewLibrary: true,
    customCoverMode: "any",
  } as unknown as ProfileResponseDto;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: React.PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function renderSetting(client: QueryClient) {
  return renderHook(() => useLibraryVisibilitySetting(), {
    wrapper: createWrapper(client),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useLibraryVisibilitySetting", () => {
  it("reads the stored ceiling, with public as the default", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile(undefined));

    const hook = renderSetting(createClient());

    await waitFor(() => expect(hook.result.current.hasProfile).toBe(true));
    expect(hook.result.current.visibility).toBe("public");
  });

  it("saves the three-value level, optimistically updates the profile and invalidates library reads", async () => {
    let resolveUpdate: (value: unknown) => void = () => {};
    const updateSpy = vi
      .spyOn(ProfileService, "profileControllerUpdateV1")
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          }) as never,
      );
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("public"));

    const client = createClient();
    client.setQueryData(LIBRARY_KEY, { collections: [] });
    const hook = renderSetting(client);

    await waitFor(() => expect(hook.result.current.hasProfile).toBe(true));

    act(() => hook.result.current.setVisibility("private"));

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({ libraryVisibility: "private" }),
    );
    // The select follows the click before the server answers.
    await waitFor(() =>
      expect(
        (
          client.getQueryData(PROFILE_KEY) as
            | { libraryVisibility?: string }
            | undefined
        )?.libraryVisibility,
      ).toBe("private"),
    );

    await act(async () => {
      resolveUpdate(undefined);
    });

    await waitFor(() =>
      expect(client.getQueryState(LIBRARY_KEY)?.isInvalidated).toBe(true),
    );
  });

  it("rolls the profile back and shows an error notification when the update fails", async () => {
    vi.spyOn(ProfileService, "profileControllerUpdateV1").mockRejectedValue(
      new Error("update failed"),
    );
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("followers"));

    const client = createClient();
    const hook = renderSetting(client);

    await waitFor(() => expect(hook.result.current.hasProfile).toBe(true));
    expect(hook.result.current.visibility).toBe("followers");

    act(() => hook.result.current.setVisibility("private"));

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: "red" }),
      ),
    );
    expect(hook.result.current.visibility).toBe("followers");
    expect(
      (
        client.getQueryData(PROFILE_KEY) as
          | { libraryVisibility?: string }
          | undefined
      )?.libraryVisibility,
    ).toBe("followers");
  });
});
