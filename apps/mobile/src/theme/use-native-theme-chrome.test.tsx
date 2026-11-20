// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppThemeProvider, UIProvider, useAppTheme } from "@repo/ui";
import { createThemePackStore } from "../../../../packages/ui/src/theme/packs/store";
import type { NativeThemeChromeController } from "./native-theme-chrome";
import { NativeThemeChrome } from "./use-native-theme-chrome";

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: () => {},
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

function ThemeSwitch() {
  const [theme, setTheme] = useAppTheme();
  return (
    <button type="button" onClick={() => setTheme("xbox")}>
      {theme}
    </button>
  );
}

function fakeChrome(): NativeThemeChromeController {
  return {
    apply: vi.fn(async () => {}),
    flush: vi.fn(async () => {}),
  };
}

afterEach(() => {
  cleanup();
});

describe("useNativeThemeChrome", () => {
  it("applies the current theme and follows a switch", async () => {
    const chrome = fakeChrome();

    render(
      <UIProvider hooks={hooks} presenters={{}}>
        <AppThemeProvider
          initialTheme="gamenode"
          hasSupporterThemeAccess
          themeStorage={null}
          packStore={createThemePackStore()}
        >
          <NativeThemeChrome controller={chrome} />
          <ThemeSwitch />
        </AppThemeProvider>
      </UIProvider>,
    );

    expect(chrome.apply).toHaveBeenCalledWith("gamenode");

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(chrome.apply).toHaveBeenLastCalledWith("xbox"));
  });
});
