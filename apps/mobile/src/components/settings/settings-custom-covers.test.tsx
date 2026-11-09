// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { Query, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileResponseDto, ProfileService } from "@repo/wrapper/server";
import { setupDom } from "@/components/mcp/testUtils";
import { SettingsAppearanceTab } from "../../../../../packages/ui/src/components/settings/tabs/SettingsAppearanceTab";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en", setLanguage: vi.fn() }),
}));

const notifications = vi.hoisted(() => ({ show: vi.fn() }));
vi.mock("@mantine/notifications", () => ({ notifications }));

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

const VIEWER_ID = "viewer";

const LABELS = {
  title: "settings.appearance.customCovers.title",
  any: "settings.appearance.customCovers.any.label",
  preferYours: "settings.appearance.customCovers.prefer_yours.label",
  none: "settings.appearance.customCovers.none.label",
} as const;

const personalizedKey = [
  "game",
  1,
  { relations: { cover: true } },
  { coverContext: { viewer: VIEWER_ID, owner: null, mode: "any" } },
];
const plainGameKey = ["game", 2, { relations: { cover: true } }];

const profile = (customCoverMode?: string) =>
  ({
    userId: VIEWER_ID,
    username: "viewer",
    bio: "",
    avatar: null,
    banner: null,
    usernameLastUpdatedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    avatarVideo: null,
    bannerVideo: null,
    customCoverMode,
  }) as unknown as ProfileResponseDto;

function signIn() {
  mocks.session = { data: { user: { id: VIEWER_ID } }, isPending: false };
}

function signOut() {
  mocks.session = { data: null, isPending: false };
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

function renderTab(client: QueryClient) {
  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <SettingsAppearanceTab />
      </QueryClientProvider>
    </MantineProvider>,
  );
}

function radio(name: string) {
  return screen.getByRole("radio", { name: new RegExp(name) });
}

function isChecked(name: string) {
  return radio(name).getAttribute("aria-checked") === "true";
}

async function renderWithMode(client: QueryClient, mode?: string) {
  const profileSpy = vi
    .spyOn(ProfileService, "profileControllerFindOneByIdV1")
    .mockResolvedValue(profile(mode));
  renderTab(client);
  await waitFor(() => expect(profileSpy).toHaveBeenCalled());
  await waitFor(() =>
    expect(radio(LABELS.any).getAttribute("disabled")).toBeNull(),
  );
  return profileSpy;
}

beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  signIn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  signOut();
});

describe("SettingsAppearanceTab custom cover mode", () => {
  it("shows the profile's current mode as selected", async () => {
    await renderWithMode(createClient(), "prefer_yours");

    expect(isChecked(LABELS.preferYours)).toBe(true);
    expect(isChecked(LABELS.any)).toBe(false);
    expect(isChecked(LABELS.none)).toBe(false);
  });

  it("reads a profile without customCoverMode as mode any", async () => {
    await renderWithMode(createClient(), undefined);

    expect(isChecked(LABELS.any)).toBe(true);
    expect(isChecked(LABELS.preferYours)).toBe(false);
  });

  it("hides the section from signed-out visitors", () => {
    signOut();
    renderTab(createClient());

    expect(screen.queryByText(LABELS.title)).toBeNull();
  });

  it("saves a mode change and invalidates the profile and personalized game queries", async () => {
    const client = createClient();
    client.setQueryData(personalizedKey, { id: 1 });
    client.setQueryData(plainGameKey, { id: 2 });
    let resolveUpdate: (value: unknown) => void = () => {};
    const updateSpy = vi
      .spyOn(ProfileService, "profileControllerUpdateV1")
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          }) as never,
      );
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    await renderWithMode(client, "any");
    fireEvent.click(radio(LABELS.none));

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({ customCoverMode: "none" }),
    );
    // The optimistic update marks the new mode before the server answers.
    await waitFor(() => expect(isChecked(LABELS.none)).toBe(true));

    resolveUpdate(undefined);

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["userProfile", VIEWER_ID],
      }),
    );

    const predicateCall = invalidateSpy.mock.calls.find(
      ([filters]) => typeof filters?.predicate === "function",
    );
    expect(predicateCall).toBeTruthy();
    const predicate = predicateCall![0]!.predicate!;
    expect(predicate({ queryKey: personalizedKey } as unknown as Query)).toBe(
      true,
    );
    expect(predicate({ queryKey: plainGameKey } as unknown as Query)).toBe(
      false,
    );

    expect(client.getQueryState(personalizedKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(plainGameKey)?.isInvalidated).toBe(false);
  });

  it("reverts to the previous mode and shows an error notification when the update fails", async () => {
    const client = createClient();
    vi.spyOn(ProfileService, "profileControllerUpdateV1").mockRejectedValue(
      new Error("update failed"),
    );

    await renderWithMode(client, "prefer_yours");
    fireEvent.click(radio(LABELS.none));

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: "red" }),
      ),
    );
    await waitFor(() => expect(isChecked(LABELS.preferYours)).toBe(true));
    expect(isChecked(LABELS.none)).toBe(false);
  });
});
