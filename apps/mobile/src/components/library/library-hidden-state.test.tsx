// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  FollowService,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { setupDom } from "@/components/mcp/testUtils";
import {
  LibraryHiddenState,
  type LibraryVisibilityProfile,
} from "../../../../../packages/ui/src/components/library/view/LibraryHiddenState";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const session = vi.hoisted(() => ({
  viewerId: "viewer-1" as string | undefined,
}));
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({
      data: session.viewerId ? { user: { id: session.viewerId } } : null,
      isPending: false,
    }),
  },
}));

const OWNER_ID = "owner-1";

function profile(
  overrides: Partial<LibraryVisibilityProfile> = {},
): LibraryVisibilityProfile {
  return {
    userId: OWNER_ID,
    canViewLibrary: true,
    libraryVisibility: ProfileResponseDto.libraryVisibility.PUBLIC,
    ...overrides,
  };
}

function renderState(props: React.ComponentProps<typeof LibraryHiddenState>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MantineProvider>{<LibraryHiddenState {...props} />}</MantineProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  setupDom();
  session.viewerId = "viewer-1";
  vi.spyOn(
    FollowService,
    "followControllerGetFollowerStatusV1",
  ).mockResolvedValue({ isFollowing: false } as never);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.viewerId = "viewer-1";
});

describe("LibraryHiddenState", () => {
  it("explains a private library", () => {
    renderState({
      profile: profile({
        canViewLibrary: false,
        libraryVisibility: ProfileResponseDto.libraryVisibility.PRIVATE,
      }),
    });

    expect(
      screen.getByText("libraryVisibility.empty.privateTitle"),
    ).toBeTruthy();
    expect(
      screen.getByText("libraryVisibility.empty.privateDescription"),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Follow" })).toBeNull();
  });

  it("offers the follow action for a followers-only library", async () => {
    renderState({
      profile: profile({
        canViewLibrary: false,
        libraryVisibility: ProfileResponseDto.libraryVisibility.FOLLOWERS,
      }),
    });

    expect(
      screen.getByText("libraryVisibility.empty.followersTitle"),
    ).toBeTruthy();
    expect(
      screen.getByText("libraryVisibility.empty.followersDescription"),
    ).toBeTruthy();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Follow" })).toBeTruthy(),
    );
  });

  it("does not offer the follow action to a signed-out visitor", () => {
    session.viewerId = undefined;

    renderState({
      profile: profile({
        canViewLibrary: false,
        libraryVisibility: ProfileResponseDto.libraryVisibility.FOLLOWERS,
      }),
    });

    expect(
      screen.getByText("libraryVisibility.empty.followersTitle"),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Follow" })).toBeNull();
  });

  it("renders nothing for an explicit visible profile", () => {
    const { container } = renderState({ profile: profile() });

    expect(screen.queryByTestId("library-hidden-state")).toBeNull();
    expect(container.querySelector("h2")).toBeNull();
  });

  it("falls back to the generic copy when a visible library answered 404", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile() as unknown as ProfileResponseDto);

    renderState({ userId: OWNER_ID });

    await waitFor(() =>
      expect(screen.getByText("libraryVisibility.hidden.title")).toBeTruthy(),
    );
    expect(
      screen.getByText("libraryVisibility.hidden.description"),
    ).toBeTruthy();
  });
});
