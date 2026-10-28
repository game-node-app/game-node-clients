// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import {
  ApiError,
  OwnUserConnectionDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { UIProvider } from "@repo/ui";
import { ImporterPlatform } from "../../../../../../packages/ui/src/components/importer/view/ImporterPlatform";
import { PreferencesConnectionItem as WebPreferencesConnectionItem } from "../../../../../../packages/ui/src/components/preferences/handlers/connections/PreferencesConnectionItem";
import MobilePreferencesConnectionItem from "./PreferencesConnectionItem";
import AppUrlListener from "../../general/AppUrlListener";
import { getCommonRoutes } from "../../../pages/routes/getCommonRoutes";
import enTranslations from "../../../../../../packages/locales/src/translations/json/en.json";

const mocks = vi.hoisted(() => ({
  ownConnection: {
    data: undefined as OwnUserConnectionDto | undefined,
    error: null as Error | null,
    isLoading: false,
  },
  push: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  closeBrowser: vi.fn(),
}));

vi.mock(
  "../../../../../../packages/ui/src/components/connections/hooks/useOwnUserConnectionByType",
  () => ({
    useOwnUserConnectionByType: () => mocks.ownConnection,
  }),
);

vi.mock("@capacitor/app", () => ({
  App: { addListener: mocks.addListener },
}));
vi.mock("@capacitor/browser", () => ({
  Browser: { close: mocks.closeBrowser },
}));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<Record<string, any>>("react-router-dom");
  return {
    ...actual,
    useHistory: () => ({ push: mocks.push }),
  };
});

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, any>) => {
      const parts = key.split(".");
      let val: any = enTranslations;
      for (const p of parts) {
        val = val?.[p];
      }
      if (typeof val === "string") {
        return val.replace(/\{\{(\w+)\}\}/g, (_, k) => options?.[k] ?? `{{${k}}}`);
      }
      return key;
    },
    i18n: { language: "en" },
  }),
}));

const MockLink = ({ children, ...props }: any) => <a {...props}>{children}</a>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={createTestQueryClient()}>
        <MantineProvider>
          <UIProvider presenters={{ Link: MockLink }} hooks={{} as any}>
            {ui}
          </UIProvider>
        </MantineProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ownConnection.data = undefined;
  mocks.ownConnection.error = null;
  mocks.ownConnection.isLoading = false;
  mocks.push.mockResolvedValue(undefined);
  mocks.addListener.mockResolvedValue({ remove: mocks.removeListener });
  mocks.closeBrowser.mockResolvedValue(undefined);

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Task 4.1: ImporterPlatform", () => {
  it("renders positive unprocessedCount and formatted lastSyncedAt", () => {
    const conn: OwnUserConnectionDto = {
      id: 1,
      type: OwnUserConnectionDto.type.STEAM,
      sourceUserId: "steam-1",
      sourceUsername: "GamerOne",
      authStatus: OwnUserConnectionDto.authStatus.CONNECTED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
      unprocessedCount: 15,
      lastSyncedAt: "2026-10-25T14:30:00Z",
    };

    renderWithProviders(<ImporterPlatform connection={conn} />);

    expect(screen.getByText("15 games available")).toBeTruthy();
    expect(screen.getByText(/Last synced/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Import" })).toBeTruthy();
    expect(screen.queryByText(/Reconnection required/i)).toBeNull();
  });

  it("renders zero count without fake sync date when lastSyncedAt is null", () => {
    const conn: OwnUserConnectionDto = {
      id: 2,
      type: OwnUserConnectionDto.type.XBOX,
      sourceUserId: "xbox-1",
      sourceUsername: "XboxUser",
      authStatus: OwnUserConnectionDto.authStatus.CONNECTED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
      unprocessedCount: 0,
      lastSyncedAt: null,
    };

    renderWithProviders(<ImporterPlatform connection={conn} />);

    expect(screen.getByText("All caught up (0 pending)")).toBeTruthy();
    expect(screen.queryByText(/Last synced/i)).toBeNull();
  });

  it("omits count badge when unprocessedCount is undefined", () => {
    const conn: OwnUserConnectionDto = {
      id: 3,
      type: OwnUserConnectionDto.type.PSN,
      sourceUserId: "psn-1",
      sourceUsername: "PsnUser",
      authStatus: OwnUserConnectionDto.authStatus.CONNECTED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
      unprocessedCount: undefined,
      lastSyncedAt: null,
    };

    renderWithProviders(<ImporterPlatform connection={conn} />);

    expect(screen.queryByText(/games available/i)).toBeNull();
    expect(screen.queryByText(/pending/i)).toBeNull();
  });

  it("renders reauthRequired badge and Reconnect button when authStatus is REAUTH_REQUIRED", () => {
    const conn: OwnUserConnectionDto = {
      id: 4,
      type: OwnUserConnectionDto.type.STEAM,
      sourceUserId: "steam-4",
      sourceUsername: "GamerExpired",
      authStatus: OwnUserConnectionDto.authStatus.REAUTH_REQUIRED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
      unprocessedCount: 5,
      lastSyncedAt: "2026-10-20T10:00:00Z",
    };

    renderWithProviders(<ImporterPlatform connection={conn} />);

    expect(screen.getByText("Reconnection required")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reconnect" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Import" })).toBeNull();
  });
});

