// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setupDom } from "@/components/mcp/testUtils";
import { SettingsAppearanceTab } from "../../../../../packages/ui/src/components/settings/tabs/SettingsAppearanceTab";
import { AppThemeProvider } from "../../../../../packages/ui/src/theme/AppThemeProvider";
import { createThemePackStore } from "../../../../../packages/ui/src/theme/packs/store";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en", setLanguage: vi.fn() }),
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));

const packStore = createThemePackStore();

const LABELS = {
  dark: "settings.appearance.theme.dark",
  light: "settings.appearance.theme.light",
  system: "settings.appearance.theme.system",
  xbox: "settings.appearance.theme.xbox",
  steam: "Steam",
  playstation: "PlayStation",
  nintendo: "Nintendo",
} as const;

function fakeStorage(initial = "gamenode") {
  const storage = {
    value: initial,
    get: () => storage.value,
    set: vi.fn((next: string) => {
      storage.value = next;
    }),
  };
  return storage;
}

function renderTab(storage = fakeStorage(), hasSupporterThemeAccess = true) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <AppThemeProvider
          themeStorage={storage}
          hasSupporterThemeAccess={hasSupporterThemeAccess}
          packStore={packStore}
          suspendOnInitialPack={false}
        >
          <SettingsAppearanceTab />
        </AppThemeProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );

  return storage;
}

function radio(name: string) {
  return screen.getByRole("radio", { name: new RegExp(name) });
}

function isChecked(name: string) {
  return radio(name).getAttribute("aria-checked") === "true";
}

beforeEach(() => {
  setupDom();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsAppearanceTab themes", () => {
  it("locks Xbox without Supporter access, including with a saved preference", () => {
    const storage = renderTab(fakeStorage("xbox"), false);
    const option = radio(LABELS.xbox);

    expect(isChecked(LABELS.dark)).toBe(true);
    expect(option.hasAttribute("disabled")).toBe(true);
    expect(
      within(option).getByText("settings.appearance.theme.supporterOnly"),
    ).toBeTruthy();

    fireEvent.click(option);
    expect(storage.set).not.toHaveBeenCalled();
    expect(storage.get()).toBe("xbox");
    expect(document.documentElement.dataset.theme).toBe("gamenode");
  });

  it("selects Xbox, persists it and moves the current state", () => {
    const storage = renderTab();

    expect(isChecked(LABELS.dark)).toBe(true);
    expect(isChecked(LABELS.xbox)).toBe(false);
    expect(
      within(radio(LABELS.dark)).getByText("settings.badges.current"),
    ).toBeTruthy();

    fireEvent.click(radio(LABELS.xbox));

    expect(storage.set).toHaveBeenCalledWith("xbox");
    expect(isChecked(LABELS.xbox)).toBe(true);
    expect(isChecked(LABELS.dark)).toBe(false);
    expect(
      within(radio(LABELS.xbox)).getByText("settings.badges.current"),
    ).toBeTruthy();
    expect(
      within(radio(LABELS.dark)).queryByText("settings.badges.current"),
    ).toBeNull();
    expect(document.documentElement.dataset.theme).toBe("xbox");
  });

  it("goes back to Dark, restoring gamenode", () => {
    const storage = renderTab();

    fireEvent.click(radio(LABELS.xbox));
    fireEvent.click(radio(LABELS.dark));

    expect(storage.set).toHaveBeenLastCalledWith("gamenode");
    expect(isChecked(LABELS.dark)).toBe(true);
    expect(isChecked(LABELS.xbox)).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("gamenode");
  });

  it("keeps Light, System and the other store themes disabled", () => {
    const storage = renderTab();
    const unavailable = [
      LABELS.light,
      LABELS.system,
      LABELS.steam,
      LABELS.playstation,
      LABELS.nintendo,
    ];

    for (const label of unavailable) {
      const option = radio(label);
      expect(option.getAttribute("disabled")).not.toBeNull();
      expect(option.getAttribute("aria-checked")).toBe("false");
      fireEvent.click(option);
    }

    expect(storage.set).not.toHaveBeenCalled();
    expect(isChecked(LABELS.dark)).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("gamenode");
  });
});
