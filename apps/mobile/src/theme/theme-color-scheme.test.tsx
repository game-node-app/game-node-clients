// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import {
  AppThemeProvider,
  useAppTheme,
} from "../../../../packages/ui/src/theme/AppThemeProvider";
import { createThemeColorSchemeManager } from "../../../../packages/ui/src/theme/colorSchemeManager";
import { ThemeColorSchemeSync } from "../../../../packages/ui/src/theme/ThemeColorSchemeSync";
import { ThemeOverlayHost } from "../../../../packages/ui/src/theme/ThemeOverlayHost";
import {
  getThemeCatalogEntry,
  type ThemeCatalogEntry,
  type ThemeId,
} from "../../../../packages/ui/src/theme/generated/catalog";
import { createThemePackStore } from "../../../../packages/ui/src/theme/packs/store";
import type { ThemeCatalog } from "../../../../packages/ui/src/theme/runtime";
import {
  applyThemeColorSchemeToDocument,
  IONIC_DARK_PALETTE_CLASS,
  IonicPaletteSync,
} from "./ionic-palette";

const lightEntry: ThemeCatalogEntry = {
  ...getThemeCatalogEntry("gamenode"),
  id: "test-light" as ThemeId,
  labelKey: "settings.appearance.theme.gamenode",
  isDefault: false,
  colorScheme: "light",
  screens: "test-light-screens",
};

const testCatalog: ThemeCatalog = {
  defaultId: "gamenode",
  isThemeId: (value): value is ThemeId =>
    value === "gamenode" || value === "test-light",
  get: (id) =>
    id === "test-light" ? lightEntry : getThemeCatalogEntry("gamenode"),
};

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: () => {},
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const root = () => document.documentElement;

function Switcher() {
  const [, setTheme] = useAppTheme();
  return (
    <>
      <button type="button" onClick={() => setTheme("test-light" as ThemeId)}>
        to-light
      </button>
      <button type="button" onClick={() => setTheme("gamenode")}>
        to-dark
      </button>
    </>
  );
}

function Overlay() {
  return <span>overlay:content</span>;
}

function renderApp(
  catalog: ThemeCatalog = testCatalog,
  packStore = createThemePackStore({
    screens: {
      "test-light-screens": async () => ({
        presenters: {},
        shell: { overlay: Overlay },
      }),
    },
  }),
) {
  return render(
    <MantineProvider
      defaultColorScheme="dark"
      colorSchemeManager={createThemeColorSchemeManager({ catalog })}
    >
      <UIProvider hooks={hooks} presenters={{}}>
        <AppThemeProvider
          catalog={catalog}
          packStore={packStore}
          hasSupporterThemeAccess
          suspendOnInitialPack={false}
        >
          <ThemeColorSchemeSync catalog={catalog} />
          <IonicPaletteSync catalog={catalog} />
          <ThemeOverlayHost />
          <Switcher />
        </AppThemeProvider>
      </UIProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  // jsdom has no matchMedia; Mantine's color scheme hooks read it.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  root().removeAttribute("data-theme");
  root().removeAttribute("data-theme-ssr");
  root().removeAttribute("data-mantine-color-scheme");
  root().classList.remove(IONIC_DARK_PALETTE_CLASS);
});

afterEach(() => {
  cleanup();
});

describe("theme driven color scheme", () => {
  it("manager reads the active theme's scheme and never persists", () => {
    const manager = createThemeColorSchemeManager({ catalog: testCatalog });

    expect(manager.get("dark")).toBe("dark");
    root().dataset.theme = "test-light";
    expect(manager.get("dark")).toBe("light");
    root().dataset.theme = "unknown";
    expect(manager.get("dark")).toBe("dark");

    manager.set("light");
    expect(window.localStorage.length).toBe(0);
  });

  it("follows the theme between dark and light", async () => {
    renderApp();
    expect(root().dataset.mantineColorScheme).toBe("dark");
    expect(root().classList.contains(IONIC_DARK_PALETTE_CLASS)).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByText("to-light"));
    });
    expect(root().dataset.theme).toBe("test-light");
    expect(root().dataset.mantineColorScheme).toBe("light");
    expect(root().classList.contains(IONIC_DARK_PALETTE_CLASS)).toBe(false);

    await act(async () => {
      fireEvent.click(screen.getByText("to-dark"));
    });
    expect(root().dataset.mantineColorScheme).toBe("dark");
    expect(root().classList.contains(IONIC_DARK_PALETTE_CLASS)).toBe(true);
  });

  it("starts light when the document already carries a light theme", () => {
    root().dataset.theme = "test-light";
    render(
      <MantineProvider
        defaultColorScheme="dark"
        colorSchemeManager={createThemeColorSchemeManager({
          catalog: testCatalog,
        })}
      >
        <span>child</span>
      </MantineProvider>,
    );

    expect(root().dataset.mantineColorScheme).toBe("light");
  });

  it("applies the scheme to the document before React renders", () => {
    applyThemeColorSchemeToDocument("test-light", testCatalog);
    expect(root().dataset.mantineColorScheme).toBe("light");
    expect(root().classList.contains(IONIC_DARK_PALETTE_CLASS)).toBe(false);

    applyThemeColorSchemeToDocument("gamenode", testCatalog);
    expect(root().dataset.mantineColorScheme).toBe("dark");
    expect(root().classList.contains(IONIC_DARK_PALETTE_CLASS)).toBe(true);
  });

  it("renders the active pack's overlay slot", async () => {
    renderApp();
    expect(screen.queryByText("overlay:content")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByText("to-light"));
    });
    expect(await screen.findByText("overlay:content")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText("to-dark"));
    });
    expect(screen.queryByText("overlay:content")).toBeNull();
  });
});