describe("Task 4.2 & 4.3: PreferencesConnectionItem (Web & Mobile)", () => {
  it("Web: displays username, status, Configure button, and Import games CTA for eligible connected account", () => {
    mocks.ownConnection.data = {
      id: 1,
      type: OwnUserConnectionDto.type.STEAM,
      sourceUserId: "steam-1",
      sourceUsername: "SteamMaster",
      authStatus: OwnUserConnectionDto.authStatus.CONNECTED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
    };

    renderWithProviders(
      <WebPreferencesConnectionItem type={UserConnectionDto.type.STEAM} />,
    );

    expect(screen.getByText("SteamMaster")).toBeTruthy();
    expect(screen.getByText("Connected")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Configure" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Import games" })).toBeTruthy();
  });

  it("Mobile: displays username, status, Configure button, and Import games CTA for eligible connected account", () => {
    mocks.ownConnection.data = {
      id: 2,
      type: OwnUserConnectionDto.type.XBOX,
      sourceUserId: "xbox-1",
      sourceUsername: "XboxChampion",
      authStatus: OwnUserConnectionDto.authStatus.CONNECTED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
    };

    renderWithProviders(
      <MobilePreferencesConnectionItem type={UserConnectionDto.type.XBOX} />,
    );

    expect(screen.getByText("XboxChampion")).toBeTruthy();
    expect(screen.getByText("Connected")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Configure" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Import games" })).toBeTruthy();
  });

  it("shows Reconnect button and no Import games CTA when REAUTH_REQUIRED", () => {
    mocks.ownConnection.data = {
      id: 3,
      type: OwnUserConnectionDto.type.STEAM,
      sourceUserId: "steam-3",
      sourceUsername: "NeedsAuth",
      authStatus: OwnUserConnectionDto.authStatus.REAUTH_REQUIRED,
      isImporterViable: true,
      isImporterWatchViable: false,
      isPlaytimeImportViable: true,
      isAchievementImportViable: true,
      isAutoImportEnabled: false,
      autoImportCollection: null,
      autoImportCollectionId: null,
      profileUserId: "u1",
    };

    renderWithProviders(
      <MobilePreferencesConnectionItem type={UserConnectionDto.type.STEAM} />,
    );

    expect(screen.getByText("Reconnect required")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reconnect" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Import games" })).toBeNull();
  });

  it("shows lookup error message and does not confirm disconnection when query fails with 500", () => {
    mocks.ownConnection.data = undefined;
    mocks.ownConnection.error = new ApiError(
      { method: "GET", url: "/v1/connections/own/steam" },
      { url: "", ok: false, status: 500, statusText: "Internal Server Error", body: { message: "Internal DB error" } },
      "Internal DB error",
    );

    renderWithProviders(
      <WebPreferencesConnectionItem type={UserConnectionDto.type.STEAM} />,
    );

    expect(screen.getByText("Internal DB error")).toBeTruthy();
    expect(screen.queryByText("Not connected")).toBeNull();
  });
});

describe("Task 5.1 & 5.2: Navigation and deep linking", () => {
  it("Task 5.1: registers preferences category route before generic preferences route", () => {
    const routes = getCommonRoutes("/home");
    const categoryRoute = routes.find(
      (r: any) => r.props.path === "/home/preferences/:category",
    );
    const genericRoute = routes.find(
      (r: any) => r.props.path === "/home/preferences",
    );

    expect(categoryRoute).toBeTruthy();
    expect(genericRoute).toBeTruthy();

    const categoryIdx = routes.indexOf(categoryRoute);
    const genericIdx = routes.indexOf(genericRoute);
    expect(categoryIdx).toBeLessThan(genericIdx);
  });

  it("Task 5.2: navigates in active tab when callback deep link arrives outside home", async () => {
    // Set active tab to explore
    window.history.replaceState({}, "", "/explore/some-page");

    render(<AppUrlListener />);
    const listener = mocks.addListener.mock.calls[0]?.[1];
    const query = new URLSearchParams({
      state: "state-123",
      code: "auth-code-xyz",
    });

    listener({
      url: `https://gamenode.app/connections/callback/xbox?${query}`,
    });

    // Deep link preserves the active /explore tab prefix, query params, and closes browser!
    expect(mocks.push).toHaveBeenCalledWith(
      `/explore/connections/callback/xbox?${query}`,
    );
    expect(mocks.closeBrowser).toHaveBeenCalledTimes(1);

    cleanup();
    await waitFor(() => expect(mocks.removeListener).toHaveBeenCalled());
  });
});
