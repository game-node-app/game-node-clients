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
  ruins: "settings.appearance.theme.ruins",
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
  window.localStorage.removeItem("gn-ruins-prefs");
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

  it("lists Ruins in the special themes with a New badge and the disclaimer", () => {
    renderTab();
    const option = radio(LABELS.ruins);

    expect(option.hasAttribute("disabled")).toBe(false);
    expect(
      within(option).getByText("settings.appearance.theme.ruinsDescription"),
    ).toBeTruthy();
    expect(within(option).getByText("settings.badges.new")).toBeTruthy();
    expect(
      screen.getByText("settings.appearance.theme.ruinsDisclaimer"),
    ).toBeTruthy();
    // Ruins is a Supporter theme: it lives in the special themes group.
    const group = screen.getByRole("radiogroup", {
      name: "settings.appearance.specialThemes.title",
    });
    expect(within(group).getByRole("radio", { name: /theme\.ruins/ })).toBe(
      option,
    );
  });

  it("locks Ruins without Supporter access", () => {
    const storage = renderTab(fakeStorage(), false);
    const option = radio(LABELS.ruins);

    expect(option.hasAttribute("disabled")).toBe(true);
    expect(
      within(option).getByText("settings.appearance.theme.supporterOnly"),
    ).toBeTruthy();

    fireEvent.click(option);
    expect(storage.set).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe("gamenode");
  });

  it("selects Ruins for Supporters", () => {
    const storage = renderTab();

    fireEvent.click(radio(LABELS.ruins));

    expect(storage.set).toHaveBeenCalledWith("ruins");
    expect(isChecked(LABELS.ruins)).toBe(true);
    expect(isChecked(LABELS.dark)).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("ruins");
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

describe("SettingsAppearanceTab Ruins options", () => {
  const OPTIONS_TITLE = "settings.appearance.ruins.title";
  const PREFS_KEY = "gn-ruins-prefs";

  function savedPreferences() {
    return JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}");
  }

  it("hides the options while GameNode is active", () => {
    renderTab(fakeStorage("gamenode"));

    expect(screen.queryByText(OPTIONS_TITLE)).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("shows the options once Ruins is active and hides them again", () => {
    renderTab();
    expect(screen.queryByText(OPTIONS_TITLE)).toBeNull();

    fireEvent.click(radio(LABELS.ruins));
    expect(screen.getByText(OPTIONS_TITLE)).toBeTruthy();

    fireEvent.click(radio(LABELS.dark));
    expect(screen.queryByText(OPTIONS_TITLE)).toBeNull();
  });

  it("shows the options for a saved Ruins preference", () => {
    renderTab(fakeStorage("ruins"));

    expect(screen.getByText(OPTIONS_TITLE)).toBeTruthy();
  });

  it("persists the paper texture and scanline switches", () => {
    renderTab(fakeStorage("ruins"));
    const paper = screen.getByRole("switch", {
      name: "settings.appearance.ruins.paperTexture.title",
    }) as HTMLInputElement;
    const scanline = screen.getByRole("switch", {
      name: "settings.appearance.ruins.scanline.title",
    }) as HTMLInputElement;

    expect(paper.checked).toBe(true);
    expect(scanline.checked).toBe(false);

    fireEvent.click(paper);
    fireEvent.click(scanline);

    expect(paper.checked).toBe(false);
    expect(scanline.checked).toBe(true);
    expect(savedPreferences()).toMatchObject({
      paperTexture: false,
      scanline: true,
    });
  });

  it("changes the boot animation with the segmented control", () => {
    renderTab(fakeStorage("ruins"));

    fireEvent.click(
      screen.getByLabelText("settings.appearance.ruins.bootAnimation.never"),
    );
    expect(savedPreferences().bootAnimation).toBe("never");

    fireEvent.click(
      screen.getByLabelText("settings.appearance.ruins.bootAnimation.always"),
    );
    expect(savedPreferences().bootAnimation).toBe("always");
  });
});
