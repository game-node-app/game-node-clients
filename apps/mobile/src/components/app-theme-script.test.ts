// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { getNextRovingIndex } from "../../../../packages/ui/src/components/theme/console/consoleRowNavigation";
import {
  APP_THEME_SCRIPT,
  APP_THEME_STORAGE_KEY,
} from "../../../../packages/ui/src/components/theme/useAppTheme";

const runWith = (stored: string | null) => {
  if (stored == null) localStorage.removeItem(APP_THEME_STORAGE_KEY);
  else localStorage.setItem(APP_THEME_STORAGE_KEY, stored);
  new Function(APP_THEME_SCRIPT)();
  return document.documentElement.dataset.theme;
};

describe("app theme head script", () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    localStorage.clear();
  });

  it("applies a stored known theme", () => {
    expect(runWith("xbox")).toBe("xbox");
  });

  it("ignores unknown or missing values", () => {
    expect(runWith("<script>")).toBeUndefined();
    expect(runWith(null)).toBeUndefined();
  });
});

describe("console row navigation", () => {
  it("moves within bounds and ignores other keys", () => {
    expect(getNextRovingIndex(0, "ArrowRight", 3)).toBe(1);
    expect(getNextRovingIndex(2, "ArrowRight", 3)).toBe(2);
    expect(getNextRovingIndex(0, "ArrowLeft", 3)).toBe(0);
    expect(getNextRovingIndex(1, "End", 3)).toBe(2);
    expect(getNextRovingIndex(2, "Home", 3)).toBe(0);
    expect(getNextRovingIndex(1, "Enter", 3)).toBeNull();
    expect(getNextRovingIndex(0, "ArrowRight", 0)).toBeNull();
  });
});
